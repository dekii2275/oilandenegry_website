import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime

# Thêm đường dẫn để Python tìm thấy app
sys.path.append(os.getcwd())

# Import engine để tạo bảng
from app.core.database import SessionLocal, engine, Base 

# --- IMPORT MODELS ---
from app.models.users import User
from app.models.address import Address
from app.models.store import Store
from app.models.product import Product, Variant, ProductImage
from app.models.review import Review
from app.models.cart import Cart
from app.models.order import Order, OrderItem

def seed_data():
    # 0. TẠO BẢNG
    print("🛠️ Đang kiểm tra và tạo bảng trong Database...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    print("🌱 Bắt đầu quá trình Seeding dữ liệu...")

    # 1. TẠO USER 
    user = db.query(User).filter(User.email == "demo@zenergy.com").first()
    if not user:
        user = User(
            email="demo@zenergy.com",
            hashed_password="fake_hash_password",
            full_name="Nguyễn Văn A",
            is_active=True,
            role="CUSTOMER",
            is_approved=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Đã tạo User: {user.email}")

    # 2. TẠO STORE
    store = db.query(Store).filter(Store.store_name == "GreenTech Solutions").first()
    if not store:
        store = Store(
            user_id=user.id,
            store_name="GreenTech Solutions",
            store_description="Chuyên cung cấp giải pháp năng lượng mặt trời hàng đầu.",
            phone_number="0987654321",
            address="Khu Công Nghệ Cao",
            city="Hồ Chí Minh",
            is_active=True
        )
        db.add(store)
        db.commit()
        db.refresh(store)
        print(f"✅ Đã tạo Store: {store.store_name}")

    # 3. TẠO ORDER GIẢ
    fake_order = db.query(Order).filter(Order.user_id == user.id).first()
    if not fake_order:
        fake_order = Order(
            user_id=user.id,
            total_amount=100.0,
            status="COMPLETED",
            shipping_address="123 Test Street",
            payment_method="COD"
        )
        db.add(fake_order)
        db.commit()
        db.refresh(fake_order)

    # ==========================================
    # 4. DANH SÁCH 10 SẢN PHẨM MẪU (FULL LIST)
    # ==========================================
    solar_products = [
        # 1. Hệ thống lớn
        {
            "name": "Hệ thống Điện mặt trời Công nghiệp (50kW)",
            "slug": "he-thong-dien-mat-troi-cong-nghiep-50kw",
            "category": "Điện mặt trời",
            "brand": "SunPower Maxeon",
            "origin": "USA",
            "warranty": "25 năm",
            "unit": "Bộ trọn gói",
            "description": "<p>Giải pháp năng lượng cao cấp cho nhà xưởng. Hiệu suất chuyển đổi quang năng lên tới 22.8%.</p>",
            "image_url": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
            "tags": ["CÓ SẴN", "HOT", "GIẢM 15%"],
            "specifications": {
                "Công suất": "50,000W Peak",
                "Diện tích lắp đặt": "300m2",
                "Loại pin": "Monocrystalline",
                "Biến tần": "Huawei Sun2000"
            },
            "rating_average": 5.0,
            "review_count": 1,
            "variants": [
                {"name": "Trọn gói tiêu chuẩn", "sku": "SOLAR-50KW-STD", "price": 12450.00, "market_price": 15850.00, "stock": 5}
            ]
        },
        # 2. Pin mặt trời
        {
            "name": "Tấm pin năng lượng mặt trời Canadian Solar 550W",
            "slug": "tam-pin-canadian-solar-550w",
            "category": "Điện mặt trời",
            "brand": "Canadian Solar",
            "origin": "Canada/China",
            "warranty": "12 năm vật lý",
            "unit": "Tấm",
            "description": "<p>Dòng HiKu6 Mono PERC công suất cao, phù hợp cho cả dự án áp mái và mặt đất.</p>",
            "image_url": "https://plus.unsplash.com/premium_photo-1680085843147-0fbd47ad159d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "tags": ["BÁN SỈ", "MỚI"],
            "specifications": {
                "Công suất": "550W",
                "Hiệu suất": "21.5%",
                "Kích thước": "2278 x 1134 x 35 mm",
                "Trọng lượng": "28 kg"
            },
            "rating_average": 4.5,
            "review_count": 2,
            "variants": [
                {"name": "Đơn chiếc", "sku": "CS-550W-01", "price": 185.00, "market_price": 200.00, "stock": 100},
                {"name": "Pallet (30 tấm)", "sku": "CS-550W-30", "price": 5400.00, "market_price": 6000.00, "stock": 10}
            ]
        },
        # 3. Biến tần
        {
            "name": "Biến tần Inverter Hybrid DEYE 5kW",
            "slug": "bien-tan-inverter-hybrid-deye-5kw",
            "category": "Điện mặt trời",
            "brand": "DEYE",
            "origin": "China",
            "warranty": "5 năm",
            "unit": "Chiếc",
            "description": "<p>Inverter Hybrid phổ biến nhất hiện nay, hỗ trợ lưu trữ và bám tải thông minh.</p>",
            "image_url": "https://images.unsplash.com/photo-1662601699213-cb84f13d86df?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW52ZXJ0ZXJ8ZW58MHx8MHx8fDA%3D",
            "tags": ["CÓ SẴN", "BÁN CHẠY"],
            "specifications": {
                "Công suất AC": "5kW",
                "Hỗ trợ pin": "Lead-acid / Lithium-ion",
                "Kết nối": "Wifi / GPRS",
                "Chống nước": "IP65"
            },
            "rating_average": 4.8,
            "review_count": 5,
            "variants": [
                {"name": "Bản tiêu chuẩn", "sku": "DEYE-5K-SG04", "price": 1200.00, "market_price": 1350.00, "stock": 20}
            ]
        },
        # 4. Pin lưu trữ
        {
            "name": "Pin lưu trữ Lithium Gigabox 5E (5kWh)",
            "slug": "pin-luu-tru-lithium-gigabox-5e",
            "category": "Điện mặt trời",
            "brand": "Gigabox",
            "origin": "Vietnam",
            "warranty": "5 năm",
            "unit": "Thùng",
            "description": "<p>Giải pháp lưu trữ điện năng hiệu quả, tuổi thọ lên tới 6000 chu kỳ sạc xả.</p>",
            "image_url": "https://media.istockphoto.com/id/2216379825/photo/single-wide-black-truck-battery-with-side-handles-for-easy-lifting-heavy-duty-power-unit.webp?a=1&b=1&s=612x612&w=0&k=20&c=hv7USdfUQ-cpneAAsd_ReB5d-fQOh6Ihy1-hAkCW8AY=",
            "tags": ["KHUYẾN MÃI"],
            "specifications": {
                "Dung lượng": "5.12 kWh",
                "Điện áp": "51.2V",
                "Dòng sạc max": "50A",
                "Tuổi thọ": "6000 cycles"
            },
            "rating_average": 0.0,
            "review_count": 0,
            "variants": [
                {"name": "Gigabox 5E", "sku": "BAT-GIGA-5E", "price": 950.00, "market_price": 1100.00, "stock": 15}
            ]
        },
        # 5. Đèn Solar
        {
            "name": "Đèn năng lượng mặt trời sân vườn 300W",
            "slug": "den-nang-luong-mat-troi-san-vuon-300w",
            "category": "Điện mặt trời",
            "brand": "Jindian",
            "origin": "China",
            "warranty": "2 năm",
            "unit": "Bộ",
            "description": "<p>Đèn pha LED năng lượng mặt trời, tự động bật tắt, chống nước IP67.</p>",
            "image_url": "https://images.unsplash.com/photo-1629798235774-8f840bb2b1c3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U29sYXIlMjBsaWdodHMlMjBwcm9kdWN0fGVufDB8fDB8fHww",
            "tags": ["GIÁ RẺ", "CÓ SẴN"],
            "specifications": {
                "Công suất đèn": "300W",
                "Dung lượng pin": "36.000 mAh",
                "Thời gian sáng": "10-12 giờ",
                "Chống nước": "IP67"
            },
            "rating_average": 4.2,
            "review_count": 12,
            "variants": [
                {"name": "Bộ đèn + Tấm pin", "sku": "LED-SOLAR-300W", "price": 45.00, "market_price": 60.00, "stock": 200}
            ]
        },
        # 6. Cáp điện (MỚI)
        {
            "name": "Cáp điện DC Solar 4mm2 (Cuộn 100m)",
            "slug": "cap-dien-dc-solar-4mm2",
            "category": "Điện mặt trời",
            "brand": "Leader",
            "origin": "Vietnam",
            "warranty": "10 năm",
            "unit": "Cuộn",
            "description": "<p>Cáp chuyên dụng cho điện mặt trời, lõi đồng mạ thiếc, vỏ cách điện XLPO chịu nhiệt, chống tia UV.</p>",
            "image_url": "https://plus.unsplash.com/premium_photo-1759419986993-d8771ec484d0?q=80&w=784&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "tags": ["PHỤ KIỆN"],
            "specifications": {
                "Tiết diện": "4.0 mm2",
                "Điện áp định mức": "1500V DC",
                "Màu sắc": "Đen / Đỏ",
                "Nhiệt độ": "-40 đến 90 độ C"
            },
            "rating_average": 0.0,
            "review_count": 0,
            "variants": [
                {"name": "Cuộn 100m (Đen)", "sku": "CABLE-DC-4MM-BLK", "price": 85.00, "market_price": 95.00, "stock": 50},
                {"name": "Cuộn 100m (Đỏ)", "sku": "CABLE-DC-4MM-RED", "price": 85.00, "market_price": 95.00, "stock": 50}
            ]
        },
        # 7. Sạc PWM (MỚI)
        {
            "name": "Bộ điều khiển sạc năng lượng mặt trời PWM 30A",
            "slug": "bo-dieu-khien-sac-pwm-30a",
            "category": "Điện mặt trời",
            "brand": "Suoer",
            "origin": "China",
            "warranty": "6 tháng",
            "unit": "Cái",
            "description": "<p>Bộ sạc PWM giá rẻ, tích hợp cổng USB sạc điện thoại, màn hình LCD hiển thị thông số.</p>",
            "image_url": "https://images.unsplash.com/photo-1739268984311-b478fccf256e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8UFdNJTIwY2hhcmdpbmclMjBzb2xhciUyMHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
            "tags": ["GIÁ RẺ"],
            "specifications": {
                "Dòng sạc": "30A",
                "Điện áp": "12V/24V Auto",
                "Cổng USB": "5V 2A",
                "Màn hình": "LCD"
            },
            "rating_average": 0.0,
            "review_count": 0,
            "variants": [
                {"name": "PWM 30A", "sku": "PWM-30A-V1", "price": 12.00, "market_price": 15.00, "stock": 100}
            ]
        },
        # 8. Máy bơm (MỚI)
        {
            "name": "Máy bơm nước năng lượng mặt trời 2HP",
            "slug": "may-bom-nuoc-nang-luong-mat-troi-2hp",
            "category": "Điện mặt trời",
            "brand": "Solar Pump",
            "origin": "Taiwan",
            "warranty": "2 năm",
            "unit": "Chiếc",
            "description": "<p>Máy bơm hỏa tiễn chạy trực tiếp từ tấm pin, không cần ắc quy, chuyên dùng tưới tiêu nông nghiệp.</p>",
            "image_url": "https://media.istockphoto.com/id/1093485752/photo/various-pumping-equipment-for-heating-and-water-supply-on-a-white-background-isolated.webp?a=1&b=1&s=612x612&w=0&k=20&c=W83USYwtHVedvaJq8TG43if0NNqltDHIpHngfvWNXkA=",
            "tags": ["CÔNG NGHIỆP", "BÁN CHẠY"],
            "specifications": {
                "Công suất": "1500W (2HP)",
                "Cột áp": "80m",
                "Lưu lượng": "10 m3/h",
                "Điện áp vào": "110-150V DC"
            },
            "rating_average": 5.0,
            "review_count": 3,
            "variants": [
                {"name": "Bơm hỏa tiễn 3 inch", "sku": "PUMP-SOLAR-2HP", "price": 350.00, "market_price": 400.00, "stock": 10}
            ]
        },
        # 9. Đèn đường (MỚI)
        {
            "name": "Đèn đường năng lượng mặt trời liền thể 200W",
            "slug": "den-duong-solar-lien-the-200w",
            "category": "Điện mặt trời",
            "brand": "Rạng Đông",
            "origin": "Vietnam",
            "warranty": "2 năm",
            "unit": "Bộ",
            "description": "<p>Đèn đường All-in-one, dễ lắp đặt, cảm biến chuyển động thông minh giúp tiết kiệm pin.</p>",
            "image_url": "https://images.unsplash.com/photo-1740805276608-ef60e2e468ba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bGlnaHQlMjBzb2xhcnxlbnwwfHwwfHx8MA%3D%3D",
            "tags": ["DÂN DỤNG"],
            "specifications": {
                "Công suất": "200W",
                "Pin lưu trữ": "20.000 mAh",
                "Chip LED": "SMD 5730",
                "Diện tích chiếu sáng": "100m2"
            },
            "rating_average": 4.0,
            "review_count": 8,
            "variants": [
                {"name": "200W Liền thể", "sku": "LED-STREET-200W", "price": 35.00, "market_price": 50.00, "stock": 300}
            ]
        },
        # 10. Phụ kiện MC4 (MỚI)
        {
            "name": "Jack kết nối MC4 (Túi 10 cặp)",
            "slug": "jack-ket-noi-mc4-tui-10-cap",
            "category": "Điện mặt trời",
            "brand": "Leader",
            "origin": "China",
            "warranty": "1 năm",
            "unit": "Túi",
            "description": "<p>Đầu nối tiêu chuẩn cho tấm pin năng lượng mặt trời, chống nước IP67, lõi đồng mạ bạc.</p>",
            "image_url": "https://media.istockphoto.com/id/1399421163/photo/arrangement-of-part-for-installation-of-adjustable-solar-panel-mounting-black-female-and-male.webp?a=1&b=1&s=612x612&w=0&k=20&c=rMaDUA20Ij3d_uEsdpNVuHLMcNAbNpacjYVT6sMZAvo=",
            "tags": ["PHỤ KIỆN"],
            "specifications": {
                "Dòng điện": "30A",
                "Điện áp": "1000V DC",
                "Tiêu chuẩn": "IP67",
                "Dùng cho cáp": "2.5/4/6 mm2"
            },
            "rating_average": 0.0,
            "review_count": 0,
            "variants": [
                {"name": "Túi 10 cặp", "sku": "MC4-10PAIRS", "price": 10.00, "market_price": 12.00, "stock": 500}
            ]
        }
    ]

    # 5. CHẠY VÒNG LẶP INSERT
    for p_data in solar_products:
        exists = db.query(Product).filter(Product.slug == p_data["slug"]).first()
        if exists:
            print(f"⏩ Bỏ qua: {p_data['name']} (Đã tồn tại)")
            continue

        new_product = Product(
            store_id=store.id,
            name=p_data["name"],
            slug=p_data["slug"],
            category=p_data["category"],
            brand=p_data["brand"],
            origin=p_data["origin"],
            warranty=p_data["warranty"],
            unit=p_data["unit"],
            description=p_data["description"],
            image_url=p_data["image_url"],
            tags=p_data["tags"],
            specifications=p_data["specifications"],
            rating_average=p_data.get("rating_average", 0),
            review_count=p_data.get("review_count", 0),
            is_active=True
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        for v_data in p_data["variants"]:
            variant = Variant(
                product_id=new_product.id,
                name=v_data["name"],
                sku=v_data["sku"],
                price=v_data["price"],
                market_price=v_data["market_price"],
                stock=v_data["stock"],
                is_active=True
            )
            db.add(variant)

        for i in range(1, 4):
            img = ProductImage(
                product_id=new_product.id,
                image_url=p_data["image_url"],
                display_order=i
            )
            db.add(img)

        # Tạo review nếu có số liệu review_count > 0
        if p_data["review_count"] > 0:
            review = Review(
                user_id=user.id,
                product_id=new_product.id,
                order_id=fake_order.id,
                rating=5,
                title="Sản phẩm rất tốt",
                comment="Giao hàng nhanh, đóng gói cẩn thận. Sản phẩm đúng mô tả.",
                created_at=datetime.now()
            )
            db.add(review)
            db.commit()

        print(f"✅ Đã thêm: {new_product.name}")

    db.close()
    print("🏁 Hoàn tất seeding dữ liệu!")

if __name__ == "__main__":
    seed_data()