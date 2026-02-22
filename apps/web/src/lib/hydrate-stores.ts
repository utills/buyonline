import type { ResumeStateResponse } from '@buyonline/shared-types';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { useLeadStore } from '@/stores/useLeadStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { usePaymentStore } from '@/stores/usePaymentStore';
import { useKycStore } from '@/stores/useKycStore';
import { useHealthStore } from '@/stores/useHealthStore';

export function hydrateAllStores(state: ResumeStateResponse): void {
  // Reset all stores to clear stale sessionStorage
  useJourneyStore.getState().reset();
  useLeadStore.getState().reset();
  useOnboardingStore.getState().reset();
  useQuoteStore.getState().reset();
  usePaymentStore.getState().reset();
  useKycStore.getState().reset();
  useHealthStore.getState().reset();

  // Hydrate journey store
  useJourneyStore.setState({
    applicationId: state.journey.applicationId,
    leadId: state.journey.leadId,
    currentStep: state.journey.currentStep,
    completedSteps: state.journey.completedSteps,
  });

  // Hydrate lead store
  useLeadStore.setState({
    members: state.lead.members,
    eldestMemberAge: state.lead.eldestMemberAge,
    mobile: state.lead.mobile,
    consentGiven: state.lead.consentGiven,
  });

  // Hydrate onboarding store
  useOnboardingStore.setState({
    pincode: state.onboarding.pincode,
    nearbyHospitals: state.onboarding.nearbyHospitals,
    preExistingDiseases: state.onboarding.preExistingDiseases,
    criticalConditions: state.onboarding.criticalConditions,
    eligibleMembers: state.onboarding.eligibleMembers,
    ineligibleMembers: state.onboarding.ineligibleMembers,
  });

  // Hydrate quote store
  useQuoteStore.setState({
    plans: state.quote.plans,
    selectedPlanId: state.quote.selectedPlanId,
    sumInsured: state.quote.sumInsured,
    tenureMonths: state.quote.tenureMonths,
    coverageLevel: state.quote.coverageLevel,
    selectedTier: state.quote.selectedTier,
    addons: state.quote.addons,
    selectedAddonIds: state.quote.selectedAddonIds,
    pricing: state.quote.pricing,
    planPricings: state.quote.planPricings,
  });

  // Hydrate payment store
  usePaymentStore.setState({
    proposer: state.payment.proposer,
    paymentStatus: state.payment.paymentStatus,
    transactionId: state.payment.transactionId,
    paymentMethod: state.payment.paymentMethod,
    gatewayOrderId: state.payment.gatewayOrderId,
    amount: state.payment.amount,
  });

  // Hydrate KYC store
  useKycStore.setState({
    method: state.kyc.method,
    status: state.kyc.status,
    panNumber: state.kyc.panNumber,
    aadharNumber: state.kyc.aadharNumber,
    dob: state.kyc.dob,
    identityProofType: state.kyc.identityProofType,
    identityProofUrl: state.kyc.identityProofUrl,
    addressProofType: state.kyc.addressProofType,
    addressProofUrl: state.kyc.addressProofUrl,
    useDigiLocker: state.kyc.useDigiLocker,
  });

  // Hydrate health store
  useHealthStore.setState({
    personalDetails: state.health.personalDetails,
    lifestyleAnswers: state.health.lifestyleAnswers,
    medicalAnswers: state.health.medicalAnswers,
    hospitalizationDetails: state.health.hospitalizationDetails,
    disabilityDetails: state.health.disabilityDetails,
    bankDetails: state.health.bankDetails,
  });
}
