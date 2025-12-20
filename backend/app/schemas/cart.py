from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class CartItemAdd(BaseModel):
    variant_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    cart_item_id: int
    product_id: int
    variant_id: int
    name: str
    variant_name: str
    price: Decimal
    quantity: int
    line_total: Decimal
    in_stock: bool
    
    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    cart_id: int
    items: List[CartItemResponse]
    subtotal: Decimal
    
    class Config:
        from_attributes = True