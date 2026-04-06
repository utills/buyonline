package com.prudential.health.feature.profile.repository

import com.prudential.health.core.model.AppNotification
import com.prudential.health.core.model.HealthPlatform
import com.prudential.health.core.model.Policy
import com.prudential.health.core.model.User
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.ApiEndpoints
import com.prudential.health.core.network.NetworkResult
import com.prudential.health.core.util.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable

@Serializable
private data class NotificationPreferenceRequest(val notificationsEnabled: Boolean)

class ProfileRepository(
    private val apiClient: ApiClient,
    private val sessionManager: SessionManager,
) {
    private val _notifications = MutableStateFlow<List<AppNotification>>(emptyList())
    val notifications: StateFlow<List<AppNotification>> = _notifications.asStateFlow()

    fun getCurrentUser(): StateFlow<User?> = sessionManager.currentUser
    fun getCurrentPolicy(): StateFlow<Policy?> = sessionManager.currentPolicy
    fun getConnectedPlatform(): StateFlow<HealthPlatform> = sessionManager.connectedPlatform

    suspend fun loadNotifications(): NetworkResult<List<AppNotification>> {
        val result: NetworkResult<List<AppNotification>> = apiClient.get(ApiEndpoints.Profile.NOTIFICATIONS)
        if (result is NetworkResult.Success) {
            _notifications.emit(result.data)
        }
        return result
    }

    suspend fun updateNotificationPreference(enabled: Boolean): NetworkResult<Unit> {
        return apiClient.post(
            ApiEndpoints.Profile.SETTINGS,
            NotificationPreferenceRequest(notificationsEnabled = enabled),
        )
    }

    suspend fun logout() {
        apiClient.post<Unit, Unit>(ApiEndpoints.Auth.LOGOUT, Unit)
        sessionManager.logout()
    }

    suspend fun disconnectPlatform() {
        apiClient.post<Unit, Unit>(ApiEndpoints.Steps.DISCONNECT, Unit)
        sessionManager.setConnectedPlatform(HealthPlatform.NONE)
    }
}
