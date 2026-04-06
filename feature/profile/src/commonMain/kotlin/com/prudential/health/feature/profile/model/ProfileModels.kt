package com.prudential.health.feature.profile.model

import com.prudential.health.core.model.AppNotification
import com.prudential.health.core.model.HealthPlatform
import com.prudential.health.core.model.Policy
import com.prudential.health.core.model.User

data class ProfileUiState(
    val user: User? = null,
    val policy: Policy? = null,
    val isLoading: Boolean = false,
    val showLogoutDialog: Boolean = false,
    val showDisconnectDialog: Boolean = false,
    val showTermsOfUseSheet: Boolean = false,
)

data class SettingsUiState(
    val user: User? = null,
    val notificationsEnabled: Boolean = true,
    val connectedPlatform: HealthPlatform = HealthPlatform.NONE,
    val showProfilePicSheet: Boolean = false,
    val showDisconnectDialog: Boolean = false,
    val error: String? = null,
)

data class NotificationsUiState(
    val notifications: List<AppNotification> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
)
