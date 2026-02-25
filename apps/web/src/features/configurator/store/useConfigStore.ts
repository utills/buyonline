'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  JourneyConfig,
  JourneyPhaseConfig,
  PlanConfig,
  AddonConfig,
  HealthQuestionConfig,
  ChatConfig,
  BrandingConfig,
  FeatureFlags,
} from '@buyonline/shared-types';
import type { SyncStatus } from '../types';
import { DEFAULT_CONFIG } from './default-config';

interface ConfigState {
  config: JourneyConfig;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  isDirty: boolean;

  updateConfig: (partial: Partial<JourneyConfig>) => void;
  updatePhases: (phases: JourneyPhaseConfig[]) => void;
  updatePlans: (plans: PlanConfig[]) => void;
  updateAddons: (addons: AddonConfig[]) => void;
  updateHealthQuestions: (questions: HealthQuestionConfig[]) => void;
  updateChat: (chat: Partial<ChatConfig>) => void;
  updateBranding: (branding: Partial<BrandingConfig>) => void;
  updateFeatureFlags: (flags: Partial<FeatureFlags>) => void;

  setSyncStatus: (status: SyncStatus) => void;
  markSynced: (at?: string) => void;
  markOffline: () => void;
  reset: () => void;
}

const initialState = {
  config: DEFAULT_CONFIG,
  syncStatus: 'synced' as SyncStatus,
  lastSyncedAt: null as string | null,
  isDirty: false,
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      ...initialState,

      updateConfig: (partial) =>
        set((s) => ({
          config: { ...s.config, ...partial, updatedAt: new Date().toISOString() },
          isDirty: true,
          syncStatus: 'dirty',
        })),

      updatePhases: (phases) =>
        set((s) => ({
          config: { ...s.config, phases, updatedAt: new Date().toISOString() },
          isDirty: true,
          syncStatus: 'dirty',
        })),

      updatePlans: (plans) =>
        set((s) => ({
          config: { ...s.config, plans, updatedAt: new Date().toISOString() },
          isDirty: true,
          syncStatus: 'dirty',
        })),

      updateAddons: (addons) =>
        set((s) => ({
          config: { ...s.config, addons, updatedAt: new Date().toISOString() },
          isDirty: true,
          syncStatus: 'dirty',
        })),

      updateHealthQuestions: (healthQuestions) =>
        set((s) => ({
          config: { ...s.config, healthQuestions, updatedAt: new Date().toISOString() },
          isDirty: true,
          syncStatus: 'dirty',
        })),

      updateChat: (chat) =>
        set((s) => ({
          config: { ...s.config, chat: { ...s.config.chat, ...chat }, updatedAt: new Date().toISOString() },
          isDirty: true,
          syncStatus: 'dirty',
        })),

      updateBranding: (branding) =>
        set((s) => ({
          config: { ...s.config, branding: { ...s.config.branding, ...branding }, updatedAt: new Date().toISOString() },
          isDirty: true,
          syncStatus: 'dirty',
        })),

      updateFeatureFlags: (flags) =>
        set((s) => ({
          config: { ...s.config, featureFlags: { ...s.config.featureFlags, ...flags }, updatedAt: new Date().toISOString() },
          isDirty: true,
          syncStatus: 'dirty',
        })),

      setSyncStatus: (syncStatus) => set({ syncStatus }),

      markSynced: (at) =>
        set({
          isDirty: false,
          syncStatus: 'synced',
          lastSyncedAt: at ?? new Date().toISOString(),
        }),

      markOffline: () => set({ syncStatus: 'offline' }),

      reset: () =>
        set({
          config: { ...DEFAULT_CONFIG, updatedAt: new Date().toISOString() },
          isDirty: true,
          syncStatus: 'dirty',
        }),
    }),
    {
      name: 'buyonline-configurator',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted: unknown, fromVersion: number) => {
        // v3: added plan-flagship4 + missing plans to default config
        // v2: fixed health phase step order + added declaration step
        if (fromVersion < 3) {
          return { ...(persisted as object), config: DEFAULT_CONFIG };
        }
        return persisted as ConfigState;
      },
    }
  )
);
