import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service.js';
import { EligibilityService } from './eligibility.service.js';
import { PincodeDto } from './dto/pincode.dto.js';
import { DiseaseDeclarationDto, CriticalConditionDto } from './dto/disease-declaration.dto.js';
import { AddMembersDto } from './dto/add-members.dto.js';

@Controller('api/v1/applications')
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly eligibilityService: EligibilityService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createApplication(@Body('leadId') leadId: string) {
    return this.onboardingService.createApplication(leadId);
  }

  @Patch(':id/pincode')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updatePincode(
    @Param('id') id: string,
    @Body() dto: PincodeDto,
  ) {
    return this.onboardingService.updatePincode(id, dto);
  }

  @Post(':id/members')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async addMembers(
    @Param('id') id: string,
    @Body() dto: AddMembersDto,
  ) {
    return this.onboardingService.addMembers(id, dto.members);
  }

  @Post(':id/diseases')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async declareDiseases(
    @Param('id') id: string,
    @Body() dto: DiseaseDeclarationDto,
  ) {
    return this.onboardingService.declareDiseases(id, dto);
  }

  @Post(':id/critical-conditions')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async declareCriticalConditions(
    @Param('id') id: string,
    @Body() dto: CriticalConditionDto,
  ) {
    return this.onboardingService.declareCriticalConditions(id, dto);
  }

  @Get(':id/eligibility')
  async checkEligibility(@Param('id') id: string) {
    return this.eligibilityService.checkEligibility(id);
  }
}
