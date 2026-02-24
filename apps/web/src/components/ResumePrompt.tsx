'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { RESUME_KEY } from './RouteTracker';
import type { SavedRoute } from './RouteTracker';

export default function ResumePrompt() {
  const pathname = usePathname();
  const router = useRouter();
  const [saved, setSaved] = useState<SavedRoute | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Only show the prompt on the landing page
    if (pathname !== '/') return;

    try {
      const raw = localStorage.getItem(RESUME_KEY);
      if (!raw) return;
      const entry: SavedRoute = JSON.parse(raw);
      // Don't show if already on that page
      if (entry.pathname === pathname) return;
      setSaved(entry);
    } catch { /* malformed or missing */ }
  }, [pathname]);

  if (!saved) return null;

  const handleResume = () => {
    setSaved(null);
    router.push(saved.pathname);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(saved.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard denied */ }
  };

  const handleDismiss = () => {
    localStorage.removeItem(RESUME_KEY);
    setSaved(null);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
        {/* Icon */}
        <div className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-[#ED1B2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Continue where you left off?</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{saved.label}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate font-mono">{saved.url}</p>

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <button
              onClick={handleResume}
              className="text-xs bg-[#ED1B2D] text-white px-3 py-1.5 rounded-full font-medium hover:bg-[#C8162A] transition-colors"
            >
              Resume
            </button>
            <button
              onClick={handleCopy}
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy link
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-400 hover:text-gray-600 ml-auto transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
