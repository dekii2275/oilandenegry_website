from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

# ========== PRODUCT SCHEMAS ==========

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    id: int
    store_id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    variants: List["VariantResponse"] = []
    
    class Config:
        from_attributes = True

# ========== VARIANT SCHEMAS ==========

class VariantCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    price: Decimal
    stock: int = 0
    is_active: bool = True

class VariantUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None

class VariantResponse(BaseModel):
    id: int
    product_id: int
    name: str
    sku: Optional[str] = None
    price: Decimal
    stock: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Update forward reference
ProductResponse.model_rebuild()