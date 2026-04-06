package com.prudential.health.core.util

import kotlinx.cinterop.BetaInteropApi
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.ObjCObjectVar
import kotlinx.cinterop.alloc
import kotlinx.cinterop.memScoped
import kotlinx.cinterop.ptr
import kotlinx.cinterop.reinterpret
import kotlinx.cinterop.value
import platform.Foundation.NSData
import platform.Foundation.NSString
import platform.Foundation.NSUTF8StringEncoding
import platform.Foundation.NSUserDefaults
import platform.Foundation.create
import platform.Foundation.dataUsingEncoding
import platform.Security.SecItemAdd
import platform.Security.SecItemCopyMatching
import platform.Security.SecItemDelete
import platform.Security.errSecSuccess
import platform.Security.kSecAttrAccount
import platform.Security.kSecAttrService
import platform.Security.kSecClass
import platform.Security.kSecClassGenericPassword
import platform.Security.kSecMatchLimit
import platform.Security.kSecMatchLimitOne
import platform.Security.kSecReturnData
import platform.Security.kSecValueData
import platform.CoreFoundation.CFDictionaryRef

private const val KEYCHAIN_SERVICE = "com.prudential.health"

actual class PersistentStorage {
    private val defaults = NSUserDefaults.standardUserDefaults

    private val sensitiveKeys = setOf(
        StorageKeys.ACCESS_TOKEN,
        StorageKeys.REFRESH_TOKEN,
        StorageKeys.USER_JSON,
        StorageKeys.POLICY_JSON,
        StorageKeys.CONNECTED_PLATFORM,
    )

    actual fun putString(key: String, value: String) {
        if (key in sensitiveKeys) {
            saveToKeychain(key, value)
        } else {
            defaults.setObject(value, forKey = key)
        }
    }

    actual fun getString(key: String): String? {
        return if (key in sensitiveKeys) {
            getFromKeychain(key)
        } else {
            defaults.stringForKey(key)
        }
    }

    actual fun remove(key: String) {
        if (key in sensitiveKeys) {
            deleteFromKeychain(key)
        } else {
            defaults.removeObjectForKey(key)
        }
    }

    actual fun clear() {
        sensitiveKeys.forEach { deleteFromKeychain(it) }
        defaults.removePersistentDomainForName(KEYCHAIN_SERVICE)
    }

    // ── Keychain helpers ────────────────────────────────────────────────

    @OptIn(ExperimentalForeignApi::class)
    private fun keychainQuery(key: String): Map<Any?, Any?> = mapOf(
        kSecClass to kSecClassGenericPassword,
        kSecAttrService to KEYCHAIN_SERVICE,
        kSecAttrAccount to key,
    )

    @OptIn(ExperimentalForeignApi::class)
    private fun saveToKeychain(key: String, value: String) {
        // Always delete first to avoid errSecDuplicateItem
        deleteFromKeychain(key)

        val data = (value as NSString).dataUsingEncoding(NSUTF8StringEncoding) ?: return
        val query = keychainQuery(key) + mapOf<Any?, Any?>(kSecValueData to data)

        @Suppress("UNCHECKED_CAST")
        SecItemAdd(query as CFDictionaryRef, null)
    }

    @OptIn(ExperimentalForeignApi::class, BetaInteropApi::class)
    private fun getFromKeychain(key: String): String? {
        val query = keychainQuery(key) + mapOf<Any?, Any?>(
            kSecReturnData to true,
            kSecMatchLimit to kSecMatchLimitOne,
        )

        memScoped {
            val result = alloc<ObjCObjectVar<Any?>>()

            @Suppress("UNCHECKED_CAST")
            val status = SecItemCopyMatching(query as CFDictionaryRef, result.ptr.reinterpret())

            if (status == errSecSuccess) {
                val data = result.value as? NSData ?: return null
                return NSString.create(data = data, encoding = NSUTF8StringEncoding) as? String
            }
        }
        return null
    }

    @OptIn(ExperimentalForeignApi::class)
    private fun deleteFromKeychain(key: String) {
        @Suppress("UNCHECKED_CAST")
        SecItemDelete(keychainQuery(key) as CFDictionaryRef)
    }
}
