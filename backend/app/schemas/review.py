from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    product_id: int
    order_id: int
    rating: int = Field(..., ge=1, le=5)  # Validate 1-5 sao
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ProductRatingSummary(BaseModel):
    average_rating: float
    review_count: int