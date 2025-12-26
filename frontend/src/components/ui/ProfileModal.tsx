export default function ProfileModal({
  title,
  children,
  isOpen,
  onClose,
}: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-[32px] p-10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
        <div className="space-y-6">{children}</div>
        <div className="mt-10 flex justify-center">
          <button
            onClick={onClose}
            className="bg-[#D9D9D9] hover:bg-gray-300 px-12 py-3 rounded-2xl font-bold transition shadow-sm"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
