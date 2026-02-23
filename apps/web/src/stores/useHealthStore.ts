import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  MemberPersonalDetails,
  LifestyleAnswer,
  MedicalAnswer,
  HospitalizationDetails,
  DisabilityDetails,
  BankDetailsRequest,
} from '@buyonline/shared-types';

interface HealthState {
  personalDetails: Record<string, MemberPersonalDetails>;
  lifestyleAnswers: Record<string, LifestyleAnswer[]>;
  medicalAnswers: Record<string, MedicalAnswer[]>;
  hospitalizationDetails: HospitalizationDetails | null;
  disabilityDetails: DisabilityDetails | null;
  bankDetails: BankDetailsRequest | null;

  setPersonalDetails: (memberId: string, details: MemberPersonalDetails) => void;
  setLifestyleAnswers: (memberId: string, answers: LifestyleAnswer[]) => void;
  setMedicalAnswers: (memberId: string, answers: MedicalAnswer[]) => void;
  setHospitalizationDetails: (details: HospitalizationDetails) => void;
  setDisabilityDetails: (details: DisabilityDetails) => void;
  setBankDetails: (details: BankDetailsRequest) => void;
  reset: () => void;
}

const initialState = {
  personalDetails: {} as Record<string, MemberPersonalDetails>,
  lifestyleAnswers: {} as Record<string, LifestyleAnswer[]>,
  medicalAnswers: {} as Record<string, MedicalAnswer[]>,
  hospitalizationDetails: null as HospitalizationDetails | null,
  disabilityDetails: null as DisabilityDetails | null,
  bankDetails: null as BankDetailsRequest | null,
};

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      ...initialState,

      setPersonalDetails: (memberId: string, details: MemberPersonalDetails) =>
        set((state) => ({
          personalDetails: { ...(state.personalDetails ?? {}), [memberId]: details },
        })),

      setLifestyleAnswers: (memberId: string, answers: LifestyleAnswer[]) =>
        set((state) => ({
          lifestyleAnswers: { ...(state.lifestyleAnswers ?? {}), [memberId]: answers },
        })),

      setMedicalAnswers: (memberId: string, answers: MedicalAnswer[]) =>
        set((state) => ({
          medicalAnswers: { ...(state.medicalAnswers ?? {}), [memberId]: answers },
        })),

      setHospitalizationDetails: (details: HospitalizationDetails) =>
        set({ hospitalizationDetails: details }),

      setDisabilityDetails: (details: DisabilityDetails) =>
        set({ disabilityDetails: details }),

      setBankDetails: (details: BankDetailsRequest) =>
        set({ bankDetails: details }),

      reset: () => set(initialState),
    }),
    {
      name: 'buyonline-health',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null, setItem: () => {}, removeItem: () => {},
        }
      ),
    }
  )
);
