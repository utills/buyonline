package com.prudential.health.console.feature.overview

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.console.model.OverviewKpiDto
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class OverviewUiState(
    val isLoading: Boolean = false,
    val kpis: OverviewKpiDto? = null,
    val error: String? = null,
)

class OverviewViewModel(private val repository: OverviewRepository) : ViewModel() {
    private val _state = MutableStateFlow(OverviewUiState())
    val state: StateFlow<OverviewUiState> = _state.asStateFlow()

    init {
        loadKpis()
    }

    fun loadKpis() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.getKpis()) {
                is NetworkResult.Success -> _state.update { it.copy(isLoading = false, kpis = result.data) }
                is NetworkResult.Error -> _state.update { it.copy(isLoading = false, error = result.message) }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun refresh() {
        loadKpis()
    }
}
