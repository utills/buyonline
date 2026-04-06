package com.prudential.health.server.service

import com.prudential.health.server.database.SessionsTable
import com.prudential.health.server.database.UsersTable
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlin.time.Duration.Companion.hours
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

class SessionServiceTest {
    private lateinit var service: SessionService
    private var testUserId: Int = 0

    @BeforeTest
    fun setup() {
        val db = Database.connect(
            "jdbc:h2:mem:test_session;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
            driver = "org.h2.Driver",
        )
        TransactionManager.defaultDatabase = db
        transaction { SchemaUtils.create(UsersTable, SessionsTable) }
        val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        testUserId = transaction {
            UsersTable.insert {
                it[name] = "Session Test User"
                it[phone] = "9999200000"
                it[email] = "session@test.com"
                it[joinedDate] = LocalDate.parse("2026-01-01")
                it[isProposer] = false
                it[createdAt] = now
                it[updatedAt] = now
            } get UsersTable.id
        }.value
        service = SessionService()
    }

    @AfterTest
    fun teardown() {
        transaction { SchemaUtils.drop(SessionsTable, UsersTable) }
    }

    @Test
    fun `createSession stores and isSessionActive returns true`() = runBlocking {
        val expiresAt = Clock.System.now().plus(1.hours).toEpochMilliseconds()
        service.createSession(testUserId, "tok123", "ref456", expiresAt)
        assertTrue(service.isSessionActive("tok123"))
    }

    @Test
    fun `isSessionActive returns false for unknown token`() = runBlocking {
        assertFalse(service.isSessionActive("nonexistent"))
    }

    @Test
    fun `invalidateSession makes token inactive`() = runBlocking {
        val expiresAt = Clock.System.now().plus(1.hours).toEpochMilliseconds()
        service.createSession(testUserId, "tok789", "ref000", expiresAt)
        service.invalidateSession("tok789")
        assertFalse(service.isSessionActive("tok789"))
    }

    @Test
    fun `isSessionActive returns false after invalidateAllUserSessions`() = runBlocking {
        val expiresAt = Clock.System.now().plus(1.hours).toEpochMilliseconds()
        service.createSession(testUserId, "tok_all1", "ref_all1", expiresAt)
        service.createSession(testUserId, "tok_all2", "ref_all2", expiresAt)
        service.invalidateAllUserSessions(testUserId)
        assertFalse(service.isSessionActive("tok_all1"))
        assertFalse(service.isSessionActive("tok_all2"))
    }

    @Test
    fun `listActiveSessions returns only active sessions for user`() = runBlocking {
        val expiresAt = Clock.System.now().plus(1.hours).toEpochMilliseconds()
        service.createSession(testUserId, "tok_active", "ref_active", expiresAt, "device-A")
        service.createSession(testUserId, "tok_inactive", "ref_inactive", expiresAt, "device-B")
        service.invalidateSession("tok_inactive")

        val sessions = service.listActiveSessions(testUserId)
        assertTrue(sessions.size == 1)
        assertEquals("device-A", sessions.first().deviceId)
    }
}
