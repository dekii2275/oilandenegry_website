import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime

# Thêm đường dẫn để Python tìm thấy app
sys.path.append(os.getcwd())

from app.core.database import SessionLocal

# --- IMPORT MODELS ---
from app.models.users import User
from app.models.address import Address
from app.models.store import Store
from app.models.product import Product, Variant, ProductImage
from app.models.review import Review
from app.models.cart import Cart
from app.models.order import Order, OrderItem # Import thêm OrderItem nếu cần

def seed_data():
    db = SessionLocal()
    
    print("🌱 Bắt đầu quá trình Seeding dữ liệu...")

    # ==========================================
    # 1. TẠO USER TRƯỚC (BẮT BUỘC ĐỂ GÁN CHO STORE)
    # ==========================================
    user = db.query(User).filter(User.email == "demo@zenergy.com").first()
    if not user:
        user = User(
            email="demo@zenergy.com",
            hashed_password="fake_hash_password",
            full_name="Nguyễn Văn A",
            is_active=True,
            role="CUSTOMER", # Hoặc SELLER tùy logic bạn muốn
            is_approved=True # Duyệt luôn để dùng được
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Đã tạo User: {user.email}")

    # ==========================================
    # 2. TẠO STORE (GÁN USER_ID VÀO)
    # ==========================================
    store = db.query(Store).filter(Store.store_name == "GreenTech Solutions").first()
    if not store:
        store = Store(
            user_id=user.id,  # <--- QUAN TRỌNG: Phải có chủ sở hữu
            store_name="GreenTech Solutions",
            store_description="Chuyên cung cấp giải pháp năng lượng mặt trời hàng đầu.",
            # rating=4.9,     <--- ĐÃ XÓA DÒNG NÀY (Vì model không có cột rating)
            phone_number="0987654321",
            address="Khu Công Nghệ Cao",
            city="Hồ Chí Minh",
            is_active=True
        )
        db.add(store)
        db.commit()
        db.refresh(store)
        print(f"✅ Đã tạo Store: {store.store_name}")
    else:
        print(f"ℹ️ Store {store.store_name} đã tồn tại.")

    # ==========================================
    # 3. TẠO ORDER GIẢ (ĐỂ REVIEW KHÔNG BỊ LỖI)
    # ==========================================
    # Kiểm tra xem có order nào chưa, nếu chưa tạo 1 cái fake để review bám vào
    fake_order = db.query(Order).first()
    if not fake_order:
        fake_order = Order(
            user_id=user.id,
            total_amount=100.0,
            status="COMPLETED", # Đơn hàng đã xong mới được review
            shipping_address="123 Test Street",
            payment_method="COD"
        )
        db.add(fake_order)
        db.commit()
        db.refresh(fake_order)

    # ==========================================
    # 4. DANH SÁCH SẢN PHẨM MẪU
    # ==========================================
    solar_products = [
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
            "rating_average": 5.0, # Rating khởi tạo cho sản phẩm
            "review_count": 1,
            "variants": [
                {"name": "Trọn gói tiêu chuẩn", "sku": "SOLAR-50KW-STD", "price": 12450.00, "market_price": 15850.00, "stock": 5}
            ]
        },
        {
            "name": "Tấm pin năng lượng mặt trời Canadian Solar 550W",
            "slug": "tam-pin-canadian-solar-550w",
            "category": "Điện mặt trời",
            "brand": "Canadian Solar",
            "origin": "Canada/China",
            "warranty": "12 năm vật lý",
            "unit": "Tấm",
            "description": "<p>Dòng HiKu6 Mono PERC công suất cao, phù hợp cho cả dự án áp mái và mặt đất.</p>",
            "image_url": "https://images.unsplash.com/photo-1559302504-64aae6ca6b6f?auto=format&fit=crop&w=800&q=80",
            "tags": ["BÁN SỈ", "MỚI"],
            "specifications": {
                "Công suất": "550W",
                "Hiệu suất": "21.5%",
                "Kích thước": "2278 x 1134 x 35 mm",
                "Trọng lượng": "28 kg"
            },
            "rating_average": 0.0,
            "review_count": 0,
            "variants": [
                {"name": "Đơn chiếc", "sku": "CS-550W-01", "price": 185.00, "market_price": 200.00, "stock": 100},
                {"name": "Pallet (30 tấm)", "sku": "CS-550W-30", "price": 5400.00, "market_price": 6000.00, "stock": 10}
            ]
        },
        # ... (Bạn có thể giữ nguyên các sản phẩm khác ở đây)
    ]

    # ==========================================
    # 5. CHẠY VÒNG LẶP INSERT SẢN PHẨM
    # ==========================================
    for p_data in solar_products:
        exists = db.query(Product).filter(Product.slug == p_data["slug"]).first()
        if exists:
            print(f"⏩ Bỏ qua: {p_data['name']} (Đã tồn tại)")
            continue

        # Tạo Product
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

        # Tạo Variants
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

        # Tạo Images
        for i in range(1, 4):
            img = ProductImage(
                product_id=new_product.id,
                image_url=p_data["image_url"],
                display_order=i
            )
            db.add(img)

        # Tạo Review (Chỉ tạo cho sản phẩm đầu tiên để test rating)
        if p_data["review_count"] > 0:
            review = Review(
                user_id=user.id,
                product_id=new_product.id,
                order_id=fake_order.id, # Dùng order giả vừa tạo
                rating=5,
                title="Sản phẩm rất tốt",
                comment="Giao hàng nhanh, tư vấn nhiệt tình. Hiệu suất đúng như cam kết.",
                created_at=datetime.now()
            )
            db.add(review)
            db.commit()

        print(f"✅ Đã thêm: {new_product.name}")

    db.close()
    print("🏁 Hoàn tất seeding dữ liệu!")

if __name__ == "__main__":
    seed_data()