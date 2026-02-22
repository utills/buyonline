import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { KycService } from './kyc.service.js';
import { CkycDto } from './dto/ckyc.dto.js';
import { EkycDto } from './dto/ekyc.dto.js';
import { ManualKycDto } from './dto/manual-kyc.dto.js';
import { SetKycMethodDto } from './dto/set-kyc-method.dto.js';

@Controller('api/v1/applications/:id/kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async setKycMethod(
    @Param('id') id: string,
    @Body() dto: SetKycMethodDto,
  ) {
    return this.kycService.setKycMethod(id, dto.method);
  }

  @Post('ckyc')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyCkyc(@Param('id') id: string, @Body() dto: CkycDto) {
    return this.kycService.verifyCkyc(id, dto);
  }

  @Post('ekyc')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyEkyc(@Param('id') id: string, @Body() dto: EkycDto) {
    return this.kycService.verifyEkyc(id, dto);
  }

  @Post('manual')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyManual(@Param('id') id: string, @Body() dto: ManualKycDto) {
    return this.kycService.verifyManual(id, dto);
  }

  @Get('status')
  async getStatus(@Param('id') id: string) {
    return this.kycService.getStatus(id);
  }
}
