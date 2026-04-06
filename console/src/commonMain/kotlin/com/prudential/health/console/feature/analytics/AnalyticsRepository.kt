package com.prudential.health.console.feature.analytics

import com.prudential.health.console.model.CalculatorUsageDto
import com.prudential.health.console.model.ConsentStatDto
import com.prudential.health.console.model.PlatformCountDto
import com.prudential.health.console.model.StepTrendEntry
import com.prudential.health.console.model.TopUserEntry
import com.prudential.health.console.network.AdminApiEndpoints
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.NetworkResult
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.TimeZone
import kotlinx.datetime.minus
import kotlinx.datetime.toLocalDateTime

class AnalyticsRepository(private val apiClient: ApiClient) {

    suspend fun getStepTrends(days: Int = 30): NetworkResult<List<StepTrendEntry>> {
        val today = Clock.System.now().toLocalDateTime(TimeZone.UTC).date
        val from = today.minus(days, DateTimeUnit.DAY)
        return apiClient.get("${AdminApiEndpoints.Analytics.STEP_TRENDS}?from=$from&to=$today")
    }

    suspend fun getPlatformBreakdown(): NetworkResult<List<PlatformCountDto>> =
        apiClient.get(AdminApiEndpoints.Analytics.PLATFORMS)

    suspend fun getConsentStats(): NetworkResult<List<ConsentStatDto>> =
        apiClient.get(AdminApiEndpoints.Analytics.CONSENT_STATS)

    suspend fun getCalculatorUsage(): NetworkResult<List<CalculatorUsageDto>> =
        apiClient.get(AdminApiEndpoints.Analytics.CALCULATOR_USAGE)

    suspend fun getTopUsers(limit: Int = 10): NetworkResult<List<TopUserEntry>> {
        val today = Clock.System.now().toLocalDateTime(TimeZone.UTC).date
        val from = today.minus(30, DateTimeUnit.DAY)
        return apiClient.get("${AdminApiEndpoints.Analytics.TOP_USERS}?limit=$limit&from=$from&to=$today")
    }
}
