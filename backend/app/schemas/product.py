from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

# ========== 0. IMAGE SCHEMAS (MỚI) ==========
# Dùng để hiển thị ảnh trong Gallery

class ProductImageBase(BaseModel):
    image_url: str
    display_order: Optional[int] = 0

class ProductImageResponse(ProductImageBase):
    id: int
    class Config:
        from_attributes = True

# ========== 1. VARIANT SCHEMAS ==========

class VariantCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    price: Decimal
    market_price: Optional[Decimal] = None # 👇 Thêm giá gốc để tính % giảm giá
    stock: int = 0
    is_active: bool = True

class VariantUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[Decimal] = None
    market_price: Optional[Decimal] = None # 👇 Update cả giá gốc
    stock: Optional[int] = None
    is_active: Optional[bool] = None

class VariantResponse(BaseModel):
    id: int
    product_id: int
    name: str
    sku: Optional[str] = None
    price: Decimal
    market_price: Optional[Decimal] = None
    stock: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ========== 2. PRODUCT SCHEMAS ==========

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    
    # 👇 CÁC TRƯỜNG MỚI BỔ SUNG
    brand: Optional[str] = None
    origin: Optional[str] = None
    warranty: Optional[str] = None
    unit: Optional[str] = None
    image_url: Optional[str] = None  # Ảnh đại diện (Thumbnail)
    tags: Optional[List[str]] = None # JSON trong DB -> List trong Python
    specifications: Optional[Dict[str, Any]] = None # JSON -> Dict
    is_active: bool = True

class ProductCreate(ProductBase):
    # 👇 Seller gửi lên danh sách URL ảnh gallery (List String)
    images: Optional[List[str]] = [] 

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    
    # Update các trường mới
    brand: Optional[str] = None
    origin: Optional[str] = None
    warranty: Optional[str] = None
    unit: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    
    # 👇 Gửi danh sách mới để ghi đè gallery cũ
    images: Optional[List[str]] = None 

class ProductResponse(ProductBase):
    id: int
    store_id: int
    # Các trường trong ProductBase đã tự động có ở đây (name, brand, unit...)
    
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    variants: List[VariantResponse] = []
    images: List[ProductImageResponse] = [] # 👇 Trả về danh sách object ảnh
    
    class Config:
        from_attributes = True

# Update forward reference
ProductResponse.model_rebuild()

# ========== 3. PUBLIC SCHEMAS (CHO KHÁCH HÀNG) ==========

class VariantPublicResponse(BaseModel):
    """Schema cho Customer xem variants"""
    id: int
    product_id: int
    name: str
    price: Decimal
    market_price: Optional[Decimal] = None # Khách cần thấy giá gốc để biết giảm bao nhiêu
    stock: int
    is_active: bool
    
    class Config:
        from_attributes = True

class ProductPublicResponse(BaseModel):
    """Schema cho Customer xem products (public)"""
    id: int
    store_id: int
    store_name: Optional[str] = None
    
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    
    # Hiển thị thông tin chi tiết cho khách
    brand: Optional[str] = None
    origin: Optional[str] = None
    unit: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None
    
    created_at: datetime
    
    variants: List[VariantPublicResponse] = []
    images: List[ProductImageResponse] = [] # Khách xem được gallery ảnh
    
    class Config:
        from_attributes = True

# Update forward reference
ProductPublicResponse.model_rebuild()