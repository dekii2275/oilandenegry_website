# backend/app/schemas/messages.py
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class MessageSendIn(BaseModel):
    store_id: int
    customer_id: Optional[int] = None  # SELLER cần truyền, CUSTOMER bỏ qua
    text: Optional[str] = None
    image_url: Optional[str] = None
    product_id: Optional[int] = None
    order_id: Optional[int] = None


class MessageOut(BaseModel):
    id: str
    store_id: int
    customer_id: int
    sender_role: str
    sender_id: int
    text: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    product_id: Optional[int] = None
    order_id: Optional[int] = None


class ThreadOut(BaseModel):
    store_id: int
    customer_id: int
    customer_name: Optional[str] = None
    customer_avatar_url: Optional[str] = None
    messages: List[MessageOut]


class ThreadSummaryOut(BaseModel):
    store_id: int
    customer_id: int
    customer_name: Optional[str] = None
    customer_avatar_url: Optional[str] = None
    last_message: MessageOut


class InboxOut(BaseModel):
    threads: List[ThreadSummaryOut]
