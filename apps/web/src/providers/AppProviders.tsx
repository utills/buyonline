'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChatWidget } from '@/features/chat';
import RouteTracker from '@/components/RouteTracker';
import ResumePrompt from '@/components/ResumePrompt';
import { useConfigSync } from '@/features/configurator/hooks/useConfigSync';
import { useConfigStore } from '@/features/configurator/store/useConfigStore';
import NavBar from '@/features/landing/components/NavBar';

interface AppProvidersProps {
  children: React.ReactNode;
}

function ConfigSyncBridge() {
  useConfigSync();
  const primaryColor = useConfigStore((s) => s.config.branding.primaryColor);
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', primaryColor);
  }, [primaryColor]);
  return null;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const showChatWidget = !pathname.startsWith('/ai-journey') && !pathname.startsWith('/configurator');
  // Journey route prefixes that have their own embedded headers
  const isJourneyRoute = [
    '/otp-verify', '/terms',
    '/pincode', '/pre-existing', '/critical-conditions', '/eligibility',
    '/plans', '/addons', '/summary', '/hospitals', '/loading',
    '/proposer', '/gateway', '/payment-success',
    '/method', '/details', '/otp', '/kyc-success',
    '/personal', '/bank', '/lifestyle', '/medical', '/hospitalization', '/disability', '/declaration',
    '/complete',
  ].some((p) => pathname === p || pathname.startsWith(p + '/'));
  // Show global NavBar on landing/public pages; journey pages have their own embedded headers
  const showNavBar = !pathname.startsWith('/ai-journey') && !pathname.startsWith('/configurator') && !isJourneyRoute;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <ConfigSyncBridge />
      <RouteTracker />
      {mounted && <ResumePrompt />}
      {showNavBar && <NavBar />}
      {children}
      {mounted && showChatWidget && <ChatWidget />}
    </>
  );
}
