package com.prudential.health.feature.dashboard.model

import com.prudential.health.core.model.HealthJourneyMilestone
import com.prudential.health.core.model.HealthPlatform
import com.prudential.health.core.model.StepData
import com.prudential.health.core.model.StepSummary
import com.prudential.health.core.model.SummaryPeriod
import com.prudential.health.core.sync.SyncStatus

data class DashboardUiState(
    val isConnected: Boolean = false,
    val connectedPlatform: HealthPlatform = HealthPlatform.NONE,
    val stepData: StepData = StepData(),
    val weeklySummary: StepSummary = StepSummary(period = SummaryPeriod.WEEKLY),
    val monthlySummary: StepSummary = StepSummary(period = SummaryPeriod.MONTHLY),
    val yearlySummary: StepSummary = StepSummary(period = SummaryPeriod.YEARLY),
    val selectedPeriod: SummaryPeriod = SummaryPeriod.WEEKLY,
    val milestones: List<HealthJourneyMilestone> = defaultMilestones,
    val userName: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val showConsentSheet: Boolean = false,
    val syncStatus: SyncStatus = SyncStatus.IDLE,
    val pendingSyncCount: Int = 0,
)

val defaultMilestones = listOf(
    HealthJourneyMilestone(targetDays = 75, discountPercent = 5, isAchieved = false),
    HealthJourneyMilestone(targetDays = 125, discountPercent = 10, isAchieved = false),
    HealthJourneyMilestone(targetDays = 150, discountPercent = 15, isAchieved = false),
)
