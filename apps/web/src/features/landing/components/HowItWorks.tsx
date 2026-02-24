const AI_JOURNEY_STEPS = [
  {
    number: '01',
    title: 'Chat with AI',
    description:
      'Tell our AI about your family size, age, and health needs in plain language. No forms yet.',
  },
  {
    number: '02',
    title: 'Verify Your Identity',
    description:
      'Enter your mobile number and confirm with a one-time password. Takes 30 seconds.',
  },
  {
    number: '03',
    title: 'Pick Your Plan',
    description:
      'AI recommends the top 3 plans ranked for your budget and coverage needs. Compare and choose.',
  },
  {
    number: '04',
    title: 'Pay & Get Covered',
    description:
      'Pay securely online. Policy document delivered to your email instantly.',
  },
];

const CLASSIC_STEPS = [
  {
    number: '01',
    title: 'Enter Your Pincode',
    description:
      'Start by entering your pincode to see plans available in your area.',
  },
  {
    number: '02',
    title: 'Choose Coverage',
    description:
      'Browse all available plans. Filter by sum insured, premium, and features.',
  },
  {
    number: '03',
    title: 'Fill Your Details',
    description:
      'Complete the proposal form with member details and health declarations.',
  },
  {
    number: '04',
    title: 'Pay & Get Covered',
    description:
      'Review your summary, pay securely, and receive your policy document.',
  },
];

function StepCard({
  step,
  accent,
}: {
  step: { number: string; title: string; description: string };
  accent: string;
}) {
  return (
    <div className="flex gap-4">
      <div
        className="text-2xl font-black shrink-0 w-10 text-right leading-none mt-0.5"
        style={{ color: accent, opacity: 0.25 }}
      >
        {step.number}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 text-lg">Two paths, one destination — the right coverage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* AI Journey column */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: '#ED1B2D' }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                With AI
              </div>
              <span className="text-xs text-gray-400 font-medium">~3 minutes</span>
            </div>

            <div className="space-y-8 pl-2 border-l-2 border-red-100 ml-5">
              {AI_JOURNEY_STEPS.map((step) => (
                <StepCard key={step.number} step={step} accent="#ED1B2D" />
              ))}
            </div>
          </div>

          {/* Classic Journey column */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-gray-700 bg-gray-100">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                Step-by-Step
              </div>
              <span className="text-xs text-gray-400 font-medium">~8 minutes</span>
            </div>

            <div className="space-y-8 pl-2 border-l-2 border-gray-100 ml-5">
              {CLASSIC_STEPS.map((step) => (
                <StepCard key={step.number} step={step} accent="#6B7280" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
