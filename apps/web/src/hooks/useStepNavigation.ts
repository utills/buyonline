'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { JourneyStep } from '@buyonline/shared-types';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { STEP_ORDER } from '@/lib/constants';

const STEP_ROUTES: Record<JourneyStep, string> = {
  [JourneyStep.LANDING]: '/',
  [JourneyStep.ONBOARDING]: '/pincode',
  [JourneyStep.QUOTE]: '/plans',
  [JourneyStep.PAYMENT]: '/proposer',
  [JourneyStep.KYC]: '/method',
  [JourneyStep.HEALTH]: '/personal',
  [JourneyStep.COMPLETE]: '/complete',
};

export function useStepNavigation() {
  const router = useRouter();
  const { currentStep, canNavigateTo, advanceTo, markStepComplete } =
    useJourneyStore();

  const navigateTo = useCallback(
    (step: JourneyStep) => {
      if (canNavigateTo(step)) {
        advanceTo(step);
        router.push(STEP_ROUTES[step]);
      }
    },
    [canNavigateTo, advanceTo, router]
  );

  const completeCurrentAndAdvance = useCallback(() => {
    markStepComplete(currentStep);
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const nextStep = STEP_ORDER[currentIndex + 1];
    if (nextStep) {
      navigateTo(nextStep);
    }
  }, [currentStep, markStepComplete, navigateTo]);

  const navigateWithinStep = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    currentStep,
    navigateTo,
    completeCurrentAndAdvance,
    navigateWithinStep,
    goBack,
    canNavigateTo,
  };
}
