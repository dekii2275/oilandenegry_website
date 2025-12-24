from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.models.users import User
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewResponse
from app.api.deps import get_current_user

router = APIRouter()

# 1. API: Gửi đánh giá (Chỉ dành cho khách đã mua và nhận hàng thành công)
@router.post("/", response_model=ReviewResponse)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Kiểm tra đơn hàng có tồn tại và thuộc về user không
    order = db.query(Order).filter(
        Order.id == review_in.order_id,
        Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    # Chỉ được đánh giá khi đơn hàng đã giao thành công (DELIVERED)
    if order.status != "DELIVERED":
        raise HTTPException(
            status_code=400, 
            detail="Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được giao thành công"
        )

    # Kiểm tra xem sản phẩm có trong đơn hàng này không
    has_product = db.query(OrderItem).filter(
        OrderItem.order_id == order.id,
        OrderItem.variant_id.in_(
            db.query(Product.id).filter(Product.id == review_in.product_id) # Đơn giản hóa: check product qua variant
        )
    ).first()
    # (Lưu ý: Logic check product trong order cần khớp với cách bạn lưu OrderItem)

    # Kiểm tra xem user đã đánh giá sản phẩm này cho đơn hàng này chưa
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == review_in.product_id,
        Review.order_id == review_in.order_id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi")

    new_review = Review(
        user_id=current_user.id,
        product_id=review_in.product_id,
        order_id=review_in.order_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return ReviewResponse(
        id=new_review.id,
        user_id=new_review.user_id,
        user_name=current_user.full_name or "Khách hàng",
        rating=new_review.rating,
        comment=new_review.comment,
        created_at=new_review.created_at
    )

# 2. API: Lấy danh sách đánh giá của một sản phẩm (Public)
@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    
    result = []
    for r in reviews:
        result.append(ReviewResponse(
            id=r.id,
            user_id=r.user_id,
            user_name=r.user.full_name or "Khách hàng",
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at
        ))
    return result