import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OtpService } from './otp.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';

@ApiTags('otp')
@Controller('api/v1/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.otpService.send(dto);
  }

  @Post('verify')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.otpService.verify(dto);
  }

  @Post('resend')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resendOtp(@Body() dto: SendOtpDto) {
    return this.otpService.resend(dto);
  }
}
