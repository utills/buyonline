'use client';

import React, { useEffect, useState } from 'react';
import ChatWidget from '@/components/chat/ChatWidget';

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
      {children}
      {mounted && <ChatWidget />}
    </>
  );
}
