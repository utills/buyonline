package com.prudential.health.console.model

import kotlinx.serialization.Serializable

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
