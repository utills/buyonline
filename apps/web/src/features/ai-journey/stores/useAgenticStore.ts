import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  AgenticPhase,
  AgenticMessage,
  AgenticCollectedData,
} from '../types';

// A flexible partial update type that allows partial nested member fields
export type CollectedDataUpdate = {
  members?: Partial<AgenticCollectedData['members']>;
  eldestAge?: number;
  mobile?: string;
  pincode?: string;
  hospitalCount?: number;
  preExisting?: string[];
  planSelected?: AgenticCollectedData['planSelected'];
  kycVerified?: boolean;
  healthSubmitted?: boolean;
  paymentDone?: boolean;
};

// ─── Store Shape ──────────────────────────────────────────────────────────────
interface AgenticStore {
  // State
  phase: AgenticPhase;
  sessionId: string;
  applicationId: string | null;
  leadId: string | null;
  collectedData: Partial<AgenticCollectedData>;
  messages: AgenticMessage[];

  // Actions
  setPhase: (phase: AgenticPhase) => void;
  setApplicationId: (id: string) => void;
  setLeadId: (id: string) => void;
  updateCollectedData: (update: CollectedDataUpdate) => void;
  appendMessage: (msg: AgenticMessage) => void;
  updateLastMessage: (updater: (msg: AgenticMessage) => AgenticMessage) => void;
  reset: () => void;
}

// ─── Initial State ────────────────────────────────────────────────────────────
const buildInitialState = () => ({
  phase: 'greeting' as AgenticPhase,
  sessionId: nanoid(),
  applicationId: null,
  leadId: null,
  collectedData: {} as Partial<AgenticCollectedData>,
  messages: [] as AgenticMessage[],
});

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAgenticStore = create<AgenticStore>()(
  persist(
    (set) => ({
      ...buildInitialState(),

      setPhase: (phase) => set({ phase }),

      setApplicationId: (id) => set({ applicationId: id }),

      setLeadId: (id) => set({ leadId: id }),

      updateCollectedData: (update: CollectedDataUpdate) =>
        set((state) => {
          const existing = state.collectedData;

          // Merge members separately to resolve partial nested fields
          let mergedMembers: AgenticCollectedData['members'] | undefined = existing.members;
          if (update.members !== undefined) {
            mergedMembers = {
              self: update.members.self ?? existing.members?.self ?? true,
              spouse: update.members.spouse ?? existing.members?.spouse ?? false,
              kidsCount: update.members.kidsCount ?? existing.members?.kidsCount ?? 0,
            };
          }

          const next: Partial<AgenticCollectedData> = {
            ...existing,
            ...(update.eldestAge !== undefined ? { eldestAge: update.eldestAge } : {}),
            ...(update.mobile !== undefined ? { mobile: update.mobile } : {}),
            ...(update.pincode !== undefined ? { pincode: update.pincode } : {}),
            ...(update.hospitalCount !== undefined ? { hospitalCount: update.hospitalCount } : {}),
            ...(update.preExisting !== undefined ? { preExisting: update.preExisting } : {}),
            ...(update.planSelected !== undefined ? { planSelected: update.planSelected } : {}),
            ...(update.kycVerified !== undefined ? { kycVerified: update.kycVerified } : {}),
            ...(update.healthSubmitted !== undefined ? { healthSubmitted: update.healthSubmitted } : {}),
            ...(update.paymentDone !== undefined ? { paymentDone: update.paymentDone } : {}),
            ...(mergedMembers !== undefined ? { members: mergedMembers } : {}),
          };

          return { collectedData: next };
        }),

      appendMessage: (msg) =>
        set((state) => ({
          messages: [...state.messages, msg],
        })),

      updateLastMessage: (updater) =>
        set((state) => {
          if (state.messages.length === 0) return state;
          const updated = [...state.messages];
          updated[updated.length - 1] = updater(updated[updated.length - 1]);
          return { messages: updated };
        }),

      reset: () => set(buildInitialState()),
    }),
    {
      name: 'buyonline-agentic',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
