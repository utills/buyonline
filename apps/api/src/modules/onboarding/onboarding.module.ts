import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller.js';
import { OnboardingService } from './onboarding.service.js';
import { EligibilityService } from './eligibility.service.js';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, EligibilityService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
