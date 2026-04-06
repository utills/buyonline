package com.prudential.health.console.feature.users

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.console.model.PolicyAdminDto
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class PolicyListUiState(
    val isLoading: Boolean = false,
    val policies: List<PolicyAdminDto> = emptyList(),
    val searchQuery: String = "",
    val error: String? = null,
) {
    val filteredPolicies: List<PolicyAdminDto>
        get() = if (searchQuery.isBlank()) policies
        else policies.filter { policy ->
            policy.policyNumber.contains(searchQuery, ignoreCase = true) ||
                policy.planName.contains(searchQuery, ignoreCase = true) ||
                policy.policyHolder.contains(searchQuery, ignoreCase = true)
        }
}

class PolicyListViewModel(private val repository: UserAdminRepository) : ViewModel() {

    private val _state = MutableStateFlow(PolicyListUiState())
    val state: StateFlow<PolicyListUiState> = _state.asStateFlow()

    init {
        loadPolicies()
    }

    fun onSearchChanged(query: String) {
        _state.update { it.copy(searchQuery = query) }
    }

    fun refresh() {
        loadPolicies()
    }

    private fun loadPolicies() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.getPolicies()) {
                is NetworkResult.Success -> _state.update {
                    it.copy(isLoading = false, policies = result.data.items)
                }
                is NetworkResult.Error -> _state.update {
                    it.copy(isLoading = false, error = result.message)
                }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }
}
