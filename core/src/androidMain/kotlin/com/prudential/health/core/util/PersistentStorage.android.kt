package com.prudential.health.core.util

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

actual class PersistentStorage {

    companion object {
        var appContext: Context? = null
    }

    private val sensitiveKeys = setOf(
        StorageKeys.ACCESS_TOKEN,
        StorageKeys.REFRESH_TOKEN,
        StorageKeys.USER_JSON,
        StorageKeys.POLICY_JSON,
        StorageKeys.CONNECTED_PLATFORM,
    )

    private val encryptedPrefs by lazy {
        val ctx = appContext ?: throw IllegalStateException(
            "PersistentStorage.appContext must be set before use. Call PersistentStorage.appContext = applicationContext in Application.onCreate()"
        )
        val masterKey = MasterKey.Builder(ctx)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            ctx,
            "step_tracker_secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    }

    private val regularPrefs: SharedPreferences by lazy {
        val ctx = appContext ?: throw IllegalStateException(
            "PersistentStorage.appContext must be set before use. Call PersistentStorage.appContext = applicationContext in Application.onCreate()"
        )
        ctx.getSharedPreferences("step_tracker_prefs", Context.MODE_PRIVATE)
    }

    private fun prefsFor(key: String): SharedPreferences =
        if (key in sensitiveKeys) encryptedPrefs else regularPrefs

    actual fun putString(key: String, value: String) {
        prefsFor(key).edit().putString(key, value).apply()
    }

    actual fun getString(key: String): String? {
        return prefsFor(key).getString(key, null)
    }

    actual fun remove(key: String) {
        prefsFor(key).edit().remove(key).apply()
    }

    actual fun clear() {
        encryptedPrefs.edit().clear().apply()
        regularPrefs.edit().clear().apply()
    }
}
