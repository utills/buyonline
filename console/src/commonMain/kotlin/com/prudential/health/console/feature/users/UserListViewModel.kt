package com.prudential.health.console.feature.users

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.console.model.UserAdminDto
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class UserListUiState(
    val isLoading: Boolean = false,
    val users: List<UserAdminDto> = emptyList(),
    val total: Long = 0,
    val searchQuery: String = "",
    val selectedUserId: Int? = null,
    val error: String? = null,
)

class UserListViewModel(private val repository: UserAdminRepository) : ViewModel() {

    private val _state = MutableStateFlow(UserListUiState())
    val state: StateFlow<UserListUiState> = _state.asStateFlow()

    private var debounceJob: Job? = null
    private var loadJob: Job? = null

    init {
        loadUsers()
    }

    fun onSearchChanged(query: String) {
        _state.update { it.copy(searchQuery = query) }
        debounceJob?.cancel()
        debounceJob = viewModelScope.launch {
            delay(300)
            loadUsers(page = 1)
        }
    }

    fun onUserSelected(id: Int) {
        _state.update { it.copy(selectedUserId = id) }
    }

    fun onUserDeselected() {
        _state.update { it.copy(selectedUserId = null) }
    }

    fun loadUsers(page: Int = 1) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.getUsers(
                q = _state.value.searchQuery,
                page = page,
            )) {
                is NetworkResult.Success -> _state.update {
                    it.copy(
                        isLoading = false,
                        users = result.data.items,
                        total = result.data.total,
                    )
                }
                is NetworkResult.Error -> _state.update {
                    it.copy(isLoading = false, error = result.message)
                }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun refresh() {
        loadUsers()
    }

    override fun onCleared() {
        super.onCleared()
        debounceJob?.cancel()
        loadJob?.cancel()
    }
}
