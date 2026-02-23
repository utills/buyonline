import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="text-8xl font-bold text-gray-100 select-none">404</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="text-gray-500 text-sm max-w-xs">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 bg-[#E31837] text-white rounded-xl text-sm font-medium hover:bg-[#B8132D] transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/ai-journey"
          className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Try AI Journey
        </Link>
      </div>
    </div>
  );
}
