import SuccessNotification from "@/components/auth/SuccessNotification";

interface Props {
  searchParams?: {
    email?: string;
    token?: string; // Thêm token nếu cần
  };
}

export default function RegisterSuccessPage({ searchParams }: Props) {
  const email = searchParams?.email;
  const token = searchParams?.token; // Lấy token nếu có

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-6 py-12"
      style={{
        backgroundImage: "url('/assets/images/register_background.png')",
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full">
        <SuccessNotification
          variant="email"
          email={email}
          showEmailVerification={true}
          verificationToken={token} // Truyền token cho development
        />
      </div>
    </div>
  );
}
