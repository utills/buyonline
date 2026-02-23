'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChatWidget } from '@/features/chat';
import RouteTracker from '@/components/RouteTracker';
import ResumePrompt from '@/components/ResumePrompt';

interface AppProvidersProps {
  children: React.ReactNode;
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
      <RouteTracker />
      {mounted && <ResumePrompt />}
      {children}
      {mounted && showChatWidget && <ChatWidget />}
    </>
  );
}
