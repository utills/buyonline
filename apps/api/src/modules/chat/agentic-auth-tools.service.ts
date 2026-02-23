import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OtpService } from '../otp/otp.service.js';
import { OtpPurpose } from '../otp/dto/send-otp.dto.js';

@Injectable()
export class AgenticAuthToolsService {
  private readonly logger = new Logger(AgenticAuthToolsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  canHandle(name: string): boolean {
    return [
      'send_otp',
      'verify_otp',
      'create_or_get_lead',
      'create_application',
      'update_pincode',
      'declare_pre_existing',
      'check_eligibility',
    ].includes(name);
  }

  async execute(name: string, input: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'send_otp':
        return this.sendOtp(input);
      case 'verify_otp':
        return this.verifyOtp(input);
      case 'create_or_get_lead':
        return this.createOrGetLead(input);
      case 'create_application':
        return this.createApplication(input);
      case 'update_pincode':
        return this.updatePincode(input);
      case 'declare_pre_existing':
        return this.declarePreExisting(input);
      case 'check_eligibility':
        return this.checkEligibility(input);
      default:
        return null;
    }
  }

  private async sendOtp(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const mobile = input['mobile'] as string;
      if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
        return {
          success: false,
          error: 'Invalid mobile number. Please enter a 10-digit Indian mobile number.',
        };
      }

      try {
        // Use the real OtpService which persists to DB and applies rate limiting
        const result = await this.otpService.send({ mobile, purpose: OtpPurpose.LOGIN });
        this.logger.log(`OTP sent via OtpService for ${mobile}`);
        return {
          success: true,
          message: `OTP sent to ${mobile}`,
          expiresInSeconds: result.expiresInSeconds,
          devOtp: result.otp, // only present in development
        };
      } catch (err: unknown) {
        if (err instanceof NotFoundException) {
          // Lead does not exist yet; generate a lightweight OTP via DB directly
          // so the agentic flow can proceed before lead creation
          const { randomInt, createHash } = await import('crypto');
          const otp = randomInt(100000, 999999).toString();
          const hashedOtp = createHash('sha256').update(otp).digest('hex');
          const expiresAt = new Date(Date.now() + 180 * 1000);

          // Store in a temporary lead-less record — create a minimal lead first
          const lead = await this.prisma.lead.upsert({
            where: { mobile },
            create: { mobile, countryCode: '+91' },
            update: {},
          });

          await this.prisma.otpAttempt.create({
            data: { leadId: lead.id, otp: hashedOtp, purpose: OtpPurpose.LOGIN, expiresAt },
          });

          this.logger.log(`[DEV] Pre-lead OTP for ${mobile}: ${otp}`);
          return { success: true, message: `OTP sent to ${mobile}`, devOtp: otp };
        }
        throw err;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`sendOtp failed: ${msg}`);
      return { success: false, error: 'Failed to send OTP. Please try again.' };
    }
  }

  private async verifyOtp(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const mobile = input['mobile'] as string;
      const otp = input['otp'] as string;

      try {
        const result = await this.otpService.verify({ mobile, otp });
        return { success: true, verified: result.isVerified, mobile, leadId: result.leadId };
      } catch {
        return { success: false, error: 'Invalid or expired OTP. Please try again.' };
      }
    } catch {
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  }

  private async createOrGetLead(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const mobile = input['mobile'] as string;
      const members = input['members'] as { self?: boolean; spouse?: boolean; kidsCount?: number } | undefined;
      const eldestMemberAge = input['eldestMemberAge'] as number | undefined;

      const existing = await this.prisma.lead.findFirst({ where: { mobile } });

      if (existing) {
        await this.prisma.lead.update({
          where: { id: existing.id },
          data: {
            selfSelected: members?.self ?? true,
            spouseSelected: members?.spouse ?? false,
            kidsCount: members?.kidsCount ?? 0,
            eldestMemberAge: eldestMemberAge ?? existing.eldestMemberAge,
            consentGiven: true,
          },
        });
        return { success: true, leadId: existing.id, mobile };
      }

      const lead = await this.prisma.lead.create({
        data: {
          mobile,
          countryCode: '+91',
          selfSelected: members?.self ?? true,
          spouseSelected: members?.spouse ?? false,
          kidsCount: members?.kidsCount ?? 0,
          eldestMemberAge: eldestMemberAge ?? 30,
          consentGiven: true,
        },
      });
      return { success: true, leadId: lead.id, mobile };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`createOrGetLead failed: ${msg}`);
      return { success: false, error: 'Failed to save your information. Please try again.' };
    }
  }

  private async createApplication(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      const leadId = input['leadId'] as string;
      const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) return { success: false, error: 'Lead not found.' };

      const app = await this.prisma.application.create({
        data: { leadId, status: 'LEAD_CAPTURED', currentStep: 'pincode' },
      });
      return { success: true, applicationId: app.id, leadId, mobile: lead.mobile };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`createApplication failed: ${msg}`);
      return { success: false, error: 'Failed to create application. Please try again.' };
    }
  }

  private async updatePincode(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const applicationId = input['applicationId'] as string;
      const pincode = input['pincode'] as string;
      await this.prisma.application.update({
        where: { id: applicationId },
        data: { pincode, currentStep: 'pre-existing' },
      });
      return { success: true, pincode };
    } catch {
      return { success: false, error: 'Failed to update pincode.' };
    }
  }

  private async declarePreExisting(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      const applicationId = input['applicationId'] as string;
      const conditions = (input['conditions'] as string[]) ?? [];

      if (conditions.length === 0) {
        await this.prisma.application.update({
          where: { id: applicationId },
          data: { currentStep: 'eligibility' },
        });
        return { success: true, conditions: [], applicationId };
      }

      // Fetch the SELF member for this application to attach diseases to
      const selfMember = await this.prisma.applicationMember.findFirst({
        where: { applicationId, memberType: 'SELF' },
      });

      if (!selfMember) {
        this.logger.warn(
          `No SELF member found for application ${applicationId}; skipping disease persistence`,
        );
        return { success: true, conditions, applicationId };
      }

      // Resolve disease records by name (case-insensitive partial match)
      const persistedCount = await Promise.allSettled(
        conditions.map(async (conditionName) => {
          const disease = await this.prisma.disease.findFirst({
            where: { name: { contains: conditionName, mode: 'insensitive' }, isActive: true },
          });

          if (!disease) {
            this.logger.warn(`Disease not found in DB for condition: "${conditionName}"`);
            return;
          }

          await this.prisma.memberDisease.upsert({
            where: {
              memberId_diseaseId: { memberId: selfMember.id, diseaseId: disease.id },
            },
            create: { memberId: selfMember.id, diseaseId: disease.id, declared: true },
            update: { declared: true },
          });
        }),
      );

      const successCount = persistedCount.filter((r) => r.status === 'fulfilled').length;
      this.logger.log(
        `Persisted ${successCount}/${conditions.length} pre-existing conditions for application ${applicationId}`,
      );

      await this.prisma.application.update({
        where: { id: applicationId },
        data: { currentStep: 'eligibility' },
      });

      return { success: true, conditions, applicationId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`declarePreExisting failed: ${msg}`);
      return { success: false, error: 'Failed to save pre-existing conditions.' };
    }
  }

  private async checkEligibility(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      const applicationId = input['applicationId'] as string;
      const app = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: { members: true, lead: true },
      });
      if (!app) return { success: false, error: 'Application not found.' };

      return {
        success: true,
        allEligible: true,
        memberCount: app.members?.length ?? 1,
        applicationId,
      };
    } catch {
      return { success: false, error: 'Eligibility check failed.' };
    }
  }
}
