package com.prudential.health.server.model

import kotlinx.serialization.Serializable

// ---- Admin Auth ----
@Serializable
data class AdminLoginRequest(val email: String, val password: String)

@Serializable
data class AdminLoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresAt: Long,
    val adminId: Int,
    val name: String,
    val role: String,
)

// ---- Analytics ----
@Serializable
data class OverviewKpiDto(
    val totalUsers: Int = 0,
    val activeUsersToday: Int = 0,
    val avgStepsToday: Int = 0,
    val totalHealthyDaysThisMonth: Int = 0,
    val userGrowthPercent: Double = 0.0,
    val stepsChangePercent: Double = 0.0,
)

@Serializable
data class StepTrendEntry(
    val date: String,
    val totalSteps: Long,
    val avgSteps: Int,
    val activeUsers: Int,
    val healthyDayCount: Int,
)

@Serializable
data class GoalAchievementEntry(
    val date: String,
    val totalUsers: Int,
    val usersAchievedGoal: Int,
    val achievementRate: Double,
)

@Serializable
data class PlatformCountDto(
    val platform: String,
    val count: Int,
    val percent: Double,
)

@Serializable
data class ConsentStatDto(
    val consentType: String,
    val acceptedCount: Int,
    val totalUsers: Int,
    val complianceRate: Double,
)

@Serializable
data class CalculatorUsageDto(
    val calculatorType: String,
    val usageCount: Int,
    val avgScore: Double,
)

@Serializable
data class TopUserEntry(
    val id: Int,
    val name: String,
    val phone: String,
    val totalSteps: Long,
    val healthyDays: Int,
    val policyNumber: String?,
)

// ---- User Admin ----
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

// ---- Content Admin ----
@Serializable
data class ArticleAdminDto(
    val id: Int,
    val title: String,
    val description: String,
    val imageUrl: String?,
    val category: String,
    val publishedDate: String,
    val isPublished: Boolean,
)

@Serializable
data class HelpTopicAdminDto(
    val id: Int,
    val question: String,
    val answer: String,
    val order: Int,
    val isActive: Boolean,
)

@Serializable
data class CreateArticleRequest(
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val category: String = "",
    val publishedDate: String = "",
    val isPublished: Boolean = false,
)

@Serializable
data class CreateHelpTopicRequest(
    val question: String,
    val answer: String,
    val sortOrder: Int = 0,
    val isActive: Boolean = true,
)

@Serializable
data class SetPublishedRequest(val isPublished: Boolean)

// ---- Notifications ----
@Serializable
data class SendNotificationRequest(
    val userIds: List<Int>? = null,
    val title: String,
    val message: String,
    val type: String = "general",
)

// ---- Admin Users ----
@Serializable
data class AdminUserListDto(
    val id: Int,
    val email: String,
    val name: String,
    val role: String,
    val isActive: Boolean,
    val createdAt: String,
    val lastLoginAt: String?,
)

@Serializable
data class CreateAdminUserRequest(
    val email: String,
    val name: String,
    val role: String = "viewer",
    val temporaryPassword: String,
)

@Serializable
data class UpdateAdminUserRequest(
    val role: String? = null,
    val isActive: Boolean? = null,
)

// ---- Audit Log ----
@Serializable
data class AuditLogEntryDto(
    val id: Int,
    val action: String,
    val detail: String,
    val ipAddress: String,
    val timestamp: String,
    val adminId: Int?,
)

// ---- Reports ----
@Serializable
data class ExportReportRequest(
    val type: String, // user_activity | step_records | healthy_days | consent_status
    val from: String,
    val to: String,
)
