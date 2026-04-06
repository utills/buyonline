package com.prudential.health.feature.profile.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.core.network.NetworkResult
import com.prudential.health.feature.profile.model.NotificationsUiState
import com.prudential.health.feature.profile.model.ProfileUiState
import com.prudential.health.feature.profile.model.SettingsUiState
import com.prudential.health.feature.profile.repository.ProfileRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class ProfileViewModel(
    private val repository: ProfileRepository,
) : ViewModel() {

    private val _profileState = MutableStateFlow(ProfileUiState())
    val profileState: StateFlow<ProfileUiState> = _profileState.asStateFlow()

    private val _settingsState = MutableStateFlow(SettingsUiState())
    val settingsState: StateFlow<SettingsUiState> = _settingsState.asStateFlow()

    private val _notificationsState = MutableStateFlow(NotificationsUiState())
    val notificationsState: StateFlow<NotificationsUiState> = _notificationsState.asStateFlow()

    init {
        // Collect flows once for ViewModel lifetime
        viewModelScope.launch {
            repository.getCurrentUser().collect { user ->
                _profileState.update { it.copy(user = user) }
                _settingsState.update { it.copy(user = user) }
            }
        }
        viewModelScope.launch {
            repository.getCurrentPolicy().collect { policy ->
                _profileState.update { it.copy(policy = policy) }
            }
        }
        viewModelScope.launch {
            repository.getConnectedPlatform().collect { platform ->
                _settingsState.update { it.copy(connectedPlatform = platform) }
            }
        }
        viewModelScope.launch {
            repository.notifications.collect { notifs ->
                _notificationsState.update { it.copy(notifications = notifs) }
            }
        }
        // Initial load
        viewModelScope.launch {
            _notificationsState.update { it.copy(isLoading = true) }
            when (val result = repository.loadNotifications()) {
                is NetworkResult.Success -> {
                    _notificationsState.update { it.copy(isLoading = false) }
                }
                is NetworkResult.Error -> {
                    _notificationsState.update { it.copy(isLoading = false, error = result.message.ifBlank { "Failed to load notifications" }) }
                }
                else -> _notificationsState.update { it.copy(isLoading = false) }
            }
        }
    }

    fun onShowLogoutDialog(show: Boolean) {
        _profileState.update { it.copy(showLogoutDialog = show) }
    }

    fun onShowDisconnectDialog(show: Boolean) {
        _profileState.update { it.copy(showDisconnectDialog = show) }
        _settingsState.update { it.copy(showDisconnectDialog = show) }
    }

    fun onShowTermsSheet(show: Boolean) {
        _profileState.update { it.copy(showTermsOfUseSheet = show) }
    }

    fun onShowProfilePicSheet(show: Boolean) {
        _settingsState.update { it.copy(showProfilePicSheet = show) }
    }

    fun onNotificationsToggled(enabled: Boolean) {
        _settingsState.update { it.copy(notificationsEnabled = enabled, error = null) }
        viewModelScope.launch {
            val result = try {
                repository.updateNotificationPreference(enabled)
            } catch (e: Exception) {
                _settingsState.update { it.copy(notificationsEnabled = !enabled, error = "Failed to update notifications: ${e.message}") }
                return@launch
            }
            if (result is NetworkResult.Error) {
                _settingsState.update { it.copy(notificationsEnabled = !enabled, error = result.message.ifBlank { "Failed to update notifications" }) }
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            try {
                repository.logout()
            } catch (e: Exception) {
                _settingsState.update { it.copy(error = "Logout failed: ${e.message}") }
            }
            _profileState.update { it.copy(showLogoutDialog = false) }
        }
    }

    fun disconnectPlatform() {
        viewModelScope.launch {
            try {
                repository.disconnectPlatform()
            } catch (e: Exception) {
                _settingsState.update { it.copy(showDisconnectDialog = false, error = "Failed to disconnect: ${e.message}") }
                _profileState.update { it.copy(showDisconnectDialog = false) }
                return@launch
            }
            _settingsState.update { it.copy(showDisconnectDialog = false) }
            _profileState.update { it.copy(showDisconnectDialog = false) }
        }
    }

    override fun onCleared() {
        super.onCleared()
    }
}
