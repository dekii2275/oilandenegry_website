from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple

import os
import uuid
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.mongo import get_messages_collection
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.store import Store
from app.models.users import User  # ✅ thêm
from app.schemas.messages import (
    MessageSendIn,
    MessageOut,
    ThreadOut,
    ThreadSummaryOut,
    InboxOut,
)

ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}
MAX_IMAGE_MB = 5

router = APIRouter(prefix="/messages", tags=["messages"])


def _oid_str(x) -> str:
    return str(x) if isinstance(x, ObjectId) else str(x)


def _ensure_seller_owns_store(db: Session, store_id: int, seller_user_id: int):
    q = db.query(Store).filter(Store.id == store_id)

    if hasattr(Store, "seller_id"):
        q = q.filter(Store.seller_id == seller_user_id)
    elif hasattr(Store, "user_id"):
        q = q.filter(Store.user_id == seller_user_id)
    elif hasattr(Store, "owner_id"):
        q = q.filter(Store.owner_id == seller_user_id)

    store = q.first()
    if not store:
        raise HTTPException(status_code=403, detail="Bạn không có quyền chat với store này")


def _get_seller_store_ids(db: Session, seller_user_id: int) -> List[int]:
    q = db.query(Store)

    if hasattr(Store, "seller_id"):
        q = q.filter(Store.seller_id == seller_user_id)
    elif hasattr(Store, "user_id"):
        q = q.filter(Store.user_id == seller_user_id)
    elif hasattr(Store, "owner_id"):
        q = q.filter(Store.owner_id == seller_user_id)
    else:
        raise HTTPException(status_code=500, detail="Store model thiếu seller_id/user_id/owner_id")

    return [int(s.id) for s in q.all()]


def _get_customer_info_map(db: Session, customer_ids: List[int]) -> Dict[int, Tuple[Optional[str], Optional[str]]]:
    """
    return { customer_id: (customer_name, customer_avatar_url) }
    customer_name ưu tiên full_name, fallback email.
    """
    if not customer_ids:
        return {}

    rows = (
        db.query(User.id, User.full_name, User.email, User.avatar_url)
        .filter(User.id.in_(list(set(customer_ids))))
        .all()
    )

    out: Dict[int, Tuple[Optional[str], Optional[str]]] = {}
    for r in rows:
        name = (r.full_name or "").strip() or (r.email or "").strip() or None
        out[int(r.id)] = (name, r.avatar_url)
    return out


@router.get("/inbox", response_model=InboxOut)
def get_inbox(
    limit: int = Query(50, ge=1, le=200),
    store_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    SELLER inbox: list các cuộc hội thoại (store_id, customer_id) + last_message
    - Nếu store_id không truyền: lấy tất cả store mà seller sở hữu
    """
    role = str(getattr(current_user, "role", "")).upper()
    if role != "SELLER":
        raise HTTPException(status_code=403, detail="Chỉ SELLER mới xem inbox")

    seller_id = int(getattr(current_user, "id"))

    if store_id is not None:
        _ensure_seller_owns_store(db, int(store_id), seller_id)
        store_ids = [int(store_id)]
    else:
        store_ids = _get_seller_store_ids(db, seller_id)
        if not store_ids:
            return InboxOut(threads=[])

    col = get_messages_collection()

    pipeline: List[Dict[str, Any]] = [
        {"$match": {"store_id": {"$in": store_ids}}},
        {"$sort": {"created_at": -1}},
        {
            "$group": {
                "_id": {"store_id": "$store_id", "customer_id": "$customer_id"},
                "doc": {"$first": "$$ROOT"},
            }
        },
        {"$sort": {"doc.created_at": -1}},
        {"$limit": int(limit)},
    ]

    rows = list(col.aggregate(pipeline))

    # ✅ lấy danh sách customer_id để join Postgres users
    customer_ids: List[int] = []
    for r in rows:
        d = r.get("doc") or {}
        if d.get("customer_id") is not None:
            customer_ids.append(int(d.get("customer_id")))

    customer_map = _get_customer_info_map(db, customer_ids)

    threads: List[ThreadSummaryOut] = []
    for r in rows:
        d = r.get("doc") or {}
        cid = int(d.get("customer_id"))

        msg = MessageOut(
            id=_oid_str(d.get("_id")),
            store_id=int(d.get("store_id")),
            customer_id=cid,
            sender_role=str(d.get("sender_role") or ""),
            sender_id=int(d.get("sender_id") or 0),
            text=d.get("text"),
            image_url=d.get("image_url"),
            created_at=d.get("created_at"),
            product_id=d.get("product_id"),
            order_id=d.get("order_id"),
        )

        cname, cavatar = customer_map.get(cid, (None, None))

        threads.append(
            ThreadSummaryOut(
                store_id=int(d.get("store_id")),
                customer_id=cid,
                customer_name=cname,
                customer_avatar_url=cavatar,
                last_message=msg,
            )
        )

    return InboxOut(threads=threads)


@router.get("/thread", response_model=ThreadOut)
def get_thread(
    store_id: int = Query(...),
    customer_id: Optional[int] = Query(None),
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    role = str(getattr(current_user, "role", "")).upper()

    if role == "CUSTOMER":
        customer_id = int(getattr(current_user, "id"))
    elif role == "SELLER":
        if customer_id is None:
            raise HTTPException(status_code=400, detail="Thiếu customer_id")
        _ensure_seller_owns_store(db, int(store_id), int(getattr(current_user, "id")))
    else:
        raise HTTPException(status_code=403, detail="Không có quyền")

    cid = int(customer_id)

    # ✅ join lấy tên + avatar để UI seller hiển thị header đẹp
    customer_map = _get_customer_info_map(db, [cid])
    cname, cavatar = customer_map.get(cid, (None, None))

    col = get_messages_collection()
    flt = {"store_id": int(store_id), "customer_id": cid}
    cur = col.find(flt).sort("created_at", 1).limit(int(limit))

    msgs: List[MessageOut] = []
    for d in cur:
        msgs.append(
            MessageOut(
                id=_oid_str(d.get("_id")),
                store_id=int(d.get("store_id")),
                customer_id=int(d.get("customer_id")),
                sender_role=str(d.get("sender_role") or ""),
                sender_id=int(d.get("sender_id") or 0),
                text=d.get("text"),
                image_url=d.get("image_url"),
                created_at=d.get("created_at"),
                product_id=d.get("product_id"),
                order_id=d.get("order_id"),
            )
        )

    return ThreadOut(
        store_id=int(store_id),
        customer_id=cid,
        customer_name=cname,
        customer_avatar_url=cavatar,
        messages=msgs,
    )


@router.post("/send", response_model=MessageOut)
def send_message(
    payload: MessageSendIn,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    role = str(getattr(current_user, "role", "")).upper()
    user_id = int(getattr(current_user, "id"))

    store_id = int(payload.store_id)

    if role == "CUSTOMER":
        customer_id = user_id
    elif role == "SELLER":
        if payload.customer_id is None:
            raise HTTPException(status_code=400, detail="Thiếu customer_id")
        customer_id = int(payload.customer_id)
        _ensure_seller_owns_store(db, store_id, user_id)
    else:
        raise HTTPException(status_code=403, detail="Không có quyền")

    text = (payload.text or "").strip()
    image_url = (payload.image_url or "").strip() or None

    if not text and not image_url:
        raise HTTPException(status_code=400, detail="Tin nhắn rỗng (cần text hoặc ảnh)")

    doc = {
        "store_id": store_id,
        "customer_id": customer_id,
        "sender_role": role,
        "sender_id": user_id,
        "text": text if text else None,
        "image_url": image_url,
        "product_id": payload.product_id,
        "order_id": payload.order_id,
        "created_at": datetime.now(timezone.utc),
    }

    col = get_messages_collection()
    ins = col.insert_one(doc)
    doc["_id"] = ins.inserted_id

    return MessageOut(
        id=_oid_str(doc["_id"]),
        store_id=doc["store_id"],
        customer_id=doc["customer_id"],
        sender_role=doc["sender_role"],
        sender_id=doc["sender_id"],
        text=doc.get("text"),
        image_url=doc.get("image_url"),
        created_at=doc["created_at"],
        product_id=doc.get("product_id"),
        order_id=doc.get("order_id"),
    )


@router.post("/upload-image")
def upload_chat_image(
    store_id: int = Form(...),
    customer_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    role = str(getattr(current_user, "role", "")).upper()
    user_id = int(getattr(current_user, "id"))

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="File không hợp lệ (chỉ PNG/JPG/WEBP/GIF)")

    if role == "CUSTOMER":
        customer_id = user_id
    elif role == "SELLER":
        if customer_id is None:
            raise HTTPException(status_code=400, detail="Thiếu customer_id")
        _ensure_seller_owns_store(db, int(store_id), user_id)
        customer_id = int(customer_id)
    else:
        raise HTTPException(status_code=403, detail="Không có quyền")

    data = file.file.read()
    if len(data) > MAX_IMAGE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Ảnh quá lớn (tối đa {MAX_IMAGE_MB}MB)")

    ext = ".png"
    if file.content_type == "image/jpeg":
        ext = ".jpg"
    elif file.content_type == "image/webp":
        ext = ".webp"
    elif file.content_type == "image/gif":
        ext = ".gif"

    rel_dir = f"chat/{int(store_id)}/{int(customer_id)}"
    abs_dir = os.path.join("/app/static", rel_dir)
    os.makedirs(abs_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    abs_path = os.path.join(abs_dir, filename)

    with open(abs_path, "wb") as f:
        f.write(data)

    image_url = f"/static/{rel_dir}/{filename}"
    return {"image_url": image_url}
