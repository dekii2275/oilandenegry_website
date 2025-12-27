/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com", 
      "plus.unsplash.com",
      "via.placeholder.com"
    ],
    // Hoặc dùng remotePatterns (cho Next.js bản mới):
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Chấp nhận mọi ảnh (cho tiện lúc dev)
      },
    ],
  },
};

module.exports = nextConfig;