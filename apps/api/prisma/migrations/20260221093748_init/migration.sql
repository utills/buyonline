-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('SELF', 'SPOUSE', 'KID', 'FATHER', 'MOTHER', 'FATHER_IN_LAW', 'MOTHER_IN_LAW');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('PREMIER', 'SIGNATURE', 'GLOBAL');

-- CreateEnum
CREATE TYPE "CoverageLevel" AS ENUM ('INDIVIDUAL', 'FLOATER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('LEAD_CAPTURED', 'OTP_VERIFIED', 'ONBOARDING', 'QUOTE_GENERATED', 'PLAN_SELECTED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'KYC_PENDING', 'KYC_COMPLETED', 'HEALTH_DECLARATION', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "KycMethod" AS ENUM ('CKYC', 'EKYC', 'MANUAL');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PAN_CARD', 'AADHAR_CARD', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE', 'DISCHARGE_SUMMARY', 'ADDRESS_PROOF');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'KYC');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT '+91',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpAttempt" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'LEAD_CAPTURED',
    "currentStep" TEXT NOT NULL DEFAULT 'landing',
    "pincode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationMember" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "memberType" "MemberType" NOT NULL,
    "label" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender",
    "title" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "dob" TIMESTAMP(3),
    "mobile" TEXT,
    "heightFt" INTEGER,
    "heightIn" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "ineligibilityReason" TEXT,

    CONSTRAINT "ApplicationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disease" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Disease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberDisease" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "declared" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MemberDisease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberCriticalCondition" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "declared" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MemberCriticalCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "description" TEXT,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanPricing" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "sumInsured" BIGINT NOT NULL,
    "sumInsuredLabel" TEXT NOT NULL,
    "coverageLevel" "CoverageLevel" NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "basePremium" BIGINT NOT NULL,
    "discountPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gst" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlanPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Addon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanAddon" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "isPreChecked" BOOLEAN NOT NULL DEFAULT false,
    "isIncludedInBundle" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlanAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedPlan" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "sumInsured" BIGINT NOT NULL,
    "coverageLevel" "CoverageLevel" NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "basePremium" BIGINT NOT NULL,
    "addonPremium" BIGINT NOT NULL DEFAULT 0,
    "discountAmount" BIGINT NOT NULL DEFAULT 0,
    "gstAmount" BIGINT NOT NULL DEFAULT 0,
    "totalPremium" BIGINT NOT NULL,

    CONSTRAINT "SelectedPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedAddon" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "price" BIGINT NOT NULL,

    CONSTRAINT "SelectedAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "gatewayOrderId" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewaySignature" TEXT,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposerDetails" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposerDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycVerification" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "method" "KycMethod" NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "panNumber" TEXT,
    "panDob" TIMESTAMP(3),
    "aadharNumber" TEXT,
    "digilockerRef" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "kycId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDetails" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthQuestion" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HealthQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberHealthAnswer" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" BOOLEAN NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberHealthAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberLifestyleAnswer" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "answer" BOOLEAN NOT NULL,
    "subAnswer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberLifestyleAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthDeclaration" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "hospitalizationReason" VARCHAR(200),
    "dischargeSummaryUrl" TEXT,
    "medicationDetails" TEXT,
    "hasDisability" BOOLEAN NOT NULL DEFAULT false,
    "disabilityDetails" TEXT,
    "hasPriorInsurance" BOOLEAN NOT NULL DEFAULT false,
    "priorInsuranceDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "proposalNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNDER_REVIEW',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isNetworkHospital" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_mobile_key" ON "Lead"("mobile");

-- CreateIndex
CREATE INDEX "OtpAttempt_leadId_purpose_idx" ON "OtpAttempt"("leadId", "purpose");

-- CreateIndex
CREATE INDEX "Application_leadId_idx" ON "Application"("leadId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "ApplicationMember_applicationId_idx" ON "ApplicationMember"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationMember_applicationId_memberType_label_key" ON "ApplicationMember"("applicationId", "memberType", "label");

-- CreateIndex
CREATE UNIQUE INDEX "Disease_name_key" ON "Disease"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MemberDisease_memberId_diseaseId_key" ON "MemberDisease"("memberId", "diseaseId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberCriticalCondition_memberId_diseaseId_key" ON "MemberCriticalCondition"("memberId", "diseaseId");

-- CreateIndex
CREATE INDEX "PlanPricing_planId_idx" ON "PlanPricing"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPricing_planId_sumInsured_coverageLevel_tenureMonths_key" ON "PlanPricing"("planId", "sumInsured", "coverageLevel", "tenureMonths");

-- CreateIndex
CREATE UNIQUE INDEX "PlanAddon_planId_addonId_key" ON "PlanAddon"("planId", "addonId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectedPlan_applicationId_key" ON "SelectedPlan"("applicationId");

-- CreateIndex
CREATE INDEX "SelectedPlan_applicationId_idx" ON "SelectedPlan"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectedAddon_applicationId_addonId_key" ON "SelectedAddon"("applicationId", "addonId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_applicationId_key" ON "Payment"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProposerDetails_applicationId_key" ON "ProposerDetails"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "KycVerification_applicationId_key" ON "KycVerification"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_applicationId_key" ON "BankDetails"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "HealthQuestion_questionKey_key" ON "HealthQuestion"("questionKey");

-- CreateIndex
CREATE UNIQUE INDEX "MemberHealthAnswer_memberId_questionId_key" ON "MemberHealthAnswer"("memberId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberLifestyleAnswer_memberId_questionKey_key" ON "MemberLifestyleAnswer"("memberId", "questionKey");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_applicationId_key" ON "Proposal"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_proposalNumber_key" ON "Proposal"("proposalNumber");

-- CreateIndex
CREATE INDEX "Hospital_pincode_idx" ON "Hospital"("pincode");

-- CreateIndex
CREATE INDEX "Hospital_city_idx" ON "Hospital"("city");

-- AddForeignKey
ALTER TABLE "OtpAttempt" ADD CONSTRAINT "OtpAttempt_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationMember" ADD CONSTRAINT "ApplicationMember_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDisease" ADD CONSTRAINT "MemberDisease_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ApplicationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDisease" ADD CONSTRAINT "MemberDisease_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberCriticalCondition" ADD CONSTRAINT "MemberCriticalCondition_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ApplicationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberCriticalCondition" ADD CONSTRAINT "MemberCriticalCondition_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPricing" ADD CONSTRAINT "PlanPricing_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAddon" ADD CONSTRAINT "PlanAddon_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAddon" ADD CONSTRAINT "PlanAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedPlan" ADD CONSTRAINT "SelectedPlan_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedPlan" ADD CONSTRAINT "SelectedPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedAddon" ADD CONSTRAINT "SelectedAddon_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedAddon" ADD CONSTRAINT "SelectedAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposerDetails" ADD CONSTRAINT "ProposerDetails_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycVerification" ADD CONSTRAINT "KycVerification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_kycId_fkey" FOREIGN KEY ("kycId") REFERENCES "KycVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetails" ADD CONSTRAINT "BankDetails_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberHealthAnswer" ADD CONSTRAINT "MemberHealthAnswer_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ApplicationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberHealthAnswer" ADD CONSTRAINT "MemberHealthAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "HealthQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberLifestyleAnswer" ADD CONSTRAINT "MemberLifestyleAnswer_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ApplicationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthDeclaration" ADD CONSTRAINT "HealthDeclaration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
