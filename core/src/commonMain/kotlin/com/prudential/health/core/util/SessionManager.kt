package com.prudential.health.core.util

import com.prudential.health.core.model.HealthPlatform
import com.prudential.health.core.model.Policy
import com.prudential.health.core.model.User
import com.prudential.health.core.network.ApiClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class SessionManager(
    private val storage: PersistentStorage,
    private val apiClient: ApiClient,
) {
    private val scope = CoroutineScope(SupervisorJob())
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }

    var accessToken: String? = null
        private set
    var refreshToken: String? = null
        private set

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private val _currentPolicy = MutableStateFlow<Policy?>(null)
    val currentPolicy: StateFlow<Policy?> = _currentPolicy.asStateFlow()

    private val _connectedPlatform = MutableStateFlow(HealthPlatform.NONE)
    val connectedPlatform: StateFlow<HealthPlatform> = _connectedPlatform.asStateFlow()

    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    /** Restore session from persistent storage on app launch */
    suspend fun restoreSession() {
        accessToken = storage.getString(StorageKeys.ACCESS_TOKEN)
        refreshToken = storage.getString(StorageKeys.REFRESH_TOKEN)

        val userJson = storage.getString(StorageKeys.USER_JSON)
        if (userJson != null) {
            try {
                val user = json.decodeFromString<User>(userJson)
                _currentUser.emit(user)
                _isLoggedIn.emit(true)
            } catch (_: Exception) {
                // Corrupted session data — will be cleared on next logout
            }
        }

        val policyJson = storage.getString(StorageKeys.POLICY_JSON)
        if (policyJson != null) {
            try {
                val policy = json.decodeFromString<Policy>(policyJson)
                _currentPolicy.emit(policy)
            } catch (_: Exception) {
                // Corrupted session data — will be cleared on next logout
            }
        }

        val platformStr = storage.getString(StorageKeys.CONNECTED_PLATFORM)
        if (platformStr != null) {
            val platform = HealthPlatform.entries.find { it.name == platformStr } ?: HealthPlatform.NONE
            _connectedPlatform.emit(platform)
        }
    }

    fun storeTokens(access: String, refresh: String) {
        accessToken = access
        refreshToken = refresh
        storage.putString(StorageKeys.ACCESS_TOKEN, access)
        storage.putString(StorageKeys.REFRESH_TOKEN, refresh)
    }

    fun clearTokens() {
        accessToken = null
        refreshToken = null
        storage.remove(StorageKeys.ACCESS_TOKEN)
        storage.remove(StorageKeys.REFRESH_TOKEN)
    }

    suspend fun setUser(user: User?) {
        _currentUser.emit(user)
        _isLoggedIn.emit(user != null)
        if (user != null) {
            storage.putString(StorageKeys.USER_JSON, json.encodeToString(user))
        } else {
            storage.remove(StorageKeys.USER_JSON)
        }
    }

    suspend fun setPolicy(policy: Policy?) {
        _currentPolicy.emit(policy)
        if (policy != null) {
            storage.putString(StorageKeys.POLICY_JSON, json.encodeToString(policy))
        } else {
            storage.remove(StorageKeys.POLICY_JSON)
        }
    }

    suspend fun setConnectedPlatform(platform: HealthPlatform) {
        _connectedPlatform.emit(platform)
        storage.putString(StorageKeys.CONNECTED_PLATFORM, platform.name)
    }

    fun logout() {
        // Best-effort server-side logout (fire and forget)
        scope.launch {
            try {
                val token = storage.getString(StorageKeys.ACCESS_TOKEN)
                if (!token.isNullOrBlank()) {
                    apiClient.post<Unit, Unit>("auth/logout", Unit)
                }
            } catch (_: Exception) { /* ignore - always logout locally */ }
        }
        clearTokens()
        _currentUser.value = null
        _currentPolicy.value = null
        _connectedPlatform.value = HealthPlatform.NONE
        _isLoggedIn.value = false
        storage.clear()
    }
}
