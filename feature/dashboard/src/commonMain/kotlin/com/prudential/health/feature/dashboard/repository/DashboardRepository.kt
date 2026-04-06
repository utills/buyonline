package com.prudential.health.feature.dashboard.repository

import com.prudential.health.core.model.HealthJourneyMilestone
import com.prudential.health.core.model.HealthPlatform
import com.prudential.health.core.model.StepData
import com.prudential.health.core.model.StepSummary
import com.prudential.health.core.model.SummaryPeriod
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.ApiEndpoints
import com.prudential.health.core.network.NetworkResult
import com.prudential.health.core.sync.StepSyncManager
import com.prudential.health.core.util.PersistentStorage
import com.prudential.health.core.util.SessionManager
import com.prudential.health.core.util.StorageKeys
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class DashboardRepository(
    private val apiClient: ApiClient,
    private val sessionManager: SessionManager,
    private val storage: PersistentStorage,
    val syncManager: StepSyncManager,
) {
    private val json = Json { ignoreUnknownKeys = true }

    private val _stepData = MutableStateFlow(loadCachedStepData() ?: StepData())
    val stepData: StateFlow<StepData> = _stepData.asStateFlow()

    private val _weeklySummary = MutableStateFlow(StepSummary(period = SummaryPeriod.WEEKLY))
    val weeklySummary: StateFlow<StepSummary> = _weeklySummary.asStateFlow()

    private val _monthlySummary = MutableStateFlow(StepSummary(period = SummaryPeriod.MONTHLY))
    val monthlySummary: StateFlow<StepSummary> = _monthlySummary.asStateFlow()

    private val _yearlySummary = MutableStateFlow(StepSummary(period = SummaryPeriod.YEARLY))
    val yearlySummary: StateFlow<StepSummary> = _yearlySummary.asStateFlow()

    @Serializable
    private data class PlatformBody(val platform: String)

    suspend fun loadTodaySteps(): NetworkResult<StepData> {
        val result: NetworkResult<StepData> = apiClient.get(ApiEndpoints.Steps.TODAY)
        if (result is NetworkResult.Success) {
            _stepData.emit(result.data)
            cacheStepData(result.data)
        }
        // On error, the StateFlow already holds the last-known value (from cache or prior load).
        return result
    }

    suspend fun loadSummary(period: SummaryPeriod): NetworkResult<StepSummary> {
        val result: NetworkResult<StepSummary> = apiClient.get(
            "${ApiEndpoints.Steps.SUMMARY}?period=${period.name.lowercase()}",
        )
        if (result is NetworkResult.Success) {
            when (period) {
                SummaryPeriod.WEEKLY -> _weeklySummary.emit(result.data)
                SummaryPeriod.MONTHLY -> _monthlySummary.emit(result.data)
                SummaryPeriod.YEARLY -> _yearlySummary.emit(result.data)
            }
        }
        return result
    }

    @Serializable
    private data class ConnectionResponse(val platform: String = "none")

    suspend fun loadConnectedPlatformFromServer(): NetworkResult<Unit> {
        val result: NetworkResult<ConnectionResponse> = apiClient.get(ApiEndpoints.Steps.CONNECTION)
        return when (result) {
            is NetworkResult.Success -> {
                val platform = when (result.data.platform) {
                    "google_fit" -> HealthPlatform.GOOGLE_FIT
                    "apple_health" -> HealthPlatform.APPLE_HEALTH
                    else -> HealthPlatform.NONE
                }
                sessionManager.setConnectedPlatform(platform)
                NetworkResult.Success(Unit)
            }
            is NetworkResult.Error -> NetworkResult.Error(result.message, result.code)
            is NetworkResult.Loading -> NetworkResult.Loading
        }
    }

    suspend fun connectPlatform(platform: HealthPlatform): NetworkResult<Unit> {
        val platformName = when (platform) {
            HealthPlatform.GOOGLE_FIT -> "google_fit"
            HealthPlatform.APPLE_HEALTH -> "apple_health"
            else -> return NetworkResult.Error("Invalid platform")
        }
        val result: NetworkResult<Unit> = apiClient.post(
            ApiEndpoints.Steps.CONNECT,
            PlatformBody(platformName),
        )
        if (result is NetworkResult.Success) {
            sessionManager.setConnectedPlatform(platform)
        }
        return result
    }

    suspend fun disconnectPlatform(): NetworkResult<Unit> {
        val result: NetworkResult<Unit> = apiClient.post(
            ApiEndpoints.Steps.DISCONNECT,
            Unit,
        )
        if (result is NetworkResult.Success) {
            sessionManager.setConnectedPlatform(HealthPlatform.NONE)
        }
        return result
    }

    fun getConnectedPlatform(): StateFlow<HealthPlatform> = sessionManager.connectedPlatform

    suspend fun loadMilestones(): NetworkResult<List<HealthJourneyMilestone>> =
        apiClient.get(ApiEndpoints.Steps.MILESTONES)

    fun getUserName(): String = sessionManager.currentUser.value?.name ?: ""

    // ---- Local cache for cold-start offline experience ----

    private fun cacheStepData(data: StepData) {
        try {
            storage.putString(StorageKeys.LAST_STEP_DATA, json.encodeToString(data))
        } catch (_: Exception) {}
    }

    private fun loadCachedStepData(): StepData? {
        val raw = storage.getString(StorageKeys.LAST_STEP_DATA) ?: return null
        return try { json.decodeFromString(raw) } catch (_: Exception) { null }
    }
}
