import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller.js';
import { PlanService } from './plan.service.js';
import { PricingService } from './pricing.service.js';
import { AddonService } from './addon.service.js';

@Module({
  controllers: [PlanController],
  providers: [PlanService, PricingService, AddonService],
  exports: [PlanService, PricingService, AddonService],
})
export class PlanModule {}
