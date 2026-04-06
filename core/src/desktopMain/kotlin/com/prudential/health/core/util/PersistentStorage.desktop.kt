package com.prudential.health.core.util

import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import java.util.prefs.Preferences
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

actual class PersistentStorage actual constructor() {
    private val prefs: Preferences = Preferences.userRoot().node("com/prudential/health/console")

    private val sensitiveKeys = setOf(
        StorageKeys.ACCESS_TOKEN,
        StorageKeys.REFRESH_TOKEN,
        StorageKeys.USER_JSON,
    )

    // AES-256 key derived from a stable machine + app seed.
    // Not a substitute for a proper HSM, but prevents casual plaintext reads.
    private val encryptionKey: SecretKeySpec by lazy {
        val seed = "prudential-health-console-v1-" + System.getProperty("user.name", "admin")
        val hash = MessageDigest.getInstance("SHA-256").digest(seed.toByteArray(Charsets.UTF_8))
        SecretKeySpec(hash, "AES")
    }

    private fun encrypt(value: String): String {
        val iv = ByteArray(12).also { SecureRandom().nextBytes(it) }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, encryptionKey, GCMParameterSpec(128, iv))
        val encrypted = cipher.doFinal(value.toByteArray(Charsets.UTF_8))
        return Base64.getEncoder().encodeToString(iv + encrypted)
    }

    private fun decrypt(value: String): String? = try {
        val combined = Base64.getDecoder().decode(value)
        val iv = combined.copyOfRange(0, 12)
        val encrypted = combined.copyOfRange(12, combined.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, encryptionKey, GCMParameterSpec(128, iv))
        String(cipher.doFinal(encrypted), Charsets.UTF_8)
    } catch (_: Exception) {
        null
    }

    actual fun putString(key: String, value: String) {
        val stored = if (key in sensitiveKeys) encrypt(value) else value
        prefs.put(key, stored)
        prefs.flush()
    }

    actual fun getString(key: String): String? {
        val raw = prefs.get(key, null) ?: return null
        return if (key in sensitiveKeys) decrypt(raw) else raw
    }

    actual fun remove(key: String) {
        prefs.remove(key)
        prefs.flush()
    }

    actual fun clear() {
        prefs.clear()
        prefs.flush()
    }
}
