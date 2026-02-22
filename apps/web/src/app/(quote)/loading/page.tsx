'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuoteLoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/plans');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8">
      {/* Animated loader */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-[#E31837] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#E31837]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">
          Finding the best plans for you
        </h2>
        <p className="text-sm text-gray-500 max-w-xs">
          We&apos;re comparing plans to get you the best coverage at the right price
        </p>
      </div>

      {/* Progress steps */}
      <div className="space-y-3 w-full max-w-xs">
        {['Analyzing your profile', 'Comparing plans', 'Calculating premiums'].map(
          (step, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
              <div className="w-5 h-5 rounded-full bg-[#E31837] flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">{step}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
