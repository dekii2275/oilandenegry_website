import SuccessNotification from '@/components/auth/SuccessNotification'

export default function RegisterSuccessPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-6 py-12"
      style={{
        backgroundImage: "url('/assets/images/register_background.png')"
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 w-full">
        <SuccessNotification variant="email" />
      </div>
    </div>
  )
}

