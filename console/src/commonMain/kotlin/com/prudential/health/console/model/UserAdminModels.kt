package com.prudential.health.console.model

import kotlinx.serialization.Serializable

@Serializable
data class UserAdminDto(
    val id: Int,
    val name: String,
    val phone: String,
    val email: String?,
    val joinedDate: String,
    val policyNumber: String?,
    val policyStatus: String?,
    val totalStepsLast30Days: Long,
    val healthyDaysLast30Days: Int,
    val connectedPlatform: String?,
    val lastActiveDate: String?,
)

@Serializable
data class StepHistoryEntry(val date: String, val steps: Int, val isHealthyDay: Boolean)

@Serializable
data class ConsentStatusDto(val consentType: String, val isAccepted: Boolean, val acceptedAt: String?)

@Serializable
data class UserDetailAdminDto(
    val user: UserAdminDto,
    val stepHistory: List<StepHistoryEntry>,
    val consents: List<ConsentStatusDto>,
    val activeSessions: Int,
)

@Serializable
data class PolicyAdminDto(
    val id: Int,
    val policyNumber: String,
    val planName: String,
    val policyHolder: String,
    val status: String,
    val sumInsured: Double,
    val annualPremium: Double,
    val renewalDate: String,
    val memberCount: Int,
)
