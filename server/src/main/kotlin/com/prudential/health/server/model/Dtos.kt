package com.prudential.health.server.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// ---- Auth ----
@Serializable
data class SendOtpRequest(val phone: String)

@Serializable
data class SendOtpResponse(val otpSent: Boolean, val message: String)

@Serializable
data class VerifyOtpRequest(val phone: String, val otp: String)

@Serializable
data class VerifyOtpResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresAt: Long,
)

// ---- User & Policy ----
@Serializable
data class UserDto(
    @SerialName("_id") val id: String,
    val name: String,
    val phone: String,
    val email: String? = null,
    val profileImageUrl: String? = null,
    val joinedDate: String = "",
    val policyNumber: String = "",
    val isProposer: Boolean = false,
)

@Serializable
data class PolicyDto(
    @SerialName("_id") val id: String,
    val policyNumber: String,
    val planName: String,
    val policyHolder: String,
    val sumInsured: Double,
    val annualPremium: Double,
    val startDate: String,
    val renewalDate: String,
    val isAutoDebitActive: Boolean,
    val status: String,
    val members: List<PolicyMemberDto> = emptyList(),
)

@Serializable
data class PolicyMemberDto(
    @SerialName("_id") val id: String,
    val name: String,
    val isProposer: Boolean = false,
    val relationship: String? = null,
    val phone: String? = null,
    val joinedDate: String? = null,
)

// ---- Steps ----
@Serializable
data class StepDataDto(
    val stepsToday: Int,
    val goalSteps: Int = 10_000,
    val totalActiveDistance: Double,
    val totalActiveTimeMinutes: Int,
    val totalHealthyDays: Int,
)

@Serializable
data class StepSummaryEntryDto(
    val label: String,
    val steps: Int,
    val healthyDays: Int,
    val date: String,
)

@Serializable
data class StepSummaryDto(
    val entries: List<StepSummaryEntryDto>,
    val totalHealthyDays: Int,
    val period: String,
)

@Serializable
data class ConnectPlatformRequest(val platform: String)

// ---- Content ----
@Serializable
data class ArticleDto(
    @SerialName("_id") val id: String,
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val category: String = "",
    val publishedDate: String = "",
)

@Serializable
data class HelpTopicDto(
    @SerialName("_id") val id: String,
    val question: String,
    val answer: String,
    val order: Int = 0,
)

// ---- Calculator ----
@Serializable
data class HeartScoreInputDto(
    val age: Int? = null,
    val gender: String = "female",
    val smokingStatus: String = "",
    val diabetesStatus: String = "",
    val hasAnginaFamilyHistory: Boolean = false,
    val hasChronicKidneyDisease: Boolean = false,
    val hasAtrialFibrillation: Boolean = false,
    val hasMigraines: Boolean = false,
    val hasRheumatoidArthritis: Boolean = false,
    val hasSLE: Boolean = false,
    val hasSevereMentalIllness: Boolean = false,
    val onAntipsychoticMedication: Boolean = false,
    val onSteroidTablets: Boolean = false,
    val hasErectileDysfunction: Boolean = false,
    val cholesterolHdlRatio: Double? = null,
    val systolicBP: Double? = null,
    val systolicBPStdDev: Double? = null,
    val heightCm: Double? = null,
    val weightKg: Double? = null,
)

@Serializable
data class HeartScoreResultDto(
    val riskPercent: Double,
    val bmi: Double,
    val qrisk3Score: Double,
    val healthyPersonScore: Double,
    val relativeRisk: Double,
    val healthyHeartAge: Int,
)

@Serializable
data class CalculatorInfoDto(
    val id: String,
    val name: String,
    val description: String,
    val previousScore: String? = null,
    val previousScoreMessage: String? = null,
)

// ---- Notifications ----
@Serializable
data class NotificationDto(
    @SerialName("_id") val id: String,
    val title: String,
    val message: String,
    val type: String,
    val timestamp: String,
    val isRead: Boolean = false,
)

// ---- Consent ----
@Serializable
data class ConsentDto(
    val consentType: String,
    val isAccepted: Boolean,
    val acceptedAt: String? = null,
)

@Serializable
data class RecordConsentRequest(
    val consentType: String,
    val isAccepted: Boolean,
)

// ---- Health Milestones ----
@Serializable
data class HealthMilestoneDto(
    val targetDays: Int,
    val discountPercent: Int,
    val currentDays: Int,
    val isAchieved: Boolean,
    val progressPercent: Double,
)

// ---- Pagination ----
@Serializable
data class PaginatedResponse<T>(
    val items: List<T>,
    val total: Long,
    val limit: Int,
    val offset: Int,
)

// ---- Profile Update ----
@Serializable
data class UpdateProfileRequest(
    val name: String? = null,
    val email: String? = null,
)

// ---- Sessions ----
@Serializable
data class SessionDto(
    val id: String,
    val deviceId: String?,
    val createdAt: String,
    val expiresAt: Long,
)

// ---- QDiabetes ----
@Serializable
data class QDiabetesInputDto(
    val age: String,
    val gender: String,
    val bmi: String,
    val ethnicity: String,
    val smokingStatus: String,
    val familyHistoryDiabetes: Boolean,
    val highBloodPressureTreatment: Boolean,
    val steroidsUse: Boolean,
    val gestationalDiabetes: Boolean,
    val polycysticOvaries: Boolean,
)

@Serializable
data class QDiabetesResultDto(
    val riskPercent: Double,
    val riskLevel: String,
)

// ---- Generic ----
@Serializable
data class ApiError(val error: String, val message: String)

@Serializable
data class ApiSuccess(val success: Boolean = true, val message: String = "OK")
