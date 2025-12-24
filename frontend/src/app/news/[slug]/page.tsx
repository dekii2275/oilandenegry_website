"use client";

import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function NewsDetailPage() {
  return (
    <>
      <Header />

      <main className="bg-white">
        {/* ===== BREADCRUMB ===== */}
        <div className="bg-emerald-50 py-3 text-sm">
          <div className="container mx-auto text-gray-600">
            Trang chủ · Tin tức & Sự kiện ·{" "}
            <span className="text-emerald-600 font-medium">
              Hội nghị Thượng đỉnh Năng lượng Xanh 2024
            </span>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="container mx-auto py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ===== LEFT CONTENT ===== */}
          <article className="lg:col-span-2">
            <span className="inline-block text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold mb-3">
              SỰ KIỆN NỔI BẬT
            </span>

            <h1 className="text-3xl font-bold leading-snug">
              Hội nghị Thượng đỉnh Năng lượng Xanh 2024: Thúc đẩy chuyển dịch năng
              lượng bền vững
            </h1>

            {/* META */}
            <div className="flex gap-6 text-sm text-gray-500 mt-4 border-b pb-4">
              <span>✍️ Ban Tổ chức</span>
              <span>📅 15/10/2024</span>
              <span>⏱️ 5 phút đọc</span>
            </div>

            {/* COVER IMAGE */}
            <img
              src="/images/news/event-detail.jpg"
              alt="Green Energy Summit"
              className="w-full rounded-2xl my-8"
            />

            {/* CONTENT */}
            <div className="prose max-w-none">
              <p>
                Hội nghị Thượng đỉnh Năng lượng Xanh 2024 (Green Energy Summit
                2024) sẽ chính thức diễn ra vào tháng 11 tới đây. Đây là diễn đàn
                đối thoại cấp cao quy tụ các nhà hoạch định chính sách, doanh
                nghiệp và chuyên gia hàng đầu trong lĩnh vực năng lượng.
              </p>

              <h3>Bối cảnh và mục tiêu</h3>
              <p>
                Trong bối cảnh biến đổi khí hậu diễn ra ngày càng phức tạp, việc
                chuyển dịch sang các nguồn năng lượng tái tạo không còn là lựa
                chọn mà là xu thế tất yếu.
              </p>

              <h3>Nội dung thảo luận chính</h3>
              <ul>
                <li>Công nghệ điện gió ngoài khơi</li>
                <li>Lưu trữ năng lượng (Energy Storage)</li>
                <li>Tài chính xanh & Tín chỉ Carbon</li>
              </ul>

              <blockquote className="border-l-4 border-emerald-500 pl-4 italic bg-emerald-50 py-3 rounded">
                “Chuyển dịch năng lượng không chỉ là vấn đề môi trường, mà còn là
                đòn bẩy kinh tế quan trọng giúp Việt Nam nâng cao vị thế toàn
                cầu.”
                <br />
                <span className="text-sm not-italic text-gray-600">
                  — Trích phát biểu của Trưởng Ban Tổ chức
                </span>
              </blockquote>

              <p>
                Đừng bỏ lỡ cơ hội kết nối với hơn 500 đại biểu và mở rộng mạng
                lưới đối tác chiến lược tại sự kiện lớn nhất ngành năng lượng
                trong năm.
              </p>
            </div>

            {/* TAGS */}
            <div className="flex gap-2 mt-6 flex-wrap">
              {["#NangLuongXanh", "#NetZero", "#DienGio", "#Event2024"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1 rounded-full border"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>

            {/* SHARE */}
            <div className="mt-8 p-4 border rounded-xl flex items-center gap-4">
              <span className="text-sm font-medium">
                Chia sẻ sự kiện này:
              </span>
              <button className="w-9 h-9 rounded-full bg-blue-600 text-white">
                f
              </button>
              <button className="w-9 h-9 rounded-full bg-sky-500 text-white">
                in
              </button>
              <button className="w-9 h-9 rounded-full bg-blue-400 text-white">
                t
              </button>
            </div>
          </article>

          {/* ===== RIGHT SIDEBAR ===== */}
          <aside className="space-y-6">
            {/* INFO BOX */}
            <div className="bg-emerald-50 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Thông tin đăng ký</h3>

              <div className="text-sm space-y-3">
                <p>
                  ⏰ <strong>Thời gian:</strong> 15/11/2024
                </p>
                <p>
                  📍 <strong>Địa điểm:</strong> Trung tâm Hội nghị QG, Hà Nội
                </p>
                <p>
                  🎟️ <strong>Vé:</strong> Miễn phí đăng ký
                </p>
              </div>

              <button className="w-full mt-5 py-3 rounded-full bg-emerald-600 text-white font-medium">
                Đăng ký tham gia →
              </button>
            </div>

            {/* RELATED NEWS */}
            <div>
              <h3 className="font-semibold mb-4">Tin tức liên quan</h3>

              <div className="space-y-4">
                {[
                  "Biến động giá dầu WTI tuần này",
                  "Tấm pin mặt trời hiệu suất 28%",
                  "Quy định mới về thuế môi trường",
                ].map((title) => (
                  <div
                    key={title}
                    className="flex gap-3 items-start"
                  >
                    <img
                      src="/images/news/thumb.jpg"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <p className="text-sm font-medium leading-snug">
                      {title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ===== NEWSLETTER ===== */}
        <div className="container mx-auto pb-20">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-white text-xl font-semibold">
                Đăng ký nhận bản tin
              </h3>
              <p className="text-gray-400 text-sm">
                Nhận cập nhật mới nhất về thị trường năng lượng
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <input
                placeholder="Email của bạn..."
                className="px-4 py-2 rounded-full outline-none"
              />
              <button className="px-5 py-2 rounded-full bg-emerald-600 text-white">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
