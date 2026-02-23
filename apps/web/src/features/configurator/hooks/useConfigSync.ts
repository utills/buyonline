'use client';

import { useEffect, useRef } from 'react';
import { useConfigStore } from '../store/useConfigStore';

const SYNC_DEBOUNCE_MS = 1500;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export function useConfigSync() {
  const { config, isDirty, syncStatus, markSynced, markOffline, setSyncStatus } = useConfigStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMounted = useRef(false);

  // On mount: fetch server config and replace local if server is newer than our last sync
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    const fetchServerConfig = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/configurator/config`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.config) return;
        const serverTs     = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
        const lastSyncedTs = useConfigStore.getState().lastSyncedAt
          ? new Date(useConfigStore.getState().lastSyncedAt!).getTime()
          : 0;
        if (serverTs > lastSyncedTs) {
          // Server has a config newer than our last known sync — take it
          useConfigStore.setState({ config: data.config, isDirty: false, syncStatus: 'synced', lastSyncedAt: data.updatedAt });
        }
      } catch {
        // Server unavailable — localStorage is source of truth
        markOffline();
      }
    };

    fetchServerConfig();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced sync on isDirty change
  useEffect(() => {
    if (!isDirty) return;
    if (syncStatus === 'syncing') return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        const res = await fetch(`${API_BASE}/api/v1/configurator/config`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config }),
        });
        if (!res.ok) throw new Error('Sync failed');
        const data = await res.json();
        markSynced(data.updatedAt);
      } catch {
        markOffline();
      }
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, config]); // eslint-disable-line react-hooks/exhaustive-deps
}
