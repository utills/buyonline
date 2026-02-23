export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #E31837 0%, #8B0000 100%)' }}
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

          {/* Right: AI chat mockup illustration */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Chat header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: '#E31837' }}
              >
                <div className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">BuyOnline AI</p>
                  <p className="text-red-200 text-xs">Online now</p>
                </div>
                <div className="ml-auto w-2.5 h-2.5 bg-green-400 rounded-full"></div>
              </div>

              {/* Chat bubbles */}
              <div className="bg-gray-50 px-4 py-5 space-y-3 min-h-[180px]">
                <div className="flex gap-2 items-end">
                  <div className="w-7 h-7 rounded-full bg-red-100 shrink-0 flex items-center justify-center text-xs font-bold text-red-700">
                    AI
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm max-w-[75%]">
                    <p className="text-gray-800 text-sm">Hi! How many people need coverage?</p>
                  </div>
                </div>
                <div className="flex gap-2 items-end justify-end">
                  <div
                    className="rounded-2xl rounded-br-sm px-3 py-2 max-w-[75%]"
                    style={{ backgroundColor: '#E31837' }}
                  >
                    <p className="text-white text-sm">My family of 4</p>
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="w-7 h-7 rounded-full bg-red-100 shrink-0 flex items-center justify-center text-xs font-bold text-red-700">
                    AI
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm max-w-[75%]">
                    <p className="text-gray-800 text-sm">Great! I found 3 plans starting at</p>
                    <p className="font-bold text-sm mt-0.5" style={{ color: '#E31837' }}>
                      Rs. 8,200/year
                    </p>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2 bg-white">
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-400">
                  Type your answer…
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#E31837' }}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
              </div>
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
