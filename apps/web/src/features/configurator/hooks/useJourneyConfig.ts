'use client';

import { useConfigStore } from '../store/useConfigStore';

export function useJourneyConfig() {
  const { config } = useConfigStore();

  const isPhaseEnabled = (phaseId: string): boolean => {
    const phase = config.phases.find((p) => p.id === phaseId);
    return phase?.enabled ?? true;
  };

  const isStepEnabled = (route: string): boolean => {
    for (const phase of config.phases) {
      if (!phase.enabled) continue;
      const step = phase.steps.find((s) => s.route === route);
      if (step) return step.enabled;
    }
    return true;
  };

  const isPlanEnabled = (planId: string): boolean => {
    const plan = config.plans.find((p) => p.planId === planId);
    return plan?.enabled ?? true;
  };

  const isAddonEnabled = (addonId: string): boolean => {
    const addon = config.addons.find((a) => a.addonId === addonId);
    return addon?.enabled ?? true;
  };

  const isQuestionEnabled = (questionKey: string): boolean => {
    const q = config.healthQuestions.find((hq) => hq.questionKey === questionKey);
    return q?.enabled ?? true;
  };

  return {
    isPhaseEnabled,
    isStepEnabled,
    isPlanEnabled,
    isAddonEnabled,
    isQuestionEnabled,
    chatConfig: config.chat,
    branding: config.branding,
    featureFlags: config.featureFlags,
  };
}
