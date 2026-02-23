'use client';

import React from 'react';
import type { SyncStatus } from '../../types';

interface SyncStatusPillProps {
  status: SyncStatus;
  lastSyncedAt: string | null;
}

const statusConfig: Record<SyncStatus, { label: string; color: string; iconClass?: string }> = {
  synced:  { label: 'Saved',    color: 'var(--cfg-success)' },
  syncing: { label: 'Saving…',  color: 'var(--cfg-warning)', iconClass: 'cfg-animate-spin-slow' },
  dirty:   { label: 'Unsaved',  color: 'var(--cfg-warning)' },
  offline: { label: 'Offline',  color: 'var(--cfg-text-faint)' },
};

export const SyncStatusPill: React.FC<SyncStatusPillProps> = ({ status, lastSyncedAt }) => {
  const cfg = statusConfig[status];

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{ background: 'var(--cfg-surface-2)' }}
    >
      <span
        className={[
          'w-2 h-2 rounded-full flex-shrink-0',
          status === 'dirty'   ? 'cfg-animate-pulse-dot' : '',
          status === 'syncing' ? 'cfg-animate-pulse-dot' : '',
        ].filter(Boolean).join(' ')}
        style={{ background: cfg.color }}
      />
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        {status === 'synced' && lastSyncedAt && (
          <span className="text-xs truncate" style={{ color: 'var(--cfg-text-faint)' }}>
            {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {status === 'offline' && (
          <span className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>
            Local only
          </span>
        )}
      </div>
    </div>
  );
};
