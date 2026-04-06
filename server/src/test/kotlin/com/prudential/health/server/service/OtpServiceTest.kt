package com.prudential.health.server.service

import com.prudential.health.server.database.OtpTable
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.TimeZone
import kotlinx.datetime.minus
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class OtpServiceTest {

    private lateinit var service: OtpService

    @BeforeTest
    fun setup() {
        val db = Database.connect(
            "jdbc:h2:mem:test_otp;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
            driver = "org.h2.Driver",
        )
        TransactionManager.defaultDatabase = db
        transaction { SchemaUtils.create(OtpTable) }
        service = OtpService()
    }

    @AfterTest
    fun teardown() {
        transaction { SchemaUtils.drop(OtpTable) }
    }

    // ---------------------------------------------------------------
    // 1. generateOtp() returns a 6-digit string
    // ---------------------------------------------------------------
    @Test
    fun `generateOtp returns a 6-digit numeric string`() = runBlocking {
        val otp = service.generateOtp("9876500001")

        assertEquals(6, otp.length, "OTP must be exactly 6 characters long")
        assertTrue(otp.all { it.isDigit() }, "OTP must contain only digits")
        assertTrue(otp.toInt() in 100_000..999_999, "OTP must be between 100000 and 999999")
    }

    @Test
    fun `generateOtp returns different OTPs on successive calls`() = runBlocking {
        // Generate many OTPs and verify at least some differ (non-deterministic, but
        // probability of 10 identical secure-random OTPs is negligible).
        val otps = (1..10).map { service.generateOtp("9876500002") }.toSet()
        assertTrue(otps.size > 1, "Expected at least 2 distinct OTPs from 10 generations")
    }

    // ---------------------------------------------------------------
    // 2. generateOtp() invalidates previous unused OTPs for the same phone
    // ---------------------------------------------------------------
    @Test
    fun `generateOtp invalidates previous unused OTPs for the same phone`() = runBlocking {
        val phone = "9876500010"

        val otp1 = service.generateOtp(phone)
        val otp2 = service.generateOtp(phone)

        // After generating otp2, otp1 should be marked as used
        val unusedOtps = transaction {
            OtpTable.selectAll().where {
                (OtpTable.phone eq phone) and (OtpTable.isUsed eq false)
            }.toList()
        }

        assertEquals(1, unusedOtps.size, "Only the latest OTP should remain unused")
        assertEquals(otp2, unusedOtps.first()[OtpTable.otp], "The unused OTP should be the most recently generated one")
    }

    @Test
    fun `generateOtp does not invalidate OTPs for a different phone`() = runBlocking {
        val phoneA = "9876500011"
        val phoneB = "9876500012"

        service.generateOtp(phoneA)
        service.generateOtp(phoneB)

        val unusedA = transaction {
            OtpTable.selectAll().where {
                (OtpTable.phone eq phoneA) and (OtpTable.isUsed eq false)
            }.count()
        }
        val unusedB = transaction {
            OtpTable.selectAll().where {
                (OtpTable.phone eq phoneB) and (OtpTable.isUsed eq false)
            }.count()
        }

        assertEquals(1L, unusedA, "Phone A should still have its unused OTP")
        assertEquals(1L, unusedB, "Phone B should still have its unused OTP")
    }

    // ---------------------------------------------------------------
    // 3. verifyOtp() returns true for a valid, unexpired OTP
    // ---------------------------------------------------------------
    @Test
    fun `verifyOtp returns true for valid unexpired OTP`() = runBlocking {
        val phone = "9876500020"
        val otp = service.generateOtp(phone)

        val result = service.verifyOtp(phone, otp)

        assertTrue(result, "Verification should succeed for a valid unexpired OTP")
    }

    // ---------------------------------------------------------------
    // 4. verifyOtp() returns false for an expired OTP
    // ---------------------------------------------------------------
    @Test
    fun `verifyOtp returns false for expired OTP`() = runBlocking {
        val phone = "9876500030"
        val otp = service.generateOtp(phone)

        // Manually set expiresAt to the past so it appears expired
        val pastTime = Clock.System.now()
            .minus(10, DateTimeUnit.MINUTE)
            .toLocalDateTime(TimeZone.UTC)

        transaction {
            OtpTable.update({ OtpTable.phone eq phone }) {
                it[expiresAt] = pastTime
            }
        }

        val result = service.verifyOtp(phone, otp)

        assertFalse(result, "Verification should fail for an expired OTP")
    }

    // ---------------------------------------------------------------
    // 5. verifyOtp() returns false for an already-used OTP
    // ---------------------------------------------------------------
    @Test
    fun `verifyOtp returns false for already-used OTP`() = runBlocking {
        val phone = "9876500040"
        val otp = service.generateOtp(phone)

        // First verification uses it
        val first = service.verifyOtp(phone, otp)
        assertTrue(first, "First verification should succeed")

        // Second verification should fail because it is now marked used
        val second = service.verifyOtp(phone, otp)
        assertFalse(second, "Second verification should fail for an already-used OTP")
    }

    // ---------------------------------------------------------------
    // 6. verifyOtp() returns false for a wrong OTP code
    // ---------------------------------------------------------------
    @Test
    fun `verifyOtp returns false for wrong OTP code`() = runBlocking {
        val phone = "9876500050"
        service.generateOtp(phone)

        val result = service.verifyOtp(phone, "000000")

        assertFalse(result, "Verification should fail for an incorrect OTP code")
    }

    @Test
    fun `verifyOtp returns false for correct OTP but wrong phone`() = runBlocking {
        val phone = "9876500051"
        val otp = service.generateOtp(phone)

        val result = service.verifyOtp("0000000000", otp)

        assertFalse(result, "Verification should fail when the phone number does not match")
    }

    @Test
    fun `verifyOtp returns false when no OTP exists for phone`() = runBlocking {
        val result = service.verifyOtp("9876500099", "123456")

        assertFalse(result, "Verification should fail when no OTP exists for the phone")
    }

    // ---------------------------------------------------------------
    // 7. verifyOtp() marks OTP as used after successful verification
    // ---------------------------------------------------------------
    @Test
    fun `verifyOtp marks OTP as used after successful verification`() = runBlocking {
        val phone = "9876500060"
        val otp = service.generateOtp(phone)

        // Before verification the OTP should be unused
        val unusedBefore = transaction {
            OtpTable.selectAll().where {
                (OtpTable.phone eq phone) and (OtpTable.otp eq otp) and (OtpTable.isUsed eq false)
            }.count()
        }
        assertEquals(1L, unusedBefore, "OTP should be unused before verification")

        service.verifyOtp(phone, otp)

        // After verification the OTP should be marked used
        val unusedAfter = transaction {
            OtpTable.selectAll().where {
                (OtpTable.phone eq phone) and (OtpTable.otp eq otp) and (OtpTable.isUsed eq false)
            }.count()
        }
        assertEquals(0L, unusedAfter, "OTP should be marked as used after successful verification")

        val usedAfter = transaction {
            OtpTable.selectAll().where {
                (OtpTable.phone eq phone) and (OtpTable.otp eq otp) and (OtpTable.isUsed eq true)
            }.count()
        }
        assertEquals(1L, usedAfter, "Exactly one used OTP record should exist for the phone")
    }

    @Test
    fun `verifyOtp does not mark OTP as used after failed verification`() = runBlocking {
        val phone = "9876500061"
        val otp = service.generateOtp(phone)

        // Attempt verification with wrong code
        service.verifyOtp(phone, "000000")

        // The real OTP should still be unused
        val unusedAfter = transaction {
            OtpTable.selectAll().where {
                (OtpTable.phone eq phone) and (OtpTable.otp eq otp) and (OtpTable.isUsed eq false)
            }.count()
        }
        assertEquals(1L, unusedAfter, "OTP should remain unused after a failed verification attempt")
    }
}
