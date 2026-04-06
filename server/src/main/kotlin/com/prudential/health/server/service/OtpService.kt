package com.prudential.health.server.service

import com.prudential.health.server.database.DatabaseFactory.dbQuery
import com.prudential.health.server.database.OtpTable
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.Instant
import kotlinx.datetime.TimeZone
import kotlinx.datetime.minus
import kotlinx.datetime.plus
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.count
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import java.util.concurrent.ConcurrentHashMap

class OtpService {

    // Dev passkey: only active when DEV_OTP env var is set (never set in production)
    private val devPasskey: String? = System.getenv("DEV_OTP")

    // Whitelisted phone numbers that always use a static OTP and never receive SMS.
    // Configured via WHITELISTED_PHONES (comma-separated) and WHITELIST_OTP env vars.
    // Defaults include the standard dev test numbers; override in production as needed.
    private val whitelistOtp: String = System.getenv("WHITELIST_OTP") ?: "123456"
    private val whitelistedPhones: Set<String> = run {
        val fromEnv = System.getenv("WHITELISTED_PHONES")
        if (fromEnv != null) {
            fromEnv.split(",").map { it.trim() }.filter { it.isNotEmpty() }.toSet()
        } else {
            setOf("9031570222", "9455068676")
        }
    }

    fun isWhitelisted(phone: String): Boolean = phone in whitelistedPhones

    // In-memory counter for failed OTP verify attempts.
    // Key: phone, Value: (failureCount, windowStart)
    private val failedVerifyAttempts = ConcurrentHashMap<String, Pair<Int, Instant>>()
    private val maxVerifyAttempts = 5
    private val verifyLockoutSeconds = 15 * 60 // 15 minutes

    suspend fun isRateLimited(phone: String): Boolean {
        // Whitelisted phones are never rate-limited for sends
        if (isWhitelisted(phone)) return false
        return dbQuery {
            val oneHourAgo = Clock.System.now()
                .minus(60, DateTimeUnit.MINUTE, TimeZone.UTC)
                .toLocalDateTime(TimeZone.UTC)
            val count = OtpTable.selectAll()
                .where { (OtpTable.phone eq phone) and (OtpTable.createdAt greaterEq oneHourAgo) }
                .count()
            count >= 5
        }
    }

    /** Returns true if this phone has exceeded the OTP verify failure threshold. */
    fun isVerifyRateLimited(phone: String): Boolean {
        if (isWhitelisted(phone)) return false
        val (count, since) = failedVerifyAttempts[phone] ?: return false
        val windowExpiry = since.plus(verifyLockoutSeconds, DateTimeUnit.SECOND, TimeZone.UTC)
        return if (Clock.System.now() > windowExpiry) {
            failedVerifyAttempts.remove(phone)
            false
        } else {
            count >= maxVerifyAttempts
        }
    }

    /** Record a failed OTP verification attempt for rate-limiting purposes. */
    fun recordFailedVerify(phone: String) {
        if (isWhitelisted(phone)) return
        val now = Clock.System.now()
        val current = failedVerifyAttempts[phone]
        if (current == null) {
            failedVerifyAttempts[phone] = Pair(1, now)
        } else {
            val (count, since) = current
            val windowExpiry = since.plus(verifyLockoutSeconds, DateTimeUnit.SECOND, TimeZone.UTC)
            if (now > windowExpiry) {
                failedVerifyAttempts[phone] = Pair(1, now)
            } else {
                failedVerifyAttempts[phone] = Pair(count + 1, since)
            }
        }
    }

    /** Clear the failed-verify counter on a successful verification. */
    fun clearVerifyAttempts(phone: String) {
        failedVerifyAttempts.remove(phone)
    }

    suspend fun generateOtp(phone: String): String {
        // Whitelisted phones always get the static OTP — no randomness, no real SMS needed
        val otp = if (isWhitelisted(phone)) whitelistOtp
                  else "%06d".format(java.security.SecureRandom().nextInt(900000) + 100000)
        val now = Clock.System.now()
        val expiresAt = now.plus(3, DateTimeUnit.MINUTE)
            .toLocalDateTime(TimeZone.UTC)

        dbQuery {
            // Invalidate all existing unused OTPs for this phone
            OtpTable.update({ (OtpTable.phone eq phone) and (OtpTable.isUsed eq false) }) {
                it[isUsed] = true
            }

            OtpTable.insert {
                it[this.phone] = phone
                it[this.otp] = otp
                it[this.expiresAt] = expiresAt
                it[isUsed] = false
            }
        }
        return otp
    }

    suspend fun verifyOtp(phone: String, otp: String): Boolean {
        // Global dev passkey (env-var gated, never set in production)
        if (devPasskey != null && otp == devPasskey) return true
        // Whitelisted number + static OTP — short-circuit without DB lookup
        if (isWhitelisted(phone) && otp == whitelistOtp) return true
        return dbQuery {
            val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)
            // Atomic UPDATE: only one concurrent request can match and consume the OTP row.
            // Returns 0 if already used/expired/not found, 1 on success.
            val updatedRows = OtpTable.update({
                (OtpTable.phone eq phone) and
                    (OtpTable.otp eq otp) and
                    (OtpTable.isUsed eq false) and
                    (OtpTable.expiresAt greater now)
            }) {
                it[isUsed] = true
            }
            updatedRows > 0
        }
    }
}
