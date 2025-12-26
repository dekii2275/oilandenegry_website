"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    message: "",
  });

  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(
        () => setNotification({ ...notification, show: false }),
        5000
      );
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Hàm xử lý gửi dữ liệu qua Apps Script
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra điền đủ các ô có dấu sao đỏ
    if (
      !formData.fullname ||
      !formData.email ||
      !formData.phone ||
      !formData.message
    ) {
      setNotification({
        show: true,
        type: "error",
        message: "Vui lòng điền đầy đủ các thông tin bắt buộc (*)",
      });
      return;
    }

    setIsLoading(true);

    const SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbxRU56a32UP84FYc9Qp96i3eC2IdYYPUkBHnSrmQ8GSnAsXDl04ReuD3q9LvPYBb2J6/exec";

    try {
      const params = new URLSearchParams();
      params.append("fullname", formData.fullname);
      params.append("email", formData.email);
      params.append("phone", formData.phone);
      params.append("message", formData.message);

      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      setNotification({
        show: true,
        type: "success",
        message: "Gửi thành công!",
      });

      setFormData({ fullname: "", email: "", phone: "", message: "" });
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Có lỗi xảy ra khi gửi. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#f0f9f4] py-16 px-4 relative font-sans">
        {notification.show && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
                notification.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              {notification.type === "error" ? (
                <AlertCircle size={24} />
              ) : (
                <CheckCircle2 size={24} />
              )}
              <span className="font-bold">{notification.message}</span>
              <button
                onClick={() =>
                  setNotification({ ...notification, show: false })
                }
                className="ml-4 hover:opacity-70"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-white border border-green-200 rounded-full text-[#76C893] text-xs font-bold tracking-wider mb-6 shadow-sm">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              HỖ TRỢ TƯ VẤN
            </div>
            <h1 className="text-5xl font-extrabold text-[#2D3436] mb-6 tracking-tight">
              Liên hệ với <span className="text-[#55A67A]">Z-energy</span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-500 leading-relaxed text-sm">
              Chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn trên hành
              trình năng lượng sạch. Hãy để lại thông tin, đội ngũ chuyên gia
              của chúng tôi sẽ phản hồi sớm nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Để lại lời nhắn
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-[#76c893]/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="example@gmail.com"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-[#76c893]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase text-gray-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      type="tel"
                      placeholder="09xx xxx xxx"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-[#76c893]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 uppercase text-gray-700">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Bạn cần chúng tôi giúp gì?..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-[#76c893]/20 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#76c893] hover:bg-[#65b381] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Gửi tin nhắn <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex items-start gap-4">
                <MapPin className="text-blue-500" size={24} />
                <div>
                  <h3 className="font-bold text-gray-800">Địa chỉ</h3>
                  <p className="text-sm text-gray-500">
                    328 Nguyễn Trãi, Thanh Xuân, Hà Nội
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex items-start gap-4">
                <Phone className="text-green-500" size={24} />
                <div>
                  <h3 className="font-bold text-gray-800">Hotline</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    (+84) 24 3283 2828
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex items-start gap-4">
                <Mail className="text-orange-500" size={24} />
                <div>
                  <h3 className="font-bold text-gray-800">Email</h3>
                  <p className="text-sm text-[#76c893] font-bold">
                    hotro@z-energy.com.vn
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-3xl overflow-hidden border-4 border-white shadow-md h-[280px]">
                <iframe
                  title="328 Nguyen Trai Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.786576829774!2d105.80373077503064!3d20.999187380641154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac9639e31999%3A0x673418728a49c6!2zMzI4IE5ndXnhu4VuIFRyw6NpLCBUaGFuaCBYdcOibiBUcnVuZywgVGhhbmggWHXDom4sIEjDoCBO4buZaSwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1703584500000!5m2!1sen!2s"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
