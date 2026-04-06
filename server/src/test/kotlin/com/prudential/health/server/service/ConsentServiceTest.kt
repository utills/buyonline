package com.prudential.health.server.service

import com.prudential.health.server.database.UserConsentsTable
import com.prudential.health.server.database.UsersTable
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ConsentServiceTest {
    private lateinit var service: ConsentService
    private var testUserId: Int = 0

    @BeforeTest
    fun setup() {
        val db = Database.connect(
            "jdbc:h2:mem:test_consent;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
            driver = "org.h2.Driver",
        )
        TransactionManager.defaultDatabase = db
        transaction { SchemaUtils.create(UsersTable, UserConsentsTable) }
        val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        testUserId = transaction {
            UsersTable.insert {
                it[name] = "Consent Test User"
                it[phone] = "9999100000"
                it[email] = "consent@test.com"
                it[joinedDate] = LocalDate.parse("2026-01-01")
                it[isProposer] = false
                it[createdAt] = now
                it[updatedAt] = now
            } get UsersTable.id
        }.value
        service = ConsentService()
    }

    @AfterTest
    fun teardown() {
        transaction { SchemaUtils.drop(UserConsentsTable, UsersTable) }
    }

    @Test
    fun `recordConsent stores acceptance and getUserConsents returns it`() = runBlocking {
        service.recordConsent(testUserId, "data_processing", true)
        val consents = service.getUserConsents(testUserId)
        assertEquals(1, consents.size)
        assertTrue(consents.first().isAccepted)
        assertEquals("data_processing", consents.first().consentType)
    }

    @Test
    fun `hasRequiredConsents returns false when not all accepted`() = runBlocking {
        service.recordConsent(testUserId, "data_processing", true)
        assertFalse(service.hasRequiredConsents(testUserId))
    }

    @Test
    fun `hasRequiredConsents returns true when all required types accepted`() = runBlocking {
        ConsentService.REQUIRED_CONSENT_TYPES.forEach { type ->
            service.recordConsent(testUserId, type, true)
        }
        assertTrue(service.hasRequiredConsents(testUserId))
    }

    @Test
    fun `recordConsent upserts - second call overwrites first`() = runBlocking {
        service.recordConsent(testUserId, "data_processing", true)
        service.recordConsent(testUserId, "data_processing", false)
        val consents = service.getUserConsents(testUserId)
        assertEquals(1, consents.size)
        assertFalse(consents.first().isAccepted)
    }

    @Test
    fun `hasRequiredConsents returns false when one revoked`() = runBlocking {
        ConsentService.REQUIRED_CONSENT_TYPES.forEach { type ->
            service.recordConsent(testUserId, type, true)
        }
        service.recordConsent(testUserId, ConsentService.REQUIRED_CONSENT_TYPES.first(), false)
        assertFalse(service.hasRequiredConsents(testUserId))
    }
}
