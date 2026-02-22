'use client';

import StepTabs from '@/components/shared/StepTabs';
import { JourneyStep } from '@buyonline/shared-types';

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <StepTabs activeStep={JourneyStep.HEALTH} />
      <div className="max-w-md mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
