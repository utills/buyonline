import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { JourneyStep } from '@buyonline/shared-types';
import { STEP_ORDER } from '@/lib/constants';

interface JourneyState {
  applicationId: string | null;
  leadId: string | null;
  currentStep: JourneyStep;
  completedSteps: JourneyStep[];

  setApplicationId: (id: string) => void;
  setLeadId: (id: string) => void;
  advanceTo: (step: JourneyStep) => void;
  markStepComplete: (step: JourneyStep) => void;
  canNavigateTo: (step: JourneyStep) => boolean;
  reset: () => void;
}

const initialState = {
  applicationId: null,
  leadId: null,
  currentStep: JourneyStep.LANDING,
  completedSteps: [] as JourneyStep[],
};

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setApplicationId: (id: string) => set({ applicationId: id }),

      setLeadId: (id: string) => set({ leadId: id }),

      advanceTo: (step: JourneyStep) => {
        const state = get();
        const currentIndex = STEP_ORDER.indexOf(state.currentStep);
        const targetIndex = STEP_ORDER.indexOf(step);
        if (targetIndex >= currentIndex) {
          set({ currentStep: step });
        }
      },

      markStepComplete: (step: JourneyStep) => {
        const state = get();
        const steps = state.completedSteps ?? [];
        if (!steps.includes(step)) {
          set({ completedSteps: [...steps, step] });
        }
      },

      canNavigateTo: (step: JourneyStep) => {
        const state = get();
        const steps = state.completedSteps ?? [];
        const targetIndex = STEP_ORDER.indexOf(step);
        const currentIndex = STEP_ORDER.indexOf(state.currentStep);

        if (targetIndex <= currentIndex) return true;

        const previousStep = STEP_ORDER[targetIndex - 1];
        return steps.includes(previousStep);
      },

      reset: () => set(initialState),
    }),
    {
      name: 'buyonline-journey',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
