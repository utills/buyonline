package com.prudential.health.console.feature.analytics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.console.model.CalculatorUsageDto
import com.prudential.health.console.model.ConsentStatDto
import com.prudential.health.console.model.PlatformCountDto
import com.prudential.health.console.model.StepTrendEntry
import com.prudential.health.console.model.TopUserEntry
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AnalyticsUiState(
    val isLoading: Boolean = false,
    val stepTrends: List<StepTrendEntry> = emptyList(),
    val platforms: List<PlatformCountDto> = emptyList(),
    val consentStats: List<ConsentStatDto> = emptyList(),
    val calculatorUsage: List<CalculatorUsageDto> = emptyList(),
    val topUsers: List<TopUserEntry> = emptyList(),
    val selectedDays: Int = 30,
    val error: String? = null,
)

class AnalyticsViewModel(private val repository: AnalyticsRepository) : ViewModel() {
    private val _state = MutableStateFlow(AnalyticsUiState())
    val state: StateFlow<AnalyticsUiState> = _state.asStateFlow()

    init {
        loadAll()
    }

    fun onDaysChanged(days: Int) {
        _state.update { it.copy(selectedDays = days) }
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.getStepTrends(days)) {
                is NetworkResult.Success -> _state.update { it.copy(isLoading = false, stepTrends = result.data) }
                is NetworkResult.Error -> _state.update { it.copy(isLoading = false, error = result.message) }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun refresh() {
        loadAll()
    }

    private fun loadAll() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            val days = _state.value.selectedDays

            val trendsDeferred = async { repository.getStepTrends(days) }
            val platformsDeferred = async { repository.getPlatformBreakdown() }
            val consentDeferred = async { repository.getConsentStats() }
            val calculatorDeferred = async { repository.getCalculatorUsage() }
            val topUsersDeferred = async { repository.getTopUsers() }

            val trendsResult = trendsDeferred.await()
            val platformsResult = platformsDeferred.await()
            val consentResult = consentDeferred.await()
            val calculatorResult = calculatorDeferred.await()
            val topUsersResult = topUsersDeferred.await()

            val firstError = listOf(trendsResult, platformsResult, consentResult, calculatorResult, topUsersResult)
                .filterIsInstance<NetworkResult.Error>()
                .firstOrNull()

            _state.update { current ->
                current.copy(
                    isLoading = false,
                    error = firstError?.message,
                    stepTrends = if (trendsResult is NetworkResult.Success) trendsResult.data else current.stepTrends,
                    platforms = if (platformsResult is NetworkResult.Success) platformsResult.data else current.platforms,
                    consentStats = if (consentResult is NetworkResult.Success) consentResult.data else current.consentStats,
                    calculatorUsage = if (calculatorResult is NetworkResult.Success) calculatorResult.data else current.calculatorUsage,
                    topUsers = if (topUsersResult is NetworkResult.Success) topUsersResult.data else current.topUsers,
                )
            }
        }
    }
}
