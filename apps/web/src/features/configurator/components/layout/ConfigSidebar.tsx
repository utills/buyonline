'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SyncStatusPill } from '../shared/SyncStatusPill';
import { useConfigStore } from '../../store/useConfigStore';

const NAV_ITEMS = [
  { href: '/configurator',          label: 'Overview',         icon: '⬡' },
  { href: '/configurator/journey',  label: 'Journey Flow',     icon: '⟶' },
  { href: '/configurator/plans',    label: 'Plans & Addons',   icon: '◈' },
  { href: '/configurator/health',   label: 'Health Questions', icon: '♥' },
  { href: '/configurator/chat',     label: 'Chat & AI',        icon: '◎' },
  { href: '/configurator/branding', label: 'Branding',         icon: '◆' },
  { href: '/configurator/preview',  label: 'Preview',          icon: '▷' },
];

export const ConfigSidebar: React.FC = () => {
  const pathname = usePathname();
  const { syncStatus, lastSyncedAt } = useConfigStore();

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col cfg-animate-slide-in"
      style={{
        width: 'var(--cfg-sidebar-width)',
        background: 'var(--cfg-surface)',
        borderRight: '1px solid var(--cfg-border)',
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid var(--cfg-border)', height: 'var(--cfg-header-height)' }}
      >
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--cfg-accent)', color: '#fff' }}
        >
          C
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--cfg-text)' }}>
            Configurator
          </div>
          <div className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>
            BuyOnline Admin
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto cfg-scroll">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== '/configurator' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  `cfg-animate-fade-up cfg-delay-${Math.min(idx + 1, 6)}`,
                ].join(' ')}
                style={{
                  background: isActive ? 'var(--cfg-accent-dim)' : 'transparent',
                  color: isActive ? 'var(--cfg-accent)' : 'var(--cfg-text-muted)',
                  borderLeft: isActive ? '2px solid var(--cfg-accent)' : '2px solid transparent',
                }}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sync Status */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--cfg-border)' }}>
        <SyncStatusPill status={syncStatus} lastSyncedAt={lastSyncedAt} />
      </div>
    </aside>
  );
};
