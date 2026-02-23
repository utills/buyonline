import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ProposalStatus, PaymentStatus } from '@buyonline/shared-types';

@Injectable()
export class ProposalService {
  private readonly logger = new Logger(ProposalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async submitProposal(applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        selectedPlan: true,
        payment: true,
        kyc: true,
        members: true,
        proposerDetails: true,
      },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (!app.selectedPlan) {
      throw new BadRequestException('No plan selected');
    }

    if (!app.payment || app.payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Payment not completed');
    }

    // Generate a unique proposal number
    const proposalNumber = `PRU-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;

    const proposal = await this.prisma.proposal.upsert({
      where: { applicationId },
      create: {
        applicationId,
        proposalNumber,
        status: ProposalStatus.UNDER_REVIEW,
      },
      update: {
        status: ProposalStatus.UNDER_REVIEW,
      },
    });

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.SUBMITTED, currentStep: 'submitted' },
    });

    this.logger.log(
      `Proposal submitted: ${proposal.proposalNumber} for application ${applicationId}`,
    );

    return {
      proposalId: proposal.id,
      proposalNumber: proposal.proposalNumber,
      status: proposal.status,
      submittedAt: proposal.submittedAt,
    };
  }

  async getProposal(proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        application: {
          include: {
            lead: true,
            members: true,
            selectedPlan: { include: { plan: true } },
            selectedAddons: { include: { addon: true } },
            payment: true,
            proposerDetails: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return {
      proposalId: proposal.id,
      proposalNumber: proposal.proposalNumber,
      status: proposal.status,
      submittedAt: proposal.submittedAt,
      reviewedAt: proposal.reviewedAt,
      reviewNotes: proposal.reviewNotes,
      application: {
        id: proposal.application.id,
        status: proposal.application.status,
        members: proposal.application.members.map((m) => ({
          memberType: m.memberType,
          label: m.label,
          firstName: m.firstName,
          lastName: m.lastName,
          age: m.age,
        })),
        plan: proposal.application.selectedPlan
          ? {
              name: proposal.application.selectedPlan.plan.name,
              sumInsured: Number(proposal.application.selectedPlan.sumInsured),
              totalPremium: Number(
                proposal.application.selectedPlan.totalPremium,
              ),
            }
          : null,
      },
    };
  }

  async rateProposal(
    proposalId: string,
    rating: { status: string; reviewNotes?: string },
  ) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const updatedProposal = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status: rating.status,
        reviewNotes: rating.reviewNotes,
        reviewedAt: new Date(),
      },
    });

    // Update application status
    const appStatus =
      rating.status === ProposalStatus.APPROVED
        ? ApplicationStatus.APPROVED
        : ApplicationStatus.UNDER_REVIEW;
    await this.prisma.application.update({
      where: { id: proposal.applicationId },
      data: { status: appStatus },
    });

    return {
      proposalId: updatedProposal.id,
      proposalNumber: updatedProposal.proposalNumber,
      status: updatedProposal.status,
      reviewedAt: updatedProposal.reviewedAt,
      reviewNotes: updatedProposal.reviewNotes,
    };
  }
}
