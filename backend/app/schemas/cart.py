from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal

class CartItemAdd(BaseModel):
    # ✅ New: add by product_id
    product_id: Optional[int] = None

    # ✅ Legacy (tạm giữ để client cũ không chết)
    variant_id: Optional[int] = None

    quantity: int = Field(default=1, ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)

class CartItemResponse(BaseModel):
    cart_item_id: int
    product_id: int
    name: str
    price: Decimal
    quantity: int
    line_total: Decimal
    in_stock: bool

    # Legacy fields (optional)
    variant_id: Optional[int] = None
    variant_name: Optional[str] = None

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    cart_id: int
    items: List[CartItemResponse]
    subtotal: Decimal

    class Config:
        from_attributes = True
