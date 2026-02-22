import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AppConfigModule } from './config/config.module.js';
import { LeadModule } from './modules/lead/lead.module.js';
import { OtpModule } from './modules/otp/otp.module.js';
import { OnboardingModule } from './modules/onboarding/onboarding.module.js';
import { HospitalModule } from './modules/hospital/hospital.module.js';
import { PlanModule } from './modules/plan/plan.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { KycModule } from './modules/kyc/kyc.module.js';
import { HealthDeclarationModule } from './modules/health-declaration/health-declaration.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { ProposalModule } from './modules/proposal/proposal.module.js';
import { ResumeModule } from './modules/resume/resume.module.js';
import { ChatModule } from './modules/chat/chat.module.js';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    LeadModule,
    OtpModule,
    OnboardingModule,
    HospitalModule,
    PlanModule,
    PaymentModule,
    KycModule,
    HealthDeclarationModule,
    UploadModule,
    ProposalModule,
    ResumeModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
