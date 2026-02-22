export class MemberEligibility {
  memberId!: string;
  memberType!: string;
  label!: string;
  isEligible!: boolean;
  ineligibilityReason?: string;
}

export class EligibilityResultDto {
  applicationId!: string;
  allEligible!: boolean;
  members!: MemberEligibility[];
}
