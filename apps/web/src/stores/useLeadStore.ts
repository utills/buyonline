import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LeadState {
  members: {
    self: boolean;
    spouse: boolean;
    kidsCount: number;
  };
  eldestMemberAge: number | null;
  mobile: string;
  consentGiven: boolean;

  setSelf: (selected: boolean) => void;
  setSpouse: (selected: boolean) => void;
  setKidsCount: (count: number) => void;
  setEldestMemberAge: (age: number) => void;
  setMobile: (mobile: string) => void;
  setConsentGiven: (given: boolean) => void;
  reset: () => void;
}

const initialState = {
  members: {
    self: true,
    spouse: false,
    kidsCount: 0,
  },
  eldestMemberAge: null,
  mobile: '',
  consentGiven: false,
};

export const useLeadStore = create<LeadState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelf: (selected: boolean) =>
        set((state) => {
          const m = state.members ?? { self: true, spouse: false, kidsCount: 0 };
          return { members: { ...m, self: selected } };
        }),

      setSpouse: (selected: boolean) =>
        set((state) => {
          const m = state.members ?? { self: true, spouse: false, kidsCount: 0 };
          return { members: { ...m, spouse: selected } };
        }),

      setKidsCount: (count: number) =>
        set((state) => {
          const m = state.members ?? { self: true, spouse: false, kidsCount: 0 };
          return { members: { ...m, kidsCount: Math.max(0, Math.min(4, count)) } };
        }),

      setEldestMemberAge: (age: number) => set({ eldestMemberAge: age }),

      setMobile: (mobile: string) => set({ mobile }),

      setConsentGiven: (given: boolean) => set({ consentGiven: given }),

      reset: () => set(initialState),
    }),
    {
      name: 'buyonline-lead',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null, setItem: () => {}, removeItem: () => {},
        }
      ),
    }
  )
);
