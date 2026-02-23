'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChatWidget } from '@/features/chat';
import RouteTracker from '@/components/RouteTracker';
import ResumePrompt from '@/components/ResumePrompt';
import { useConfigSync } from '@/features/configurator/hooks/useConfigSync';
import { useConfigStore } from '@/features/configurator/store/useConfigStore';

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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <ConfigSyncBridge />
      <RouteTracker />
      {mounted && <ResumePrompt />}
      {children}
      {mounted && showChatWidget && <ChatWidget />}
    </>
  );
}
