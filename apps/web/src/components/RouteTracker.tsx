'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Landing',
  '/otp-verify': 'OTP Verification',
  '/terms': 'Terms & Consent',
  '/pincode': 'Pincode Entry',
  '/pre-existing': 'Pre-existing Conditions',
  '/critical-conditions': 'Critical Conditions',
  '/eligibility': 'Eligibility Check',
  '/loading': 'Fetching Quotes',
  '/plans': 'Plan Selection',
  '/addons': 'Add-ons',
  '/summary': 'Quote Summary',
  '/proposer': 'Proposer Details',
  '/gateway': 'Payment Gateway',
  '/payment-success': 'Payment Success',
  '/method': 'KYC Method',
  '/details': 'KYC Details',
  '/otp': 'KYC OTP Verification',
  '/kyc-success': 'KYC Complete',
  '/personal': 'Personal Details',
  '/lifestyle': 'Lifestyle Questions',
  '/medical': 'Medical History',
  '/hospitalization': 'Hospitalization History',
  '/disability': 'Disability Details',
  '/bank': 'Bank Details',
  '/complete': 'Application Complete',
  '/ai-journey': 'AI Journey',
};

// Pages that shouldn't be saved as resume points
const NO_TRACK = new Set(['/', '/complete']);

export interface SavedRoute {
  url: string;
  pathname: string;
  label: string;
  timestamp: string;
}

export const RESUME_KEY = 'buyonline-current-url';

export default function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip landing, complete, and resume pages
    if (NO_TRACK.has(pathname) || pathname.startsWith('/r/')) return;

    const label = ROUTE_LABELS[pathname] ?? pathname;
    const url = window.location.href;

    const entry: SavedRoute = {
      url,
      pathname,
      label,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(RESUME_KEY, JSON.stringify(entry));
    } catch { /* storage full or unavailable */ }

    console.log(`[BuyOnline] ➜ ${label}  |  ${url}`);
  }, [pathname]);

  return null;
}
