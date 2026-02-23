'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center space-y-5">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-[#E31837]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Something went wrong</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isDev ? error.message : 'An unexpected error occurred. Please try again.'}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mt-1">Error ID: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 py-2.5 px-4 bg-[#E31837] text-white rounded-xl text-sm font-medium hover:bg-[#B8132D] transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
