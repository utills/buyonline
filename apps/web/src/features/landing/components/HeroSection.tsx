import JourneyPicker from './JourneyPicker';

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--brand-color, #E31837) 0%, color-mix(in srgb, var(--brand-color, #E31837) 60%, black) 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Headline & bullets */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-medium mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
              IRDAI Approved &bull; Trusted by 2M+ customers
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Health Insurance
              <br />
              <span className="text-red-200">Made Simple.</span>
            </h1>
            <p className="text-red-100 text-lg mb-8 leading-relaxed">
              Get the right coverage for your family in minutes.
              Our AI guides you or you can fill forms at your own pace.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                'IRDAI Approved — 100% compliant',
                '98% claim settlement ratio',
                '10,000+ network hospitals across India',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-red-50">
                  <svg
                    className="w-5 h-5 text-green-400 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Journey picker — AI or Classic with lead capture */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-sm">
              <JourneyPicker />
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-12 flex flex-col items-center gap-2 text-red-200 text-sm">
          <p>Choose how you would like to apply</p>
          <svg
            className="w-5 h-5 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </section>
  );
}
