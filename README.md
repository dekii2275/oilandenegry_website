# Energy Platform API

Đây là Backend được xây dựng bằng **FastAPI**, sử dụng **PostgreSQL** làm cơ sở dữ liệu chính, có tích hợp **MongoDB** (chuẩn bị cho các tính năng tương lai) và tính năng xác thực người dùng qua Email.

## 📋 Yêu cầu hệ thống

* **Python:** 3.10+
* **Docker & Docker Compose:** (Khuyên dùng để chạy container)
* **PostgreSQL:** (Cần thiết nếu chạy trực tiếp trên môi trường Local)
* **SMTP Server:** (Tùy chọn) Để gửi email xác thực tài khoản.

## ⚙️ Cấu hình môi trường (.env)

Tạo file `.env` tại thư mục gốc của dự án và điền các thông tin sau:

```ini
# Cấu hình Database PostgreSQL
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_db
# Lưu ý: Đổi thành "postgres" nếu chạy bằng docker-compose, "localhost" nếu chạy local
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Cấu hình MongoDB
MONGO_USER=mongo_user
MONGO_PASSWORD=mongo_password

# Cấu hình Email (SMTP)
MAIL_USERNAME=you@example.com
MAIL_PASSWORD=your_mail_password
MAIL_FROM=you@example.com
MAIL_PORT=587
MAIL_SERVER=smtp.example.com

Cách 2: Chạy bằng Docker Compose (Khuyên dùng)

    Khởi chạy container:
    Bash

    docker compose up -d

    Thông tin vận hành:

        Backend lắng nghe trong container ở port 8000, nhưng được map ra máy host ở port 8001.

        Dữ liệu Postgres/Mongo được lưu trữ bền vững (persistent) tại volume pg_data và mongo_data.

        File khởi tạo SQL: docker/db/init.sql (tự động mount vào Postgres khi khởi tạo).

    Truy cập tài liệu API:

        URL: http://localhost:8001/docs

📂 Cấu trúc dự án

    app/main.py: Khởi tạo ứng dụng FastAPI, include các router (auth).

    app/api/auth.py: Xử lý logic đăng ký user, gửi email verify, endpoint verify token.

    app/models/users.py: Định nghĩa Model SQLAlchemy cho bảng users.

    app/schemas/user.py: Định nghĩa Schema Pydantic cho dữ liệu đầu vào/đầu ra (Đăng ký, Đăng nhập, Response).

    app/core/config.py: Load biến môi trường, cấu hình secrets và thông tin email.

    app/core/database.py: Thiết lập kết nối DB, tạo engine, session và class Base.

🔗 Các Endpoint chính

Prefix mặc định: /api/auth

    POST /api/auth/register: Đăng ký tài khoản mới và gửi email xác thực.

    GET /api/auth/verify?token=...: Link xác thực email (người dùng click vào link này).

    GET /: (Root) Trả về trạng thái sẵn sàng của hệ thống.

📧 Tính năng gửi Email

    Hệ thống sử dụng thư viện fastapi-mail.

    Yêu cầu thông tin SMTP hợp lệ trong file .env.

    Quan trọng: Link xác thực hiện đang được hardcode trong code là http://192.168.1.200:8001/.... Khi triển khai thực tế hoặc đổi môi trường mạng, bạn cần cập nhật lại domain/host này trong app/api/auth.py.