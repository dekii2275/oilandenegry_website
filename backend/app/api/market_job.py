# app/services/market_job.py
import yfinance as yf
import google.generativeai as genai
import json
import os
from datetime import datetime
from dotenv import load_dotenv # <--- Import thư viện này

# 1. Nạp biến môi trường từ file .env
load_dotenv()

# Biến toàn cục để lưu kết quả phân tích
latest_analysis = {
    "trend": "Đang cập nhật...",
    "trendDesc": "Hệ thống đang khởi động phân tích...",
    "highlight": "Chờ dữ liệu",
    "highlightDesc": "Vui lòng đợi trong giây lát.",
    "isPositive": True,
    "last_updated": ""
}

# 2. Lấy API Key từ biến môi trường
GEN_AI_KEY = os.getenv("GEMINI_API_KEY")

# Kiểm tra xem có Key chưa, nếu chưa thì báo lỗi để dễ debug
if not GEN_AI_KEY:
    print("⚠️ CẢNH BÁO: Chưa cấu hình GEMINI_API_KEY trong file .env")
else:
    genai.configure(api_key=GEN_AI_KEY)

async def analyze_market_task():
    global latest_analysis
    
    # Nếu không có key thì dừng luôn, đỡ lỗi
    if not GEN_AI_KEY:
        print("❌ Lỗi: Thiếu API Key, bỏ qua phân tích.")
        return

    print(f"[{datetime.now()}] Bắt đầu phân tích thị trường...")
    
    try:
        # Lấy dữ liệu Yahoo thật
        oil = yf.Ticker("CL=F").history(period="1d")
        gas = yf.Ticker("NG=F").history(period="1d")
        
        if oil.empty or gas.empty:
            print("Lỗi: Không lấy được dữ liệu Yahoo")
            return

        oil_price = oil['Close'].iloc[-1]
        oil_open = oil['Open'].iloc[-1]
        oil_change = ((oil_price - oil_open) / oil_open) * 100
        
        gas_price = gas['Close'].iloc[-1]
        gas_change = ((gas_price - gas['Open'].iloc[-1]) / gas['Open'].iloc[-1]) * 100

        # Gửi cho Gemini
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Dữ liệu: Dầu ${oil_price:.2f} ({oil_change:.2f}%), Gas ${gas_price:.2f} ({gas_change:.2f}%).
        Hãy đóng vai chuyên gia tài chính, phân tích ngắn gọn xu hướng.
        BẮT BUỘC trả về JSON chuẩn (không markdown) theo mẫu:
        {{
            "trend": "Tên xu hướng (VD: Tăng mạnh)",
            "trendDesc": "Nhận định ngắn về dầu (dưới 20 từ)",
            "highlight": "Điểm nhấn (VD: Gas sụt giảm)",
            "highlightDesc": "Giải thích ngắn (dưới 20 từ)",
            "isPositive": true/false (true nếu dầu tăng)
        }}
        """
        
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        
        # Cập nhật vào biến cache
        data = json.loads(text)
        data["last_updated"] = datetime.now().strftime("%H:%M %d/%m")
        latest_analysis = data
        print("✅ Phân tích xong & Đã lưu cache!")

    except Exception as e:
        print(f"❌ Lỗi phân tích AI: {e}")

# Hàm để API gọi lấy dữ liệu
def get_cached_analysis():
    global latest_analysis
    return latest_analysis