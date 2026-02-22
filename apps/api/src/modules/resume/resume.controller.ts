import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResumeService } from './resume.service.js';
import { GenerateTokenDto } from './dto/generate-token.dto.js';
import { VerifyResumeDto } from './dto/verify-resume.dto.js';

@Controller('api/v1/resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('generate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async generateToken(@Body() dto: GenerateTokenDto) {
    return this.resumeService.generateToken(dto.applicationId);
  }

  @Get(':token/validate')
  async validateToken(@Param('token') token: string) {
    return this.resumeService.validateToken(token);
  }

  @Post(':token/verify')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyAndResume(
    @Param('token') token: string,
    @Body() dto: VerifyResumeDto,
  ) {
    return this.resumeService.verifyAndGetState(token, dto.mobile, dto.otp);
  }
}
