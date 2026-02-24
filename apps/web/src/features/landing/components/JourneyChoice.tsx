'use client';

import Link from 'next/link';
import { useJourneyConfig } from '@/features/configurator/hooks/useJourneyConfig';

const AI_STEPS = [
  'Chat about your family size',
  'Verify your identity (OTP)',
  'AI picks your best plan',
  'Review & pay — done',
];

const CLASSIC_STEPS = [
  'Enter your pincode',
  'Browse available plans',
  'Fill health details',
  'Review & pay — done',
];

const COMPARISON = [
  { label: 'Time required', ai: '~3 minutes', classic: '~8 minutes' },
  { label: 'Data entry', ai: 'Conversational', classic: 'Form-based' },
  { label: 'Plan selection', ai: 'AI recommended', classic: 'Manual browse' },
];

export default function JourneyChoice() {
  const { chatConfig } = useJourneyConfig();
  const showAI = chatConfig.agenticEnabled;

  return (
    <section id="choose-journey" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Choose Your Journey
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Two ways to get insured. Same great coverage, different experience.
          </p>
        </div>

        {/* Cards */}
        <div className={`grid grid-cols-1 ${showAI ? 'md:grid-cols-2' : ''} gap-6 max-w-4xl mx-auto`}>
          {/* AI Journey Card — highlighted */}
          {showAI && <div
            className="relative bg-white rounded-2xl border-2 shadow-lg flex flex-col overflow-hidden"
            style={{ borderColor: 'var(--brand-color, #ED1B2D)' }}
          >
            {/* Recommended badge */}
            <div
              className="absolute top-0 left-0 right-0 text-white text-xs font-bold text-center py-1.5 tracking-widest uppercase"
              style={{ backgroundColor: 'var(--brand-color, #ED1B2D)' }}
            >
              Recommended
            </div>

            <div className="pt-10 px-6 pb-6 flex flex-col flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--brand-color, #ED1B2D) 15%, white)' }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: 'var(--brand-color, #ED1B2D)' }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Chat with AI</h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Answer 5 questions. Get your perfect plan.
                  </p>
                </div>
              </div>

              {/* Steps */}
              <ol className="space-y-2.5 mb-5 mt-2">
                {AI_STEPS.map((step, i) => (
                  <li key={step} className="flex items-center gap-3 text-sm text-gray-700">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: 'var(--brand-color, #ED1B2D)' }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              {/* Time badge */}
              <div className="flex items-center gap-2 mb-6">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  ~3 minutes
                </span>
              </div>

              <div className="mt-auto">
                <Link
                  href="/ai-journey"
                  className="block w-full text-center py-3 px-4 rounded-xl text-white font-semibold text-sm transition-colors"
                  style={{ backgroundColor: 'var(--brand-color, #ED1B2D)' }}
                >
                  Start AI Journey &rarr;
                </Link>
              </div>
            </div>

            {/* Comparison row */}
            <div className="border-t border-gray-100 px-6 py-4 bg-red-50/50">
              <p className="text-xs text-gray-500 font-medium">
                AI recommends the plan that fits your budget and needs
              </p>
            </div>
          </div>}

          {/* Classic Journey Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-6 py-6 flex flex-col flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Step-by-Step Forms</h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Fill forms at your own pace. Full control.
                  </p>
                </div>
              </div>

              {/* Steps */}
              <ol className="space-y-2.5 mb-5 mt-2">
                {CLASSIC_STEPS.map((step, i) => (
                  <li key={step} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              {/* Time badge */}
              <div className="flex items-center gap-2 mb-6">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  ~8 minutes
                </span>
              </div>

              <div className="mt-auto">
                <Link
                  href="/otp-verify"
                  className="block w-full text-center py-3 px-4 rounded-xl text-gray-700 font-semibold text-sm border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  Start Classic Journey &rarr;
                </Link>
              </div>
            </div>

            {/* Comparison row */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
              <p className="text-xs text-gray-500 font-medium">
                Browse all plans manually and choose what suits you best
              </p>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200">
              <div className="px-5 py-3">Feature</div>
              <div className="px-5 py-3 text-center" style={{ color: 'var(--brand-color, #ED1B2D)' }}>AI Journey</div>
              <div className="px-5 py-3 text-center text-gray-500">Classic</div>
            </div>
            {COMPARISON.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 text-sm ${idx < COMPARISON.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="px-5 py-3 text-gray-600 font-medium">{row.label}</div>
                <div className="px-5 py-3 text-center font-semibold" style={{ color: 'var(--brand-color, #ED1B2D)' }}>
                  {row.ai}
                </div>
                <div className="px-5 py-3 text-center text-gray-500">{row.classic}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
