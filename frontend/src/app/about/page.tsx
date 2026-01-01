/* ===== ABOUT PAGE (ALL IN ONE) ===== */
import Header from "@/components/home/Header"
import Footer from "@/components/home/Footer"
import Link from "next/dist/client/link";

export default function AboutPage() {
  return (
    <main>

      <Header />
      {/* ================= HERO ================= */}
      <section className="w-full" style={{ backgroundColor: "#F0FDF4" }}>
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-block mb-4 px-4 py-1 text-xs font-medium text-green-600 bg-white rounded-full">
              TÌM HIỂU VỀ CHÚNG TÔI
            </span>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-6">
              Tiên phong kết nối <br />
              <span className="text-green-600">Năng lượng xanh</span>
            </h1>

            <p className="text-gray-600 max-w-md leading-relaxed">
              Z-energy là nền tảng công nghệ hàng đầu, kết nối các doanh nghiệp
              với nguồn năng lượng bền vững và giải pháp tối ưu hóa chi phí vận hành.
            </p>
          </div>

          <div className="relative">
            <div className="h-[340px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/assets/images/pic_1.png"
                alt="Năng lượng xanh"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute -bottom-6 left-6 right-6 bg-white rounded-xl px-6 py-4 shadow-lg flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Hơn 10 năm kinh nghiệm
                </p>
                <p className="text-xs text-gray-500">
                  Dẫn đầu thị trường năng lượng số
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STORY (2 IMAGES) ================= */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative flex justify-center">
            <div className="w-[360px] h-[420px] rounded-2xl bg-gray-100 shadow-lg" />
            <div className="absolute bottom-[-30px] right-[10px] w-[260px] h-[160px] rounded-xl bg-gray-200 shadow-xl border border-white" />
          </div>

          <div>
            <p className="text-green-600 text-sm font-medium mb-3">
              CÂU CHUYỆN CỦA CHÚNG TÔI
            </p>

            <h2 className="text-3xl font-bold mb-6">
              Từ ý tưởng nhỏ đến <br /> hệ sinh thái toàn cầu
            </h2>

            <p className="text-gray-600 mb-4">
              Z-energy được thành lập năm 2014 với sứ mệnh minh bạch hóa thị trường
              năng lượng và tối ưu chuỗi cung ứng năng lượng bền vững.
            </p>

            <p className="text-gray-600 mb-8">
              Trải qua hơn một thập kỷ, Z-energy đã trở thành đối tác của hơn 5.000
              doanh nghiệp toàn cầu.
            </p>

            <div className="flex gap-10">
              <Stat value="10+" label="Năm kinh nghiệm" />
              <Stat value="5000+" label="Đối tác" />
              <Stat value="24/7" label="Hỗ trợ kỹ thuật" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CORE VALUES ================= */}
      <section className="py-24 bg-white text-center">
        <p className="text-green-600 text-sm font-medium mb-3">
          VĂN HÓA DOANH NGHIỆP
        </p>
        <h2 className="text-3xl font-bold mb-14">Giá trị cốt lõi</h2>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <Value title="Chất lượng" desc="Cam kết tiêu chuẩn quốc tế." />
          <Value title="Tin cậy" desc="Minh bạch & tôn trọng." />
          <Value title="Đổi mới" desc="Không ngừng sáng tạo." />
          <Value title="Bền vững" desc="Vì môi trường & cộng đồng." />
        </div>
      </section>

      {/* ================= TEAM ================= */}
      <section className="py-24 bg-[#F0FDF4]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-14">
            <div>
              <p className="text-green-600 text-sm mb-2">CON NGƯỜI Z-ENERGY</p>
              <h2 className="text-3xl font-bold mb-2">Đội ngũ lãnh đạo</h2>
              <p className="text-gray-600">
                Những chuyên gia định hình tương lai năng lượng.
              </p>
            </div>

            <button className="border border-green-600 text-green-600 px-6 py-2 rounded-full text-sm">
              Gia nhập đội ngũ
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <TeamCard name="Trần Minh Tuấn" role="CEO & Founder" dark />
            <TeamCard name="Nguyễn Thị Mai" role="COO" dark />
            <TeamCard name="Lê Văn Hùng" role="CTO" />
            <TeamCard name="Phạm Thu Hà" role="CSO" />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className="rounded-3xl p-14 flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #059669, #10B981)",
            }}
          >
            <div className="text-white max-w-xl">
              <h3 className="text-3xl font-bold mb-4">
                Sẵn sàng hợp tác cùng Z-energy?
              </h3>
              <p className="opacity-90">
                Đồng hành cùng doanh nghiệp trên hành trình phát triển bền vững.
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="/about/contact"
                className="bg-white text-green-700 px-6 py-3 rounded-full font-medium"
              >
                Liên hệ ngay
              </Link>

              <Link
                href="/about/register"
                className="border border-white text-white px-6 py-3 rounded-full"
              >
                Trở thành người bán
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

/* ===== SMALL COMPONENTS ===== */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-green-600 font-bold text-2xl">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function Value({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-[#F9FAFB] rounded-2xl px-6 py-10">
      <h3 className="font-semibold mb-3">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  )
}

function TeamCard({
  name,
  role,
  dark,
}: {
  name: string
  role: string
  dark?: boolean
}) {
  return (
    <div
      className={`h-[320px] rounded-3xl relative overflow-hidden ${
        dark
          ? "bg-gradient-to-b from-gray-600 to-gray-800"
          : "bg-gradient-to-br from-[#E6B86C] to-[#F5D7A1]"
      }`}
    >
      <div className="absolute bottom-6 left-6 text-white">
        <p className="font-semibold">{name}</p>
        <p className="text-sm opacity-90">{role}</p>
      </div>
    </div>

  )
}