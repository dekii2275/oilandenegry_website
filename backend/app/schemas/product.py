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

class ProductPublicResponse(BaseModel):
    """Schema cho Customer xem products (public)"""
    id: int
    store_id: int
    store_name: Optional[str] = None  # Tên store
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime
    variants: List["VariantPublicResponse"] = []
    
    class Config:
        from_attributes = True

class VariantPublicResponse(BaseModel):
    """Schema cho Customer xem variants (chỉ hiển thị variants active và có stock)"""
    id: int
    product_id: int
    name: str
    price: Decimal
    stock: int
    is_active: bool
    
    class Config:
        from_attributes = True

# Update forward reference
ProductPublicResponse.model_rebuild()