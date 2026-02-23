const STATS = [
  { value: 'IRDAI', label: 'Approved Insurer', detail: 'Reg. No. 128' },
  { value: '98%', label: 'Claim Settlement', detail: 'FY 2024-25' },
  { value: '10,000+', label: 'Network Hospitals', detail: 'Pan India' },
  { value: '2M+', label: 'Happy Customers', detail: 'And counting' },
];

const MEDIA = [
  'The Hindu',
  'Economic Times',
  'Business Standard',
  'Mint',
  'NDTV Profit',
];

export default function TrustSection() {
  return (
    <section className="py-14 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-5 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div
                className="text-3xl font-black mb-1"
                style={{ color: '#E31837' }}
              >
                {stat.value}
              </div>
              <div className="text-gray-800 font-semibold text-sm">{stat.label}</div>
              <div className="text-gray-400 text-xs mt-0.5">{stat.detail}</div>
            </div>
          ))}
        </div>

        {/* As featured in */}
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
            As Featured In
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {MEDIA.map((outlet) => (
              <span
                key={outlet}
                className="text-gray-400 font-semibold text-sm tracking-tight"
              >
                {outlet}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
