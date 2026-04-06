package com.prudential.health.console.feature.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.console.model.AdminRole
import com.prudential.health.console.model.AdminUserListDto
import com.prudential.health.console.model.AuditLogEntryDto
import com.prudential.health.console.model.CreateAdminUserRequest
import com.prudential.health.console.model.UpdateAdminUserRequest
import com.prudential.health.console.network.AdminApiEndpoints
import com.prudential.health.console.session.AdminSessionManager
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SettingsUiState(
    val isLoading: Boolean = false,
    val adminUsers: List<AdminUserListDto> = emptyList(),
    val auditLog: List<AuditLogEntryDto> = emptyList(),
    val showCreateDialog: Boolean = false,
    val editingUser: AdminUserListDto? = null,
    val error: String? = null,
    val successMessage: String? = null,
    val currentAdminRole: AdminRole = AdminRole.VIEWER,
)

class SettingsViewModel(
    private val apiClient: ApiClient,
    private val sessionManager: AdminSessionManager,
) : ViewModel() {
    private val _state = MutableStateFlow(SettingsUiState(currentAdminRole = sessionManager.role))
    val state: StateFlow<SettingsUiState> = _state.asStateFlow()

    init { loadData() }

    fun loadData() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            // Load admin users
            when (val r = apiClient.get<List<AdminUserListDto>>(AdminApiEndpoints.AdminUsers.LIST)) {
                is NetworkResult.Success -> _state.update { it.copy(adminUsers = r.data) }
                is NetworkResult.Error -> _state.update { it.copy(error = r.message) }
                else -> {}
            }
            // Load audit log
            when (val r = apiClient.get<com.prudential.health.console.model.PaginatedResponse<AuditLogEntryDto>>("${AdminApiEndpoints.AuditLog.LIST}?page=1&pageSize=100")) {
                is NetworkResult.Success -> _state.update { it.copy(auditLog = r.data.items, isLoading = false) }
                is NetworkResult.Error -> _state.update { it.copy(error = r.message, isLoading = false) }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun createAdminUser(email: String, name: String, role: String, tempPassword: String) {
        viewModelScope.launch {
            val req = CreateAdminUserRequest(email = email, name = name, role = role, temporaryPassword = tempPassword)
            when (val r = apiClient.post<AdminUserListDto, CreateAdminUserRequest>(AdminApiEndpoints.AdminUsers.LIST, body = req)) {
                is NetworkResult.Success -> {
                    _state.update { it.copy(showCreateDialog = false, successMessage = "Admin user created") }
                    loadData()
                }
                is NetworkResult.Error -> _state.update { it.copy(error = r.message) }
                else -> {}
            }
        }
    }

    fun updateAdminUser(id: Int, role: String?, isActive: Boolean?) {
        viewModelScope.launch {
            val req = UpdateAdminUserRequest(role = role, isActive = isActive)
            when (val r = apiClient.put<AdminUserListDto, UpdateAdminUserRequest>(AdminApiEndpoints.AdminUsers.detail(id), body = req)) {
                is NetworkResult.Success -> {
                    _state.update { it.copy(editingUser = null, successMessage = "User updated") }
                    loadData()
                }
                is NetworkResult.Error -> _state.update { it.copy(error = r.message) }
                else -> {}
            }
        }
    }

    fun showCreateDialog() { _state.update { it.copy(showCreateDialog = true) } }
    fun dismissCreateDialog() { _state.update { it.copy(showCreateDialog = false) } }
    fun startEditUser(user: AdminUserListDto) { _state.update { it.copy(editingUser = user) } }
    fun dismissEditDialog() { _state.update { it.copy(editingUser = null) } }
    fun clearMessage() { _state.update { it.copy(successMessage = null, error = null) } }
}
