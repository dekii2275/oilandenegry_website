from fastapi import APIRouter, HTTPException
import yfinance as yf
import pandas as pd

# 1. Khởi tạo Router (Đây là cái mà main.py đang thiếu)
router = APIRouter()

# 2. Logic xử lý dữ liệu (Class cũ của bạn)
class MarketDataFetcher:
    def __init__(self):
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

            return {
                "symbol": symbol,
                "name": key_name.upper(),
                "price": round(current_price, 2),
                "change": round(change_amount, 2),
                "percent": round(change_percent, 2),
                "status": "up" if change_amount >= 0 else "down"
            }
        except Exception as e:
            print(f"Lỗi: {e}")
            return None

    def get_all_market_prices(self):
        results = []
        for key in self.tickers:
            data = self.get_price_data(key)
            if data:
                results.append(data)
        return results

# 3. Tạo Endpoint API (Để main.py gọi được qua đường dẫn /api/market-data/)
@router.get("/")
async def get_market_data():
    """
    API lấy dữ liệu thị trường
    URL gọi: GET /api/market-data/
    """
    try:
        fetcher = MarketDataFetcher()
        data = fetcher.get_all_market_prices()
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))