import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller.js';
import { ResumeService } from './resume.service.js';
import { OtpModule } from '../otp/otp.module.js';

@Module({
  imports: [OtpModule],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}
