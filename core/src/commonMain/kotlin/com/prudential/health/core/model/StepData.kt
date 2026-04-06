package com.prudential.health.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class StepData(
    val stepsToday: Int = 0,
    val goalSteps: Int = 10_000,
    val totalActiveDistance: Double = 0.0,
    val totalActiveTimeMinutes: Int = 0,
    val totalHealthyDays: Int = 0,
)

@Serializable
data class StepSummaryEntry(
    val label: String = "",
    val steps: Int = 0,
    val healthyDays: Int = 0,
    val date: String = "",
)

@Serializable
data class StepSummary(
    val entries: List<StepSummaryEntry> = emptyList(),
    val totalHealthyDays: Int = 0,
    val period: SummaryPeriod = SummaryPeriod.WEEKLY,
)

@Serializable
enum class SummaryPeriod {
    @SerialName("weekly") WEEKLY,
    @SerialName("monthly") MONTHLY,
    @SerialName("yearly") YEARLY,
}

@Serializable
data class HealthJourneyMilestone(
    val targetDays: Int = 0,
    val discountPercent: Int = 0,
    val currentDays: Int = 0,
    val isAchieved: Boolean = false,
    val progressPercent: Double = 0.0,
)

@Serializable
enum class HealthPlatform {
    @SerialName("google_fit") GOOGLE_FIT,
    @SerialName("apple_health") APPLE_HEALTH,
    @SerialName("none") NONE,
}
