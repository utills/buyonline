'use client';

import React, { useEffect, useState } from 'react';
import { ChatWidget } from '@/features/chat';
import RouteTracker from '@/components/RouteTracker';
import ResumePrompt from '@/components/ResumePrompt';

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <RouteTracker />
      {mounted && <ResumePrompt />}
      {children}
      {mounted && <ChatWidget />}
    </>
  );
}
