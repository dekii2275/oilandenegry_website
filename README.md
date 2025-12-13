# Z-ENERGY Authentication

Next.js project với authentication system.

## Cấu trúc dự án

```
src/
├── app/
│   ├── (auth)/                 # Route group cho auth
│   │   ├── layout.tsx          # Layout riêng cho auth
│   │   ├── register/
│   │   │   └── page.tsx        # Trang Đăng ký
│   │   └── login/
│   │       └── page.tsx        # Trang Đăng nhập
│   │
│   ├── layout.tsx              # Layout toàn app
│   └── globals.css
│
├── components/
│   ├── auth/
│   │   ├── RegisterForm.tsx    # Form đăng ký
│   │   ├── AuthInput.tsx       # Input có icon
│   │   └── AuthButton.tsx      # Nút đăng ký
│   │
│   ├── ui/
│   │   ├── Input.tsx
│   │   └── Button.tsx
│
├── assets/
│   └── images/
│       ├── auth-bg.jpg         # Background rừng xanh
│       └── logo.png            # Logo Z-ENERGY
│
├── lib/
│   └── validators/
│       └── auth.ts             # validate email, password
│
├── services/
│   └── auth.service.ts         # gọi API đăng ký
│
├── types/
│   └── auth.ts                 # interface RegisterPayload
│
└── constants/
    └── routes.ts
```

## Cài đặt

```bash
npm install
```

## Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Lưu ý

1. Thêm file `auth-bg.jpg` vào `public/assets/images/`
2. Thêm file `logo.png` vào `public/assets/images/`
3. Cấu hình `NEXT_PUBLIC_API_URL` trong `.env.local` nếu cần

