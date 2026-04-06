package com.prudential.health.feature.dashboard.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.core.model.HealthPlatform
import com.prudential.health.core.model.SummaryPeriod
import com.prudential.health.core.network.NetworkResult
import com.prudential.health.core.sync.StepSyncManager
import com.prudential.health.feature.dashboard.model.DashboardUiState
import com.prudential.health.feature.dashboard.repository.DashboardRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class DashboardViewModel(
    private val repository: DashboardRepository,
) : ViewModel() {

    private val syncManager: StepSyncManager = repository.syncManager

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private val pendingPlatform = MutableStateFlow<HealthPlatform?>(null)

    private val observerJobs = mutableListOf<Job>()

    init {
        observerJobs += observeConnectionState()
        observerJobs += observeStepData()
        observerJobs += observeSummaries()
        observerJobs += observeSyncStatus()
        loadDashboard()
    }

    private fun observeConnectionState(): Job = viewModelScope.launch {
        repository.getConnectedPlatform().collect { platform ->
            _uiState.update {
                it.copy(
                    isConnected = platform != HealthPlatform.NONE,
                    connectedPlatform = platform,
                )
            }
        }
    }

    private fun observeStepData(): Job = viewModelScope.launch {
        repository.stepData.collect { data ->
            _uiState.update { it.copy(stepData = data) }
        }
    }

    private fun observeSummaries(): Job {
        return viewModelScope.launch {
            repository.weeklySummary.collect { summary ->
                _uiState.update { it.copy(weeklySummary = summary) }
            }
        }.also {
            observerJobs += viewModelScope.launch {
                repository.monthlySummary.collect { summary ->
                    _uiState.update { it.copy(monthlySummary = summary) }
                }
            }
            observerJobs += viewModelScope.launch {
                repository.yearlySummary.collect { summary ->
                    _uiState.update { it.copy(yearlySummary = summary) }
                }
            }
        }
    }

    private fun observeSyncStatus(): Job = viewModelScope.launch {
        syncManager.syncStatus.collect { status ->
            _uiState.update { it.copy(syncStatus = status) }
        }
    }.also {
        observerJobs += viewModelScope.launch {
            syncManager.pendingCount.collect { count ->
                _uiState.update { it.copy(pendingSyncCount = count) }
            }
        }
    }

    fun loadDashboard() {
        _uiState.update { it.copy(userName = repository.getUserName(), error = null) }
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            // Trigger pending sync first so the server has the latest data before we fetch.
            launch { syncManager.syncIfNeeded() }

            val errors = mutableListOf<String>()
            listOf(
                async {
                    val result = repository.loadConnectedPlatformFromServer()
                    if (result is NetworkResult.Error) errors.add("Connection: ${result.message}")
                },
                async {
                    val result = repository.loadTodaySteps()
                    if (result is NetworkResult.Error) errors.add("Steps: ${result.message}")
                },
                async {
                    val result = repository.loadSummary(SummaryPeriod.WEEKLY)
                    if (result is NetworkResult.Error) errors.add("Weekly: ${result.message}")
                },
                async {
                    val result = repository.loadSummary(SummaryPeriod.MONTHLY)
                    if (result is NetworkResult.Error) errors.add("Monthly: ${result.message}")
                },
                async {
                    val result = repository.loadSummary(SummaryPeriod.YEARLY)
                    if (result is NetworkResult.Error) errors.add("Yearly: ${result.message}")
                },
                async {
                    when (val result = repository.loadMilestones()) {
                        is NetworkResult.Success -> _uiState.update { it.copy(milestones = result.data) }
                        is NetworkResult.Error -> errors.add("Milestones: ${result.message}")
                        else -> Unit
                    }
                },
            ).awaitAll()

            _uiState.update { state ->
                state.copy(
                    isLoading = false,
                    error = if (errors.isNotEmpty()) errors.joinToString("; ") else null,
                )
            }
        }
    }

    /** Manually trigger a sync of queued offline entries. */
    fun syncNow() {
        viewModelScope.launch {
            val synced = syncManager.syncIfNeeded()
            if (synced) loadDashboard()
        }
    }

    fun onPeriodSelected(period: SummaryPeriod) {
        _uiState.update { it.copy(selectedPeriod = period) }
    }

    fun requestConnectPlatform(platform: HealthPlatform) {
        pendingPlatform.value = platform
        _uiState.update { it.copy(showConsentSheet = true) }
    }

    fun confirmConnect() {
        val platform = pendingPlatform.value ?: return
        _uiState.update { it.copy(showConsentSheet = false) }
        viewModelScope.launch {
            repository.connectPlatform(platform)
            pendingPlatform.value = null
            loadDashboard()
        }
    }

    fun dismissConsent() {
        pendingPlatform.value = null
        _uiState.update { it.copy(showConsentSheet = false) }
    }

    fun onDisconnectPlatform() {
        viewModelScope.launch {
            repository.disconnectPlatform()
        }
    }

    override fun onCleared() {
        super.onCleared()
        observerJobs.forEach { it.cancel() }
        observerJobs.clear()
    }
}
