'use client';

export default function HeroBanner() {
  return (
    <section className="relative w-full bg-gradient-to-br from-[#ED1B2D] to-[#C8162A] overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="relative max-w-md mx-auto px-6 py-12 text-white">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#ED1B2D] font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Prudential</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold leading-tight mb-4">
          India&apos;s health insurance that puts your family first
        </h1>

        {/* Subtext */}
        <p className="text-white/80 text-base leading-relaxed mb-2">
          Comprehensive health coverage starting at just Rs 500/month.
          Cashless treatment at 10,000+ hospitals.
        </p>

        {/* Trust badges */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-1.5 text-sm text-white/90">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>IRDAI Approved</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/90">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Claim Ratio 98%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
