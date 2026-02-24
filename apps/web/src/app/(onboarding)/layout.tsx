'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useJourneyNav } from '@/features/configurator/hooks/useJourneyNav';

const FALLBACK_BACK_PATHS: Record<string, string> = {
  '/pincode': '/',
  '/pre-existing': '/pincode',
  '/critical-conditions': '/pre-existing',
  '/eligibility': '/critical-conditions',
};

const ONBOARDING_ROUTE_SET = ['/pincode', '/pre-existing', '/critical-conditions', '/eligibility'];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { prevRoute, enabledRoutes } = useJourneyNav();

  const onboardingRoutes = ONBOARDING_ROUTE_SET.filter((r) =>
    enabledRoutes.length === 0 ? true : enabledRoutes.includes(r),
  );
  const step = (onboardingRoutes.indexOf(pathname) ?? -1) + 1 || 1;
  const total = Math.max(onboardingRoutes.length, 1);
  const progress = Math.round((step / total) * 100);
  const backPath = prevRoute(pathname, FALLBACK_BACK_PATHS[pathname] ?? '/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          {/* Back button */}
          <Link
            href={backPath}
            aria-label="Go back"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          {/* Logo */}
          <img
            src="/prudential-logo.svg"
            alt="Prudential"
            height={20}
            className="h-5 w-auto"
          />

          {/* Step label */}
          <span className="text-xs font-medium text-gray-500">{step} / {total}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-[#ED1B2D] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
