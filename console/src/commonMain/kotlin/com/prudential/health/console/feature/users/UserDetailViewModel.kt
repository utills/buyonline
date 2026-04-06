package com.prudential.health.console.feature.users

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.console.model.UserDetailAdminDto
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class UserDetailUiState(
    val isLoading: Boolean = false,
    val detail: UserDetailAdminDto? = null,
    val error: String? = null,
)

class UserDetailViewModel(private val repository: UserAdminRepository) : ViewModel() {

    private val _state = MutableStateFlow(UserDetailUiState())
    val state: StateFlow<UserDetailUiState> = _state.asStateFlow()

    fun loadUser(id: Int) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.getUserDetail(id)) {
                is NetworkResult.Success -> _state.update {
                    it.copy(isLoading = false, detail = result.data)
                }
                is NetworkResult.Error -> _state.update {
                    it.copy(isLoading = false, error = result.message)
                }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }
}
