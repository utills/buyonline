import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OtpService } from '../otp/otp.service.js';
import { ResumeStateService } from './resume-state.service.js';
import type {
  ResumeStateResponse,
} from '@buyonline/shared-types';
import { ApplicationStatus } from '@buyonline/shared-types';

const TERMINAL_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.SUBMITTED,
];

const TOKEN_EXPIRY_DAYS = 30;

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly stateService: ResumeStateService,
  ) {}

  async generateToken(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (TERMINAL_STATUSES.includes(application.status as ApplicationStatus)) {
      throw new BadRequestException(
        'Cannot generate resume token for a terminal application',
      );
    }

    // Revoke existing active tokens
    await this.prisma.resumeToken.updateMany({
      where: { applicationId, isRevoked: false },
      data: { isRevoked: true },
    });

    const token = nanoid(10);
    const expiresAt = new Date(
      Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    const resumeToken = await this.prisma.resumeToken.create({
      data: {
        token,
        applicationId,
        expiresAt,
      },
    });

    return {
      token: resumeToken.token,
      resumeUrl: `/r/${resumeToken.token}`,
      expiresAt: resumeToken.expiresAt.toISOString(),
    };
  }

  async validateToken(token: string) {
    const resumeToken = await this.prisma.resumeToken.findFirst({
      where: {
        token,
        isRevoked: false,
        expiresAt: { gte: new Date() },
      },
      include: {
        application: {
          include: { lead: true },
        },
      },
    });

    if (!resumeToken) {
      throw new NotFoundException('Invalid or expired resume token');
    }

    const { application } = resumeToken;
    const mobile = application.lead.mobile;
    const maskedMobile = '****' + mobile.slice(-4);

    return {
      applicationId: application.id,
      maskedMobile,
      status: application.status as ApplicationStatus,
      currentStep: application.currentStep,
    };
  }

  async verifyAndGetState(token: string, mobile: string, otp: string): Promise<ResumeStateResponse> {
    // Validate token first
    const resumeToken = await this.prisma.resumeToken.findFirst({
      where: {
        token,
        isRevoked: false,
        expiresAt: { gte: new Date() },
      },
      include: {
        application: {
          include: { lead: true },
        },
      },
    });

    if (!resumeToken) {
      throw new NotFoundException('Invalid or expired resume token');
    }

    // Verify OTP
    await this.otpService.verify({ mobile, otp });

    // Get full application state
    return this.stateService.getApplicationState(resumeToken.applicationId);
  }

}
