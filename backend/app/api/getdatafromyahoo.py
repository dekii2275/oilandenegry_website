from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import yfinance as yf
import pandas as pd

# Import Database
from app.core.database import get_db
# Import Model vừa tạo ở Bước 1
from app.models.market import MarketPrice

router = APIRouter()

class MarketDataFetcher:
    def __init__(self, db: Session):
        self.db = db  # Cần kết nối DB để lưu
        self.tickers = {
            "brent": "BZ=F",  
            "wti": "CL=F",    
            "gas": "NG=F",    
            "solar": "TAN"    
        }

    def get_price_data(self, key_name):
        symbol = self.tickers.get(key_name)
        if not symbol: return None
        try:
            ticker = yf.Ticker(symbol)
            history = ticker.history(period="5d") 
            if len(history) < 2: return None
            
            current_price = history['Close'].iloc[-1]
            prev_close = history['Close'].iloc[-2]
            change_amount = current_price - prev_close
            change_percent = (change_amount / prev_close) * 100
            
            status = "up" if change_amount >= 0 else "down"
            name_upper = key_name.upper()

            # --- LƯU VÀO DATABASE ---
            # Cách 1: Chỉ lưu bài mới nhất (Update), không lưu lịch sử (Tiết kiệm DB)
            # existing_price = self.db.query(MarketPrice).filter(MarketPrice.name == name_upper).first()
            # if not existing_price:
            #     existing_price = MarketPrice(name=name_upper)
            
            # existing_price.symbol = symbol
            # existing_price.price = round(current_price, 2)
            # existing_price.change = round(change_amount, 2)
            # existing_price.percent = round(change_percent, 2)
            # existing_price.status = status
            # existing_price.updated_at = datetime.utcnow()
            # self.db.add(existing_price)
            
            # Cách 2: Lưu lịch sử (Insert dòng mới mỗi lần gọi) -> Chọn cách này nếu muốn vẽ biểu đồ
            new_record = MarketPrice(
                name=name_upper,
                symbol=symbol,
                price=round(current_price, 2),
                change=round(change_amount, 2),
                percent=round(change_percent, 2),
                status=status,
                updated_at=datetime.utcnow()
            )
            self.db.add(new_record)
            self.db.commit() # Lưu ngay lập tức
            
            return {
                "symbol": symbol,
                "name": name_upper,
                "price": round(current_price, 2),
                "change": round(change_amount, 2),
                "percent": round(change_percent, 2),
                "status": status
            }
        except Exception as e:
            print(f"Lỗi fetch {key_name}: {e}")
            return None

    def get_all_market_prices(self):
        results = []
        for key in self.tickers:
            data = self.get_price_data(key)
            if data:
                results.append(data)
        return results

# Endpoint API
@router.get("/")
async def get_market_data(db: Session = Depends(get_db)):
    """
    API lấy dữ liệu và TỰ ĐỘNG LƯU vào Database
    """
    try:
        # Truyền db vào class xử lý
        fetcher = MarketDataFetcher(db)
        data = fetcher.get_all_market_prices()
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))