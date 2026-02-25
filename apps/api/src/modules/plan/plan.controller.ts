import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PlanService } from './plan.service.js';
import { PricingService } from './pricing.service.js';
import { AddonService } from './addon.service.js';
import { SelectPlanDto } from './dto/select-plan.dto.js';
import { SelectAddonsDto } from './dto/select-addons.dto.js';

@Controller('api/v1')
export class PlanController {
  constructor(
    private readonly planService: PlanService,
    private readonly pricingService: PricingService,
    private readonly addonService: AddonService,
  ) {}

  @Get('plans')
  async getPlans(@Query('applicationId') applicationId: string) {
    return this.planService.getPlans(applicationId);
  }

  @Get('plans/:id/pricing')
  async getPricing(@Param('id') id: string) {
    return this.pricingService.getPricing(id);
  }

  @Get('addons')
  async getAllAddons() {
    return this.addonService.getAllAddons();
  }

  @Get('plans/:id/addons')
  async getAddons(@Param('id') id: string) {
    return this.addonService.getAddonsForPlan(id);
  }

  @Post('applications/:id/selected-plan')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async selectPlan(
    @Param('id') id: string,
    @Body() dto: SelectPlanDto,
  ) {
    return this.planService.selectPlan(id, dto);
  }

  @Post('applications/:id/addons')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async selectAddons(
    @Param('id') id: string,
    @Body() dto: SelectAddonsDto,
  ) {
    return this.addonService.selectAddons(id, dto.addonIds);
  }

  @Get('applications/:id/summary')
  async getSummary(@Param('id') id: string) {
    return this.planService.getSummary(id);
  }
}
