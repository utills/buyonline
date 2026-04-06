package com.prudential.health.core.util

/**
 * Platform-specific key-value storage for persisting session data.
 * Sensitive keys (tokens) use secure storage on each platform:
 *   Android: EncryptedSharedPreferences, iOS: Keychain
 * Non-sensitive keys use regular storage:
 *   Android: SharedPreferences, iOS: NSUserDefaults
 */
expect class PersistentStorage() {
    fun putString(key: String, value: String)
    fun getString(key: String): String?
    fun remove(key: String)
    fun clear()
}

object StorageKeys {
    const val ACCESS_TOKEN = "access_token"
    const val REFRESH_TOKEN = "refresh_token"
    const val USER_JSON = "user_json"
    const val POLICY_JSON = "policy_json"
    const val CONNECTED_PLATFORM = "connected_platform"
    const val STEPS_SYNC_QUEUE = "steps_sync_queue"
    const val LAST_STEP_DATA = "last_step_data"
}
