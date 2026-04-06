package com.prudential.health.console.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false,
)

class LoginViewModel(private val repository: AdminAuthRepository) : ViewModel() {
    private val _state = MutableStateFlow(LoginUiState())
    val state: StateFlow<LoginUiState> = _state.asStateFlow()

    fun onEmailChanged(value: String) {
        _state.update { it.copy(email = value, error = null) }
    }

    fun onPasswordChanged(value: String) {
        _state.update { it.copy(password = value, error = null) }
    }

    fun login() {
        val s = _state.value
        if (s.email.isBlank() || s.password.isBlank()) {
            _state.update { it.copy(error = "Email and password are required") }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.login(s.email.trim(), s.password)) {
                is NetworkResult.Success -> _state.update { it.copy(isLoading = false, isSuccess = true) }
                is NetworkResult.Error -> _state.update { it.copy(isLoading = false, error = result.message) }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }
}
