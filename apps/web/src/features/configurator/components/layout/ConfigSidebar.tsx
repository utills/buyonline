'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SyncStatusPill } from '../shared/SyncStatusPill';
import { useConfigStore } from '../../store/useConfigStore';

/* ── SVG nav icons ──────────────────────────────────────────────────────── */

const IconOverview = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" />
    <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" />
    <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" />
    <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" />
  </svg>
);

const IconJourney = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="3" cy="9" r="2" />
    <circle cx="9" cy="9" r="2" />
    <circle cx="15" cy="9" r="2" />
    <path d="M5 9h2M11 9h2" />
    <path d="M12.5 6.5L15 9l-2.5 2.5" />
  </svg>
);

const IconPlans = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="14" height="4.5" rx="1.5" />
    <rect x="2" y="8.5" width="14" height="4.5" rx="1.5" />
    <path d="M2 16h8" />
    <path d="M14 14.5v3M12.5 16h3" />
  </svg>
);

const IconHealth = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 16S2 11.5 2 6.5A4.5 4.5 0 019 3a4.5 4.5 0 017 3.5C16 11.5 9 16 9 16z" />
    <path d="M6.5 9H9V7h1.5V9H13v1.5h-2.5V13H9v-2.5H6.5V9z" />
  </svg>
);

const IconChat = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3.5A1.5 1.5 0 013.5 2h11A1.5 1.5 0 0116 3.5v8A1.5 1.5 0 0114.5 13H6l-4 3V3.5z" />
    <path d="M5.5 6.5h7M5.5 9.5h4.5" />
  </svg>
);

const IconBranding = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" />
    <circle cx="9" cy="5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="13" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
    <path d="M9 6.5v1.5l3.5 2.5M9 8l-3.5 2.5" />
  </svg>
);

const IconPreview = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 9S4.5 3.5 9 3.5 16.5 9 16.5 9 13.5 14.5 9 14.5 1.5 9 1.5 9z" />
    <circle cx="9" cy="9" r="2.5" />
  </svg>
);

const IconPosts = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="14" height="14" rx="2" />
    <path d="M5 6h8M5 9h8M5 12h5" />
  </svg>
);

/* ── Nav items ──────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { href: '/configurator',           label: 'Overview',         Icon: IconOverview  },
  { href: '/configurator/journey',   label: 'Journey Flow',     Icon: IconJourney   },
  { href: '/configurator/plans',     label: 'Plans & Addons',   Icon: IconPlans     },
  { href: '/configurator/health',    label: 'Health Questions', Icon: IconHealth    },
  { href: '/configurator/chat',      label: 'Chat & AI',        Icon: IconChat      },
  { href: '/configurator/branding',  label: 'Branding',         Icon: IconBranding  },
  { href: '/configurator/posts',     label: 'Posts',            Icon: IconPosts     },
  { href: '/configurator/preview',   label: 'Preview & Export', Icon: IconPreview   },
];

/* ── Logo mark ──────────────────────────────────────────────────────────── */

const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="var(--cfg-accent)" />
    <path
      d="M8 10h12M8 14h8M8 18h10"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="18" r="3" fill="white" />
    <path d="M19 18h2M20 17v2" stroke="var(--cfg-accent)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* ── Component ──────────────────────────────────────────────────────────── */

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
      {/* Logo / brand header */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{
          borderBottom: '1px solid var(--cfg-border)',
          height: 'var(--cfg-header-height)',
        }}
      >
        <LogoMark />
        <div>
          <div className="text-sm font-bold leading-tight" style={{ color: 'var(--cfg-text)' }}>
            Configurator
          </div>
          <div className="text-xs leading-tight" style={{ color: 'var(--cfg-text-faint)' }}>
            BuyOnline Admin
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto cfg-scroll space-y-0.5">
        <div
          className="px-2 mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--cfg-text-faint)' }}
        >
          Navigation
        </div>

        {NAV_ITEMS.map(({ href, label, Icon }, idx) => {
          const isActive =
            pathname === href ||
            (href !== '/configurator' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cfg-animate-fade-up cfg-delay-${Math.min(idx + 1, 6)}`}
              style={{
                background: isActive ? 'var(--cfg-accent-dim)' : 'transparent',
                color: isActive ? 'var(--cfg-accent)' : 'var(--cfg-text-muted)',
                borderLeft: `2px solid ${isActive ? 'var(--cfg-accent)' : 'transparent'}`,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sync status at bottom */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid var(--cfg-border)' }}>
        <SyncStatusPill status={syncStatus} lastSyncedAt={lastSyncedAt} />
      </div>
    </aside>
  );
};
