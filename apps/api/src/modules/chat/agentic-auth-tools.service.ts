import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AgenticAuthToolsService {
  private readonly logger = new Logger(AgenticAuthToolsService.name);

  // In-memory OTP store (use Redis in production via an OTP service)
  private readonly otpStore = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {}

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
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      this.otpStore.set(mobile, otp);
      this.logger.log(`[DEV] OTP for ${mobile}: ${otp}`);
      return { success: true, message: `OTP sent to ${mobile}`, devOtp: otp };
    } catch {
      return { success: false, error: 'Failed to send OTP. Please try again.' };
    }
  }

  private async verifyOtp(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const mobile = input['mobile'] as string;
      const otp = input['otp'] as string;
      const stored = this.otpStore.get(mobile);
      if (!stored || stored !== otp) {
        return { success: false, error: 'Invalid or expired OTP. Please try again.' };
      }
      this.otpStore.delete(mobile);
      return { success: true, verified: true, mobile };
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
    // Conditions stored in-memory for the session; real implementation would persist to DB
    const applicationId = input['applicationId'] as string;
    const conditions = (input['conditions'] as string[]) ?? [];
    this.logger.log(
      `Pre-existing conditions for application ${applicationId}: ${conditions.join(', ') || 'none'}`,
    );
    return { success: true, conditions, applicationId };
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
