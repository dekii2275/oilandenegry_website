from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

# Dữ liệu nhận vào khi tạo yêu cầu rút tiền
class WithdrawCreate(BaseModel):
    amount: Decimal

# Dữ liệu trả về cho Frontend
class WithdrawResponse(BaseModel):
    id: int
    
    # ✅ THÊM DÒNG NÀY: Khai báo code là chuỗi
    code: str 
    
    amount: Decimal
    status: str
    requestDate: datetime
    bankName: Optional[str] = None
    bankAccount: Optional[str] = None
    
    class Config:
        from_attributes = True 

    # ❌ XÓA đoạn @property def code(self)... đi vì bạn đã xử lý logic này ở API seller.py rồi.
    # Nếu giữ lại, nó cũng không tự chạy khi bạn return dict từ API đâu.