import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OtpService } from '../otp/otp.service.js';
import type {
  ResumeStateResponse,
  ResumeJourneyState,
  ResumeLeadState,
  ResumeOnboardingState,
  ResumeQuoteState,
  ResumePaymentState,
  ResumeKycState,
  ResumeHealthState,
} from '@buyonline/shared-types';
import { ApplicationStatus, JourneyStep, PlanTier, CoverageLevel, PaymentStatus, KycMethod, KycStatus, DocumentType } from '@buyonline/shared-types';

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
      mobile,
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
    return this.getApplicationState(resumeToken.applicationId);
  }

  async getApplicationState(applicationId: string): Promise<ResumeStateResponse> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        lead: true,
        members: {
          include: {
            preExistingDiseases: { include: { disease: true } },
            criticalConditions: { include: { disease: true } },
            healthAnswers: { include: { question: true } },
            lifestyleAnswers: true,
          },
        },
        selectedPlan: { include: { plan: true } },
        selectedAddons: { include: { addon: true } },
        payment: true,
        kyc: { include: { documents: true } },
        healthDeclarations: true,
        proposerDetails: true,
        bankDetails: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const { lead } = application;
    const status = application.status as ApplicationStatus;

    // Derive journey state
    const completedSteps = this.deriveCompletedSteps(application);
    const redirectPath = this.deriveRedirectPath(status, application.currentStep);
    const currentStep = this.deriveJourneyStep(status, application.currentStep);

    const journey: ResumeJourneyState = {
      applicationId: application.id,
      leadId: lead.id,
      currentStep,
      completedSteps,
      redirectPath,
    };

    const leadState: ResumeLeadState = {
      members: {
        self: lead.selfSelected,
        spouse: lead.spouseSelected,
        kidsCount: lead.kidsCount,
      },
      eldestMemberAge: lead.eldestMemberAge,
      mobile: lead.mobile,
      consentGiven: lead.consentGiven,
    };

    // Build onboarding state
    const preExistingDiseases: Record<string, boolean> = {};
    const criticalConditions: Record<string, string[]> = {};
    const eligibleMembers: string[] = [];
    const ineligibleMembers: { memberId: string; reason: string }[] = [];

    for (const member of application.members) {
      preExistingDiseases[member.id] =
        member.preExistingDiseases.length > 0;
      if (member.criticalConditions.length > 0) {
        criticalConditions[member.id] = member.criticalConditions.map(
          (c) => c.disease.name,
        );
      }
      if (member.isEligible) {
        eligibleMembers.push(member.id);
      } else {
        ineligibleMembers.push({
          memberId: member.id,
          reason: member.ineligibilityReason ?? 'Not eligible',
        });
      }
    }

    const onboarding: ResumeOnboardingState = {
      pincode: application.pincode ?? '',
      nearbyHospitals: 0,
      preExistingDiseases,
      criticalConditions,
      eligibleMembers,
      ineligibleMembers,
    };

    // Build quote state
    const sp = application.selectedPlan;
    const quote: ResumeQuoteState = {
      plans: sp ? [{ id: sp.plan.id, name: sp.plan.name, tier: sp.plan.tier as unknown as PlanTier, features: sp.plan.features as string[], isActive: true }] : [],
      selectedPlanId: sp?.planId ?? null,
      sumInsured: sp ? Number(sp.sumInsured) : 5000000,
      tenureMonths: sp?.tenureMonths ?? 12,
      coverageLevel: (sp?.coverageLevel as unknown as CoverageLevel) ?? CoverageLevel.FLOATER,
      selectedTier: sp ? (sp.plan.tier as unknown as PlanTier) : PlanTier.SIGNATURE,
      addons: application.selectedAddons.map((sa) => ({
        id: sa.addon.id,
        name: sa.addon.name,
        description: sa.addon.description ?? undefined,
        price: Number(sa.price),
        isPreChecked: false,
        isIncludedInBundle: false,
      })),
      selectedAddonIds: application.selectedAddons.map((sa) => sa.addonId),
      pricing: sp
        ? {
            basePremium: Number(sp.basePremium),
            addonPremium: Number(sp.addonPremium),
            discountAmount: Number(sp.discountAmount),
            subtotal: Number(sp.basePremium) + Number(sp.addonPremium) - Number(sp.discountAmount),
            gstAmount: Number(sp.gstAmount),
            totalPremium: Number(sp.totalPremium),
            monthlyEquivalent: Math.round(Number(sp.totalPremium) / (sp.tenureMonths || 12)),
          }
        : null,
      planPricings: [],
    };

    // Build payment state
    const pd = application.proposerDetails;
    const pay = application.payment;
    const payment: ResumePaymentState = {
      proposer: pd
        ? { firstName: pd.firstName, lastName: pd.lastName, dob: pd.dob.toISOString().split('T')[0], email: pd.email }
        : null,
      paymentStatus: pay ? (pay.status as unknown as PaymentStatus) : null,
      transactionId: pay?.transactionId ?? null,
      paymentMethod: pay?.paymentMethod ?? null,
      gatewayOrderId: pay?.gatewayOrderId ?? null,
      amount: pay ? Number(pay.amount) : 0,
    };

    // Build KYC state
    const kycData = application.kyc;
    const kyc: ResumeKycState = {
      method: kycData ? (kycData.method as unknown as KycMethod) : null,
      status: kycData ? (kycData.status as unknown as KycStatus) : KycStatus.PENDING,
      panNumber: kycData?.panNumber ?? '',
      aadharNumber: kycData?.aadharNumber ?? '',
      dob: kycData?.panDob ? kycData.panDob.toISOString().split('T')[0] : '',
      identityProofType: null,
      identityProofUrl: '',
      addressProofType: null,
      addressProofUrl: '',
      useDigiLocker: !!kycData?.digilockerRef,
    };

    if (kycData?.documents) {
      for (const doc of kycData.documents) {
        if (['PAN_CARD', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE'].includes(doc.documentType)) {
          kyc.identityProofType = doc.documentType as unknown as DocumentType;
          kyc.identityProofUrl = doc.fileUrl;
        }
        if (['AADHAR_CARD', 'ADDRESS_PROOF'].includes(doc.documentType)) {
          kyc.addressProofType = doc.documentType as unknown as DocumentType;
          kyc.addressProofUrl = doc.fileUrl;
        }
      }
    }

    // Build health state
    const personalDetails: Record<string, any> = {};
    const lifestyleAnswers: Record<string, any[]> = {};
    const medicalAnswers: Record<string, any[]> = {};

    for (const member of application.members) {
      if (member.firstName) {
        personalDetails[member.id] = {
          memberId: member.id,
          title: member.title ?? '',
          firstName: member.firstName,
          lastName: member.lastName ?? '',
          mobile: member.mobile,
          dob: member.dob ? member.dob.toISOString().split('T')[0] : '',
          heightFt: member.heightFt ?? 0,
          heightIn: member.heightIn ?? 0,
          weightKg: member.weightKg ?? 0,
        };
      }

      if (member.lifestyleAnswers.length > 0) {
        lifestyleAnswers[member.id] = member.lifestyleAnswers.map((la) => ({
          memberId: member.id,
          questionKey: la.questionKey,
          answer: la.answer,
          subAnswer: la.subAnswer,
        }));
      }

      if (member.healthAnswers.length > 0) {
        medicalAnswers[member.id] = member.healthAnswers.map((ha) => ({
          memberId: member.id,
          questionKey: ha.question.questionKey,
          answer: ha.answer,
          details: ha.details,
        }));
      }
    }

    const hd = application.healthDeclarations[0];
    const bd = application.bankDetails;

    const health: ResumeHealthState = {
      personalDetails,
      lifestyleAnswers,
      medicalAnswers,
      hospitalizationDetails: hd?.hospitalizationReason
        ? {
            reason: hd.hospitalizationReason,
            isDischargeSummaryAvailable: !!hd.dischargeSummaryUrl,
            dischargeSummaryUrl: hd.dischargeSummaryUrl ?? undefined,
            medicationName: hd.medicationDetails ?? undefined,
          }
        : null,
      disabilityDetails: hd
        ? {
            hasDisability: hd.hasDisability,
            memberIds: [],
            hasPriorInsuranceDecline: hd.hasPriorInsurance,
            priorInsuranceDetails: hd.priorInsuranceDetails ?? undefined,
          }
        : null,
      bankDetails: bd
        ? { accountNumber: bd.accountNumber, bankName: bd.bankName, ifscCode: bd.ifscCode }
        : null,
    };

    return { journey, lead: leadState, onboarding, quote, payment, kyc, health };
  }

  private deriveCompletedSteps(application: any): JourneyStep[] {
    const steps: JourneyStep[] = [JourneyStep.LANDING];
    const status = application.status as ApplicationStatus;

    if (application.pincode || application.members.length > 0) {
      steps.push(JourneyStep.ONBOARDING);
    }

    if (application.selectedPlan) {
      steps.push(JourneyStep.QUOTE);
    }

    if (
      status === ApplicationStatus.PAYMENT_COMPLETED ||
      status === ApplicationStatus.KYC_PENDING ||
      status === ApplicationStatus.KYC_COMPLETED ||
      status === ApplicationStatus.HEALTH_DECLARATION
    ) {
      steps.push(JourneyStep.PAYMENT);
    }

    if (
      status === ApplicationStatus.KYC_COMPLETED ||
      status === ApplicationStatus.HEALTH_DECLARATION
    ) {
      steps.push(JourneyStep.KYC);
    }

    if (status === ApplicationStatus.HEALTH_DECLARATION) {
      steps.push(JourneyStep.HEALTH);
    }

    // Deduplicate
    return [...new Set(steps)];
  }

  private deriveJourneyStep(
    status: ApplicationStatus,
    currentStep: string,
  ): JourneyStep {
    switch (status) {
      case ApplicationStatus.LEAD_CAPTURED:
      case ApplicationStatus.OTP_VERIFIED:
        return JourneyStep.LANDING;
      case ApplicationStatus.ONBOARDING:
        return JourneyStep.ONBOARDING;
      case ApplicationStatus.QUOTE_GENERATED:
      case ApplicationStatus.PLAN_SELECTED:
        return JourneyStep.QUOTE;
      case ApplicationStatus.PAYMENT_PENDING:
      case ApplicationStatus.PAYMENT_COMPLETED:
        return JourneyStep.PAYMENT;
      case ApplicationStatus.KYC_PENDING:
      case ApplicationStatus.KYC_COMPLETED:
        return JourneyStep.KYC;
      case ApplicationStatus.HEALTH_DECLARATION:
        return JourneyStep.HEALTH;
      default:
        return JourneyStep.LANDING;
    }
  }

  private deriveRedirectPath(
    status: ApplicationStatus,
    currentStep: string,
  ): string {
    // Use currentStep for finer-grained routing during early/onboarding stages
    const earlyStatuses = [
      ApplicationStatus.LEAD_CAPTURED,
      ApplicationStatus.OTP_VERIFIED,
      ApplicationStatus.ONBOARDING,
    ];
    if (earlyStatuses.includes(status)) {
      switch (currentStep) {
        case 'pincode':
        case 'landing':
          return '/pincode';
        case 'members':
        case 'diseases':
          return '/pre-existing';
        case 'critical-conditions':
          return '/critical-conditions';
        case 'eligibility':
          return '/eligibility';
        default:
          return '/pincode';
      }
    }

    switch (status) {
      case ApplicationStatus.QUOTE_GENERATED:
        return '/plans';
      case ApplicationStatus.PLAN_SELECTED:
        return '/addons';
      case ApplicationStatus.PAYMENT_PENDING:
        return '/proposer';
      case ApplicationStatus.PAYMENT_COMPLETED:
      case ApplicationStatus.KYC_PENDING:
        return '/method';
      case ApplicationStatus.KYC_COMPLETED:
        return '/personal';
      case ApplicationStatus.HEALTH_DECLARATION:
        return '/personal';
      default:
        return '/pincode';
    }
  }
}
