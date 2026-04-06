package com.prudential.health.feature.auth.model

import kotlinx.serialization.Serializable

@Serializable
data class SendOtpRequest(val phone: String)

@Serializable
data class SendOtpResponse(val otpSent: Boolean = false, val message: String = "")

@Serializable
data class VerifyOtpRequest(val phone: String, val otp: String)

@Serializable
data class VerifyOtpResponse(
    val accessToken: String = "",
    val refreshToken: String = "",
    val expiresAt: Long = 0,
)

data class AuthUiState(
    val phone: String = "",
    val otp: String = "",
    val isTermsAccepted: Boolean = false,
    val isLoading: Boolean = false,
    val error: String? = null,
    val otpSent: Boolean = false,
    val otpTimerSeconds: Int = 180,
    val isOtpVerified: Boolean = false,
    val selectedPolicyNumber: String = "",
    val selectedMemberId: String? = null,
    val isMemberConfirmed: Boolean = false,
    val showTermsSheet: Boolean = false,
    val showMemberConfirmSheet: Boolean = false,
    val consentStep: ConsentStep = ConsentStep.NONE,
    val isUserConsentAccepted: Boolean = false,
    val isLocationConsentAccepted: Boolean = false,
    val isEmailSmsConsentAccepted: Boolean = false,
    val isWhatsappConsentAccepted: Boolean = false,
)

enum class ConsentStep {
    NONE,
    MEMBER_CONFIRM,
    USER_CONSENT,
    LOCATION_PERMISSION,
    NOTIFICATION_PERMISSION,
    COMPLETED,
}
