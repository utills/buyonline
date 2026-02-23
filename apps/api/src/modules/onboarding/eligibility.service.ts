import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { EligibilityResultDto, MemberEligibility } from './dto/eligibility-result.dto.js';

function isAgeEligible(memberType: string, age: number): { eligible: boolean; reason?: string } {
  if (memberType === 'KID') {
    if (age < 0 || age > 25) return { eligible: false, reason: 'Child must be between 0-25 years' };
  } else if (memberType === 'SELF' || memberType === 'SPOUSE') {
    if (age < 18) return { eligible: false, reason: 'Adult member must be at least 18 years old' };
    if (age > 65) return { eligible: false, reason: 'Maximum entry age is 65 years' };
  }
  return { eligible: true };
}

@Injectable()
export class EligibilityService {
  constructor(private readonly prisma: PrismaService) {}

  async checkEligibility(applicationId: string): Promise<EligibilityResultDto> {
    const members = await this.prisma.applicationMember.findMany({
      where: { applicationId },
      include: {
        preExistingDiseases: { include: { disease: true } },
        criticalConditions: { include: { disease: true } },
      },
    });

    const memberResults: MemberEligibility[] = members.map((member) => {
      let isEligible = true;
      let ineligibilityReason: string | undefined;

      // Age eligibility check (type-specific rules)
      const ageCheck = isAgeEligible(member.memberType, member.age);
      if (!ageCheck.eligible) {
        isEligible = false;
        ineligibilityReason = ageCheck.reason;
      }

      // Critical condition check
      if (member.criticalConditions.length > 0) {
        isEligible = false;
        const conditionNames = member.criticalConditions
          .map((c) => c.disease.name)
          .join(', ');
        ineligibilityReason = `Not eligible due to critical conditions: ${conditionNames}`;
      }

      return {
        memberId: member.id,
        memberType: member.memberType,
        label: member.label,
        isEligible,
        ineligibilityReason,
      };
    });

    // P3: Batch update member eligibility in a single transaction to avoid N+1
    await this.prisma.$transaction(
      memberResults.map((r) =>
        this.prisma.applicationMember.update({
          where: { id: r.memberId },
          data: { isEligible: r.isEligible, ineligibilityReason: r.ineligibilityReason ?? null },
        }),
      ),
    );

    return {
      applicationId,
      allEligible: memberResults.every((m) => m.isEligible),
      members: memberResults,
    };
  }
}
