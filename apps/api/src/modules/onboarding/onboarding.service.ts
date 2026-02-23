import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberType, Gender } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PincodeDto } from './dto/pincode.dto.js';
import { DiseaseDeclarationDto, CriticalConditionDto } from './dto/disease-declaration.dto.js';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async createApplication(leadId: string) {
    return this.prisma.application.create({
      data: {
        leadId,
        status: 'LEAD_CAPTURED',
        currentStep: 'pincode',
      },
    });
  }

  async updatePincode(applicationId: string, dto: PincodeDto) {
    await this.getApplication(applicationId);
    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        pincode: dto.pincode,
        currentStep: 'members',
      },
    });
  }

  async addMembers(
    applicationId: string,
    members: Array<{
      memberType: string;
      label: string;
      age: number;
      gender?: string;
    }>,
  ) {
    await this.getApplication(applicationId);

    // Remove existing members and re-create
    await this.prisma.applicationMember.deleteMany({
      where: { applicationId },
    });

    const created = await Promise.all(
      members.map((m) =>
        this.prisma.applicationMember.create({
          data: {
            applicationId,
            memberType: m.memberType as MemberType,
            label: m.label,
            age: m.age,
            gender: m.gender as Gender | undefined,
          },
        }),
      ),
    );

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { currentStep: 'diseases' },
    });

    return created;
  }

  async declareDiseases(applicationId: string, dto: DiseaseDeclarationDto) {
    await this.getApplication(applicationId);

    const uniqueMemberIds = [...new Set(dto.diseases.map((d) => d.memberId))];
    for (const memberId of uniqueMemberIds) {
      const member = await this.prisma.applicationMember.findFirst({
        where: { id: memberId, applicationId },
      });
      if (!member) throw new NotFoundException('Member not found in this application');
    }

    const results = await Promise.all(
      dto.diseases.map((d) =>
        this.prisma.memberDisease.upsert({
          where: {
            memberId_diseaseId: {
              memberId: d.memberId,
              diseaseId: d.diseaseId,
            },
          },
          create: {
            memberId: d.memberId,
            diseaseId: d.diseaseId,
            declared: d.declared ?? true,
          },
          update: {
            declared: d.declared ?? true,
          },
        }),
      ),
    );

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { currentStep: 'critical-conditions' },
    });

    return results;
  }

  async declareCriticalConditions(
    applicationId: string,
    dto: CriticalConditionDto,
  ) {
    await this.getApplication(applicationId);

    const uniqueMemberIds = [...new Set(dto.conditions.map((c) => c.memberId))];
    for (const memberId of uniqueMemberIds) {
      const member = await this.prisma.applicationMember.findFirst({
        where: { id: memberId, applicationId },
      });
      if (!member) throw new NotFoundException('Member not found in this application');
    }

    const results = await Promise.all(
      dto.conditions.map((c) =>
        this.prisma.memberCriticalCondition.upsert({
          where: {
            memberId_diseaseId: {
              memberId: c.memberId,
              diseaseId: c.diseaseId,
            },
          },
          create: {
            memberId: c.memberId,
            diseaseId: c.diseaseId,
            declared: c.declared ?? true,
          },
          update: {
            declared: c.declared ?? true,
          },
        }),
      ),
    );

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { currentStep: 'eligibility', status: 'ONBOARDING' },
    });

    return results;
  }

  async getApplication(id: string) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            preExistingDiseases: true,
            criticalConditions: true,
          },
        },
      },
    });

    if (!app) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    return app;
  }
}
