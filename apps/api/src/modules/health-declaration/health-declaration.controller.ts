import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { HealthDeclarationService } from './health-declaration.service.js';
import { SessionGuard } from '../../common/guards/session.guard.js';
import { PersonalDetailsDto } from './dto/personal-details.dto.js';
import { LifestyleDto } from './dto/lifestyle.dto.js';
import { MedicalHistoryDto } from './dto/medical-history.dto.js';
import { HospitalizationDto, DisabilityDto, BankDetailsDto } from './dto/hospitalization.dto.js';

@Controller('api/v1')
export class HealthDeclarationController {
  constructor(
    private readonly healthDeclarationService: HealthDeclarationService,
  ) {}

  @Get('health-questions')
  async getHealthQuestions() {
    return this.healthDeclarationService.getHealthQuestions();
  }

  @Post('applications/:id/health/personal')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async savePersonalDetails(
    @Param('id') id: string,
    @Body() dto: PersonalDetailsDto,
  ) {
    return this.healthDeclarationService.savePersonalDetails(id, dto);
  }

  @Post('applications/:id/health/bank')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async saveBankDetails(
    @Param('id') id: string,
    @Body() dto: BankDetailsDto,
  ) {
    return this.healthDeclarationService.saveBankDetails(id, dto);
  }

  @Post('applications/:id/health/lifestyle')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async saveLifestyle(
    @Param('id') id: string,
    @Body() dto: LifestyleDto,
  ) {
    return this.healthDeclarationService.saveLifestyleAnswers(id, dto);
  }

  @Post('applications/:id/health/medical')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async saveMedicalHistory(
    @Param('id') id: string,
    @Body() dto: MedicalHistoryDto,
  ) {
    return this.healthDeclarationService.saveMedicalHistory(id, dto);
  }

  @Post('applications/:id/health/hospitalization')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async saveHospitalization(
    @Param('id') id: string,
    @Body() dto: HospitalizationDto,
  ) {
    return this.healthDeclarationService.saveHospitalization(id, dto);
  }

  @Post('applications/:id/health/disability')
  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async saveDisability(
    @Param('id') id: string,
    @Body() dto: DisabilityDto,
  ) {
    return this.healthDeclarationService.saveDisability(id, dto);
  }
}
