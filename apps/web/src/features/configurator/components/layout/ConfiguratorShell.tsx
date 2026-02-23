'use client';

import React from 'react';
import { ConfigSidebar } from './ConfigSidebar';
import { useConfigSync } from '../../hooks/useConfigSync';

interface ConfiguratorShellProps {
  children: React.ReactNode;
}

export const ConfiguratorShell: React.FC<ConfiguratorShellProps> = ({ children }) => {
  useConfigSync();

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--cfg-bg)', color: 'var(--cfg-text)' }}
    >
      <ConfigSidebar />
      <main
        className="min-h-screen flex flex-col"
        style={{ marginLeft: 'var(--cfg-sidebar-width)' }}
      >
        {children}
      </main>
    </div>
  );
};
