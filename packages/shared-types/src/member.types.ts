import { Gender, MemberType } from './enums';

export interface Member {
  id: string;
  memberType: MemberType;
  label: string;
  age: number;
  gender?: Gender;
  title?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  mobile?: string;
  heightFt?: number;
  heightIn?: number;
  weightKg?: number;
  isEligible: boolean;
  ineligibilityReason?: string;
}

export interface MemberSelection {
  self: boolean;
  spouse: boolean;
  kidsCount: number;
  father: boolean;
  mother: boolean;
  fatherInLaw: boolean;
  motherInLaw: boolean;
}
