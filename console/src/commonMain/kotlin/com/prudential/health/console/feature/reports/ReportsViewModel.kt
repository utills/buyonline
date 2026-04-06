package com.prudential.health.console.feature.reports

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.TimeZone
import kotlinx.datetime.minus
import kotlinx.datetime.toLocalDateTime

enum class ReportType(val label: String, val apiKey: String) {
    USERS("Users", "users"),
    STEPS("Step Data", "steps"),
    POLICIES("Policies", "policies"),
    CALCULATORS("Calculator Results", "calculators"),
    CONSENT("Consent Records", "consent"),
}

data class ReportsUiState(
    val isLoading: Boolean = false,
    val selectedType: ReportType = ReportType.USERS,
    val csvContent: String? = null,
    val error: String? = null,
    val successMessage: String? = null,
    val reportsGeneratedCount: Int = 0,
    val fromDate: String = run {
        val today = Clock.System.now().toLocalDateTime(TimeZone.UTC).date
        today.minus(30, DateTimeUnit.DAY).toString()
    },
    val toDate: String = Clock.System.now().toLocalDateTime(TimeZone.UTC).date.toString(),
)

class ReportsViewModel(private val repository: ReportsRepository) : ViewModel() {
    private val _state = MutableStateFlow(ReportsUiState())
    val state: StateFlow<ReportsUiState> = _state.asStateFlow()

    fun onReportTypeSelected(type: ReportType) {
        _state.update { it.copy(selectedType = type, csvContent = null, error = null) }
    }

    fun onFromDateChanged(date: String) {
        _state.update { it.copy(fromDate = date, csvContent = null, error = null) }
    }

    fun onToDateChanged(date: String) {
        _state.update { it.copy(toDate = date, csvContent = null, error = null) }
    }

    fun generateReport() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null, csvContent = null) }
            val s = _state.value
            when (val result = repository.exportReport(s.selectedType.apiKey, s.fromDate, s.toDate)) {
                is NetworkResult.Success -> _state.update {
                    it.copy(
                        isLoading = false,
                        csvContent = result.data,
                        successMessage = "Report ready",
                        reportsGeneratedCount = it.reportsGeneratedCount + 1,
                    )
                }
                is NetworkResult.Error -> _state.update {
                    it.copy(isLoading = false, error = result.message)
                }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun saveToFile(path: String) {
        val csv = _state.value.csvContent ?: return
        viewModelScope.launch {
            try {
                withContext(Dispatchers.IO) { java.io.File(path).writeText(csv) }
                _state.update { it.copy(successMessage = "Saved to $path") }
            } catch (e: Exception) {
                _state.update { it.copy(error = "Failed to save: ${e.message ?: "Unknown error"}") }
            }
        }
    }

    fun clearMessage() {
        _state.update { it.copy(successMessage = null, error = null) }
    }
}
