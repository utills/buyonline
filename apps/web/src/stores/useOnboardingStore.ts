import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OnboardingState {
  pincode: string;
  nearbyHospitals: number;
  preExistingDiseases: Record<string, boolean>;
  criticalConditions: Record<string, string[]>;
  eligibleMembers: string[];
  ineligibleMembers: { memberId: string; reason: string }[];

  setPincode: (pincode: string) => void;
  setNearbyHospitals: (count: number) => void;
  setPreExistingDisease: (memberId: string, hasDisease: boolean) => void;
  setCriticalConditions: (memberId: string, conditions: string[]) => void;
  setEligibleMembers: (memberIds: string[]) => void;
  setIneligibleMembers: (members: { memberId: string; reason: string }[]) => void;
  reset: () => void;
}

const initialState = {
  pincode: '',
  nearbyHospitals: 0,
  preExistingDiseases: {} as Record<string, boolean>,
  criticalConditions: {} as Record<string, string[]>,
  eligibleMembers: [] as string[],
  ineligibleMembers: [] as { memberId: string; reason: string }[],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setPincode: (pincode: string) => set({ pincode }),

      setNearbyHospitals: (count: number) => set({ nearbyHospitals: count }),

      setPreExistingDisease: (memberId: string, hasDisease: boolean) =>
        set((state) => ({
          preExistingDiseases: {
            ...(state.preExistingDiseases ?? {}),
            [memberId]: hasDisease,
          },
        })),

      setCriticalConditions: (memberId: string, conditions: string[]) =>
        set((state) => ({
          criticalConditions: {
            ...(state.criticalConditions ?? {}),
            [memberId]: conditions,
          },
        })),

      setEligibleMembers: (memberIds: string[]) =>
        set({ eligibleMembers: memberIds }),

      setIneligibleMembers: (members: { memberId: string; reason: string }[]) =>
        set({ ineligibleMembers: members }),

      reset: () => set(initialState),
    }),
    {
      name: 'buyonline-onboarding',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null, setItem: () => {}, removeItem: () => {},
        }
      ),
    }
  )
);
