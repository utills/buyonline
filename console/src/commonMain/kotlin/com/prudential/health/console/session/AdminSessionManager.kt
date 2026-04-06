package com.prudential.health.console.session

import com.prudential.health.console.model.AdminRole
import com.prudential.health.console.model.AdminUser
import com.prudential.health.core.util.PersistentStorage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object AdminStorageKeys {
    const val ADMIN_ACCESS_TOKEN = "admin_access_token"
    const val ADMIN_REFRESH_TOKEN = "admin_refresh_token"
    const val ADMIN_EXPIRES_AT = "admin_expires_at"
    const val ADMIN_ID = "admin_id"
    const val ADMIN_EMAIL = "admin_email"
    const val ADMIN_NAME = "admin_name"
    const val ADMIN_ROLE = "admin_role"
}

class AdminSessionManager(
    private val storage: PersistentStorage,
) {
    private val _adminUser = MutableStateFlow<AdminUser?>(null)
    val adminUser: StateFlow<AdminUser?> = _adminUser.asStateFlow()

    val isLoggedIn: Boolean
        get() = storage.getString(AdminStorageKeys.ADMIN_ACCESS_TOKEN) != null &&
                (storage.getString(AdminStorageKeys.ADMIN_EXPIRES_AT)?.toLongOrNull() ?: 0L) > System.currentTimeMillis()

    val role: AdminRole
        get() = AdminRole.from(storage.getString(AdminStorageKeys.ADMIN_ROLE) ?: "viewer")

    fun getAccessToken(): String? = storage.getString(AdminStorageKeys.ADMIN_ACCESS_TOKEN)
    fun getRefreshToken(): String? = storage.getString(AdminStorageKeys.ADMIN_REFRESH_TOKEN)

    fun storeSession(
        accessToken: String,
        refreshToken: String,
        expiresAt: Long,
        adminId: Int,
        email: String,
        name: String,
        role: String,
    ) {
        storage.putString(AdminStorageKeys.ADMIN_ACCESS_TOKEN, accessToken)
        storage.putString(AdminStorageKeys.ADMIN_REFRESH_TOKEN, refreshToken)
        storage.putString(AdminStorageKeys.ADMIN_EXPIRES_AT, expiresAt.toString())
        storage.putString(AdminStorageKeys.ADMIN_ID, adminId.toString())
        storage.putString(AdminStorageKeys.ADMIN_EMAIL, email)
        storage.putString(AdminStorageKeys.ADMIN_NAME, name)
        storage.putString(AdminStorageKeys.ADMIN_ROLE, role)
        _adminUser.value = AdminUser(
            id = adminId,
            email = email,
            name = name,
            role = AdminRole.from(role),
        )
    }

    fun restoreSession(): Boolean {
        val token = storage.getString(AdminStorageKeys.ADMIN_ACCESS_TOKEN) ?: return false
        val expiresAt = storage.getString(AdminStorageKeys.ADMIN_EXPIRES_AT)?.toLongOrNull() ?: return false
        if (expiresAt <= System.currentTimeMillis()) {
            clearSession()
            return false
        }
        val adminId = storage.getString(AdminStorageKeys.ADMIN_ID)?.toIntOrNull() ?: return false
        val email = storage.getString(AdminStorageKeys.ADMIN_EMAIL) ?: return false
        val name = storage.getString(AdminStorageKeys.ADMIN_NAME) ?: ""
        val role = storage.getString(AdminStorageKeys.ADMIN_ROLE) ?: "viewer"
        _adminUser.value = AdminUser(
            id = adminId,
            email = email,
            name = name,
            role = AdminRole.from(role),
        )
        return true
    }

    fun clearSession() {
        storage.remove(AdminStorageKeys.ADMIN_ACCESS_TOKEN)
        storage.remove(AdminStorageKeys.ADMIN_REFRESH_TOKEN)
        storage.remove(AdminStorageKeys.ADMIN_EXPIRES_AT)
        storage.remove(AdminStorageKeys.ADMIN_ID)
        storage.remove(AdminStorageKeys.ADMIN_EMAIL)
        storage.remove(AdminStorageKeys.ADMIN_NAME)
        storage.remove(AdminStorageKeys.ADMIN_ROLE)
        _adminUser.value = null
    }
}
