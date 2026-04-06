package com.prudential.health.server.service

import com.prudential.health.server.database.HealthConnectionsTable
import com.prudential.health.server.database.StepRecordsTable
import com.prudential.health.server.database.UsersTable
import com.prudential.health.server.model.StepSyncEntry
import com.prudential.health.server.model.StepSyncRequest
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class StepsServiceTest {

    private lateinit var service: StepsService
    private var testUserId: Int = -1

    @BeforeTest
    fun setup() {
        val db = Database.connect(
            "jdbc:h2:mem:test_steps;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
            driver = "org.h2.Driver",
        )
        TransactionManager.defaultDatabase = db
        transaction {
            SchemaUtils.create(UsersTable, StepRecordsTable, HealthConnectionsTable)
        }
        service = StepsService()

        // Insert a test user
        val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        testUserId = transaction {
            UsersTable.insert {
                it[name] = "Test User"
                it[phone] = "9999900000"
                it[email] = "test@example.com"
                it[joinedDate] = LocalDate.parse("2025-01-01")
                it[isProposer] = true
                it[createdAt] = now
                it[updatedAt] = now
            } get UsersTable.id
        }.value
    }

    @AfterTest
    fun teardown() {
        transaction {
            SchemaUtils.drop(StepRecordsTable, HealthConnectionsTable, UsersTable)
        }
    }

    // ---------------------------------------------------------------
    // 1. syncSteps() inserts new records correctly
    // ---------------------------------------------------------------
    @Test
    fun `syncSteps inserts new records correctly`() = runBlocking {
        val request = StepSyncRequest(
            entries = listOf(
                StepSyncEntry(date = "2025-06-01", steps = 8000, distanceKm = 6.4, activeMinutes = 80),
                StepSyncEntry(date = "2025-06-02", steps = 12000, distanceKm = 9.6, activeMinutes = 120),
            ),
        )

        val response = service.syncSteps(testUserId, request)

        assertEquals(2, response.synced, "Both entries should be synced")
        assertEquals(1, response.newHealthyDays, "Only 12000-step entry qualifies as healthy")

        // Verify records exist in the database
        val records = transaction {
            StepRecordsTable.selectAll().where {
                StepRecordsTable.userId eq testUserId
            }.toList()
        }
        assertEquals(2, records.size, "Two records should be persisted")

        val june1 = records.find { it[StepRecordsTable.date] == LocalDate.parse("2025-06-01") }!!
        assertEquals(8000, june1[StepRecordsTable.steps])
        assertEquals(6.4, june1[StepRecordsTable.distanceKm], 0.001)
        assertEquals(80, june1[StepRecordsTable.activeMinutes])
        assertFalse(june1[StepRecordsTable.isHealthyDay], "8000 steps should not be a healthy day")

        val june2 = records.find { it[StepRecordsTable.date] == LocalDate.parse("2025-06-02") }!!
        assertEquals(12000, june2[StepRecordsTable.steps])
        assertTrue(june2[StepRecordsTable.isHealthyDay], "12000 steps should be a healthy day")
    }

    @Test
    fun `syncSteps with exactly 10000 steps marks as healthy day`() = runBlocking {
        val request = StepSyncRequest(
            entries = listOf(
                StepSyncEntry(date = "2025-06-10", steps = 10000, distanceKm = 8.0, activeMinutes = 100),
            ),
        )

        val response = service.syncSteps(testUserId, request)

        assertEquals(1, response.newHealthyDays, "Exactly 10000 steps should count as a healthy day")

        val record = transaction {
            StepRecordsTable.selectAll().where {
                StepRecordsTable.userId eq testUserId
            }.first()
        }
        assertTrue(record[StepRecordsTable.isHealthyDay])
    }

    // ---------------------------------------------------------------
    // 2. syncSteps() upserts existing records (same user + date)
    // ---------------------------------------------------------------
    @Test
    fun `syncSteps upserts existing records for same user and date`() = runBlocking {
        // Insert initial data
        val initial = StepSyncRequest(
            entries = listOf(
                StepSyncEntry(date = "2025-07-01", steps = 5000, distanceKm = 4.0, activeMinutes = 50),
            ),
        )
        service.syncSteps(testUserId, initial)

        // Upsert with updated step count
        val updated = StepSyncRequest(
            entries = listOf(
                StepSyncEntry(date = "2025-07-01", steps = 15000, distanceKm = 12.0, activeMinutes = 150),
            ),
        )
        val response = service.syncSteps(testUserId, updated)

        assertEquals(1, response.synced)

        // Verify only one record exists (upsert, not duplicate insert)
        val records = transaction {
            StepRecordsTable.selectAll().where {
                StepRecordsTable.userId eq testUserId
            }.toList()
        }
        assertEquals(1, records.size, "Upsert should not create a duplicate record")
        assertEquals(15000, records.first()[StepRecordsTable.steps], "Steps should be updated to 15000")
        assertEquals(12.0, records.first()[StepRecordsTable.distanceKm], 0.001)
        assertTrue(records.first()[StepRecordsTable.isHealthyDay], "15000 steps should be a healthy day")
    }

    @Test
    fun `syncSteps upsert changes healthy day status when steps decrease`() = runBlocking {
        // Start with a healthy day
        service.syncSteps(
            testUserId,
            StepSyncRequest(
                entries = listOf(StepSyncEntry(date = "2025-07-05", steps = 12000)),
            ),
        )

        // Upsert with fewer steps
        service.syncSteps(
            testUserId,
            StepSyncRequest(
                entries = listOf(StepSyncEntry(date = "2025-07-05", steps = 3000)),
            ),
        )

        val record = transaction {
            StepRecordsTable.selectAll().where {
                StepRecordsTable.userId eq testUserId
            }.first()
        }
        assertEquals(3000, record[StepRecordsTable.steps])
        assertFalse(record[StepRecordsTable.isHealthyDay], "3000 steps should not be a healthy day")
    }

    // ---------------------------------------------------------------
    // 3. syncSteps() skips invalid entries
    // ---------------------------------------------------------------
    @Test
    fun `syncSteps skips entries with negative steps`() = runBlocking {
        val request = StepSyncRequest(
            entries = listOf(
                StepSyncEntry(date = "2025-08-01", steps = -500, distanceKm = 1.0, activeMinutes = 10),
                StepSyncEntry(date = "2025-08-02", steps = 5000, distanceKm = 4.0, activeMinutes = 50),
            ),
        )

        val response = service.syncSteps(testUserId, request)

        assertEquals(1, response.synced, "Only the valid entry should be synced")

        val count = transaction {
            StepRecordsTable.selectAll().where {
                StepRecordsTable.userId eq testUserId
            }.count()
        }
        assertEquals(1L, count, "Only one record should be inserted")
    }

    @Test
    fun `syncSteps skips entries with negative distance`() = runBlocking {
        val request = StepSyncRequest(
            entries = listOf(
                StepSyncEntry(date = "2025-08-03", steps = 5000, distanceKm = -2.0, activeMinutes = 50),
            ),
        )

        val response = service.syncSteps(testUserId, request)

        assertEquals(0, response.synced, "Entry with negative distance should be skipped")
    }

    @Test
    fun `syncSteps skips entries with negative active minutes`() = runBlocking {
        val request = StepSyncRequest(
            entries = listOf(
                StepSyncEntry(date = "2025-08-04", steps = 5000, distanceKm = 4.0, activeMinutes = -30),
            ),
        )

        val response = service.syncSteps(testUserId, request)

        assertEquals(0, response.synced, "Entry with negative active minutes should be skipped")
    }

    @Test
    fun `syncSteps skips entries with malformed date strings`() = runBlocking {
        val request = StepSyncRequest(
            entries = listOf(
                StepSyncEntry(date = "not-a-date", steps = 5000),
                StepSyncEntry(date = "2025/08/05", steps = 5000),
                StepSyncEntry(date = "08-05-2025", steps = 5000),
                StepSyncEntry(date = "", steps = 5000),
                StepSyncEntry(date = "2025-08-06", steps = 5000), // valid
            ),
        )

        val response = service.syncSteps(testUserId, request)

        assertEquals(1, response.synced, "Only the entry with a valid YYYY-MM-DD date should be synced")
    }

    @Test
    fun `syncSteps with all invalid entries returns zero synced`() = runBlocking {
        val request = StepSyncRequest(
            entries = listOf(
                StepSyncEntry(date = "2025-08-10", steps = -1),
                StepSyncEntry(date = "bad-date", steps = 100),
            ),
        )

        val response = service.syncSteps(testUserId, request)

        assertEquals(0, response.synced)
        assertEquals(0, response.newHealthyDays)
    }

    @Test
    fun `syncSteps with empty entries list returns zero synced`() = runBlocking {
        val request = StepSyncRequest(entries = emptyList())

        val response = service.syncSteps(testUserId, request)

        assertEquals(0, response.synced)
        assertEquals(0, response.newHealthyDays)
        assertEquals(0, response.totalHealthyDays)
    }

    // ---------------------------------------------------------------
    // 4. syncSteps() correctly counts healthy days (>=10000 steps)
    // ---------------------------------------------------------------
    @Test
    fun `syncSteps correctly counts healthy days`() = runBlocking {
        val request = StepSyncRequest(
            entries = listOf(
                StepSyncEntry(date = "2025-09-01", steps = 10000),  // healthy
                StepSyncEntry(date = "2025-09-02", steps = 9999),   // NOT healthy
                StepSyncEntry(date = "2025-09-03", steps = 15000),  // healthy
                StepSyncEntry(date = "2025-09-04", steps = 100),    // NOT healthy
                StepSyncEntry(date = "2025-09-05", steps = 10001),  // healthy
            ),
        )

        val response = service.syncSteps(testUserId, request)

        assertEquals(5, response.synced)
        assertEquals(3, response.newHealthyDays, "Entries with >= 10000 steps should be healthy days")
        assertEquals(3, response.totalHealthyDays, "Total healthy days should match for a fresh user")
    }

    @Test
    fun `syncSteps totalHealthyDays accumulates across multiple syncs`() = runBlocking {
        // First sync: 1 healthy day
        service.syncSteps(
            testUserId,
            StepSyncRequest(
                entries = listOf(StepSyncEntry(date = "2025-09-10", steps = 10000)),
            ),
        )

        // Second sync: 2 more healthy days
        val response = service.syncSteps(
            testUserId,
            StepSyncRequest(
                entries = listOf(
                    StepSyncEntry(date = "2025-09-11", steps = 12000),
                    StepSyncEntry(date = "2025-09-12", steps = 11000),
                ),
            ),
        )

        assertEquals(2, response.newHealthyDays, "New healthy days in this batch")
        assertEquals(3, response.totalHealthyDays, "Total should include all prior healthy days")
    }

    // ---------------------------------------------------------------
    // 5. getTodaySteps() returns correct totals
    // ---------------------------------------------------------------
    @Test
    fun `getTodaySteps returns correct totals for user with records`() = runBlocking {
        // Seed some step records
        service.syncSteps(
            testUserId,
            StepSyncRequest(
                entries = listOf(
                    StepSyncEntry(date = "2025-10-01", steps = 8000, distanceKm = 6.4, activeMinutes = 80),
                    StepSyncEntry(date = "2025-10-02", steps = 12000, distanceKm = 9.6, activeMinutes = 120),
                    StepSyncEntry(date = "2025-10-03", steps = 10000, distanceKm = 8.0, activeMinutes = 100),
                ),
            ),
        )

        val result = service.getTodaySteps(testUserId)

        // "today" is the most recent record by date (DESC). That's 2025-10-03.
        assertEquals(10000, result.stepsToday, "stepsToday should be from the most recent record")
        assertEquals(10_000, result.goalSteps)

        // Total healthy days: 12000 and 10000 qualify -> 2
        assertEquals(2, result.totalHealthyDays)

        // Total distance: 6.4 + 9.6 + 8.0 = 24.0
        assertEquals(24.0, result.totalActiveDistance, 0.1)

        // Total minutes: 80 + 120 + 100 = 300
        assertEquals(300, result.totalActiveTimeMinutes)
    }

    @Test
    fun `getTodaySteps returns zeroes for user with no records`() = runBlocking {
        val result = service.getTodaySteps(testUserId)

        assertEquals(0, result.stepsToday)
        assertEquals(10_000, result.goalSteps)
        assertEquals(0, result.totalHealthyDays)
        assertEquals(0.0, result.totalActiveDistance, 0.01)
        assertEquals(0, result.totalActiveTimeMinutes)
    }

    @Test
    fun `getTodaySteps uses most recent date as today`() = runBlocking {
        service.syncSteps(
            testUserId,
            StepSyncRequest(
                entries = listOf(
                    StepSyncEntry(date = "2025-10-10", steps = 3000),
                    StepSyncEntry(date = "2025-10-15", steps = 7777),
                    StepSyncEntry(date = "2025-10-12", steps = 5000),
                ),
            ),
        )

        val result = service.getTodaySteps(testUserId)

        // Records are ordered by date DESC; 2025-10-15 is the most recent
        assertEquals(7777, result.stepsToday)
    }

    // ---------------------------------------------------------------
    // 6. getHealthJourneyMilestones() returns correct milestone progress
    // ---------------------------------------------------------------
    @Test
    fun `getHealthJourneyMilestones with zero healthy days`() = runBlocking {
        val milestones = service.getHealthJourneyMilestones(testUserId)

        assertEquals(3, milestones.size, "Should return 3 milestones")

        // First milestone: 75 days / 5%
        val m1 = milestones[0]
        assertEquals(75, m1.targetDays)
        assertEquals(5, m1.discountPercent)
        assertEquals(0, m1.currentDays)
        assertFalse(m1.isAchieved)
        assertEquals(0.0, m1.progressPercent, 0.01)

        // Second milestone: 125 days / 10%
        val m2 = milestones[1]
        assertEquals(125, m2.targetDays)
        assertEquals(10, m2.discountPercent)
        assertFalse(m2.isAchieved)

        // Third milestone: 150 days / 15%
        val m3 = milestones[2]
        assertEquals(150, m3.targetDays)
        assertEquals(15, m3.discountPercent)
        assertFalse(m3.isAchieved)
    }

    @Test
    fun `getHealthJourneyMilestones with partial progress`() = runBlocking {
        // Insert 50 healthy days
        val entries = (1..50).map { day ->
            val dateStr = "2025-%02d-%02d".format((day - 1) / 28 + 1, (day - 1) % 28 + 1)
            StepSyncEntry(date = dateStr, steps = 10000)
        }
        service.syncSteps(testUserId, StepSyncRequest(entries = entries))

        val milestones = service.getHealthJourneyMilestones(testUserId)

        milestones.forEach { m ->
            assertEquals(50, m.currentDays)
            assertFalse(m.isAchieved, "50 days should not achieve any milestone")
        }

        // Check progress percent for first milestone (75 days)
        val expected = 50.0 / 75.0 * 100.0
        assertEquals(expected, milestones[0].progressPercent, 0.1)
    }

    @Test
    fun `getHealthJourneyMilestones with first milestone achieved`() = runBlocking {
        // Insert exactly 75 healthy days
        val entries = (1..75).map { day ->
            val month = (day - 1) / 28 + 1
            val dayOfMonth = (day - 1) % 28 + 1
            StepSyncEntry(date = "2025-%02d-%02d".format(month, dayOfMonth), steps = 11000)
        }
        service.syncSteps(testUserId, StepSyncRequest(entries = entries))

        val milestones = service.getHealthJourneyMilestones(testUserId)

        assertTrue(milestones[0].isAchieved, "75-day milestone should be achieved")
        assertEquals(100.0, milestones[0].progressPercent, 0.01)

        assertFalse(milestones[1].isAchieved, "125-day milestone should not be achieved")
        assertFalse(milestones[2].isAchieved, "150-day milestone should not be achieved")
    }

    @Test
    fun `getHealthJourneyMilestones with all milestones achieved`() = runBlocking {
        // Insert 160 healthy days (exceeds all milestones)
        val entries = (1..160).map { day ->
            val month = (day - 1) / 28 + 1
            val dayOfMonth = (day - 1) % 28 + 1
            StepSyncEntry(date = "2025-%02d-%02d".format(month, dayOfMonth), steps = 10000)
        }
        service.syncSteps(testUserId, StepSyncRequest(entries = entries))

        val milestones = service.getHealthJourneyMilestones(testUserId)

        milestones.forEach { m ->
            assertTrue(m.isAchieved, "All milestones should be achieved with 160 healthy days")
            assertEquals(100.0, m.progressPercent, 0.01, "Progress should be capped at 100%")
            assertEquals(160, m.currentDays)
        }
    }

    @Test
    fun `getHealthJourneyMilestones only counts healthy days not all records`() = runBlocking {
        // Mix of healthy and non-healthy days
        val entries = listOf(
            StepSyncEntry(date = "2025-01-01", steps = 10000),  // healthy
            StepSyncEntry(date = "2025-01-02", steps = 5000),   // NOT healthy
            StepSyncEntry(date = "2025-01-03", steps = 15000),  // healthy
            StepSyncEntry(date = "2025-01-04", steps = 2000),   // NOT healthy
            StepSyncEntry(date = "2025-01-05", steps = 10001),  // healthy
        )
        service.syncSteps(testUserId, StepSyncRequest(entries = entries))

        val milestones = service.getHealthJourneyMilestones(testUserId)

        assertEquals(3, milestones[0].currentDays, "Only 3 out of 5 records are healthy days")
    }
}
