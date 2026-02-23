export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#E31837] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#E31837] font-bold text-lg">P</span>
        </div>
      </div>
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  );
}
