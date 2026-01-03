from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

# ========== 0. IMAGE SCHEMAS ==========
class ProductImageBase(BaseModel):
    image_url: str
    display_order: Optional[int] = 0

class ProductImageResponse(ProductImageBase):
    id: int
    class Config:
        from_attributes = True

# ========== 1. PRODUCT SCHEMAS (ĐÃ CẬP NHẬT) ==========

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    origin: Optional[str] = None
    warranty: Optional[str] = None
    unit: Optional[str] = None
    image_url: Optional[str] = None  # Ảnh đại diện (Thumbnail)
    tags: Optional[List[str]] = None 
    specifications: Optional[Dict[str, Any]] = None 
    is_active: bool = True

class ProductCreate(ProductBase):
    # ✅ BỔ SUNG CÁC TRƯỜNG NÀY ĐỂ FIX LỖI 500
    # Đây là các trường Frontend gửi lên thay cho bảng Variant cũ
    price: Decimal
    market_price: Optional[Decimal] = None
    stock: int = 0
    sku: Optional[str] = None
    
    # Danh sách URL ảnh gallery
    images: Optional[List[str]] = [] 

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    origin: Optional[str] = None
    warranty: Optional[str] = None
    unit: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    
    # ✅ Cập nhật cả giá và kho nếu cần
    price: Optional[Decimal] = None
    market_price: Optional[Decimal] = None
    stock: Optional[int] = None
    sku: Optional[str] = None
    
    images: Optional[List[str]] = None 

class ProductResponse(ProductBase):
    id: int
    store_id: int
    
    # ✅ Trả về giá và kho trực tiếp trong Product
    price: Optional[Decimal] = None
    market_price: Optional[Decimal] = None
    stock: int = 0
    sku: Optional[str] = None
    
    rating_average: float = 0.0
    review_count: int = 0
    
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Đã xóa variants, chỉ giữ lại gallery ảnh
    images: List[ProductImageResponse] = [] 
    
    class Config:
        from_attributes = True

# ========== 2. PUBLIC SCHEMAS (CHO KHÁCH HÀNG) ==========

class ProductPublicResponse(BaseModel):
    id: int
    store_id: int
    store_name: Optional[str] = None
    
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    origin: Optional[str] = None
    unit: Optional[str] = None
    image_url: Optional[str] = None
    
    # ✅ Hiển thị giá và kho trực tiếp cho khách
    price: Decimal = Decimal(0)
    market_price: Optional[Decimal] = None
    stock: int = 0
    
    rating_average: float = 0.0
    review_count: int = 0
    
    tags: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None
    
    created_at: datetime
    images: List[ProductImageResponse] = [] 
    
    class Config:
        from_attributes = True