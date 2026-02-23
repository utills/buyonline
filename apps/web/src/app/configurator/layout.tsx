import React from 'react';
import './globals.css';
import { ConfiguratorShell } from '@/features/configurator/components/layout/ConfiguratorShell';

export const metadata = {
  title: 'Configurator — BuyOnline Admin',
  description: 'Configure the BuyOnline journey workflow',
};

export default function ConfiguratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfiguratorShell>
      {children}
    </ConfiguratorShell>
  );
}
