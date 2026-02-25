import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PRUHealth AI Assistant',
  description: 'Get your personalised health insurance plan with our AI-powered assistant.',
};

export default function AIJourneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <a
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Back to home"
        >
          <svg
            className="w-4 h-4"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </a>

        <div className="flex items-center gap-2 ml-2">
          <img
            src="/prudential-logo.svg"
            alt="Prudential"
            height={22}
            className="h-[22px] w-auto"
          />
          <span className="font-semibold text-gray-500 text-sm">AI Assistant</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true" />
          <span className="text-xs text-gray-500">AI Active</span>
        </div>
      </header>

      {children}
    </div>
  );
}
