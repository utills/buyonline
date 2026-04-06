package com.prudential.health.server.service

import com.prudential.health.server.database.*
import com.prudential.health.server.database.DatabaseFactory.dbQuery
import com.prudential.health.server.model.*
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.upsert

class StepsService {

    suspend fun getTodaySteps(userId: Int): StepDataDto = dbQuery {
        val records = StepRecordsTable.selectAll()
            .where { StepRecordsTable.userId eq userId }
            .orderBy(StepRecordsTable.date, SortOrder.DESC)
            .toList()

        val today = records.firstOrNull()
        val totalHealthyDays = records.count { it[StepRecordsTable.isHealthyDay] }
        val totalDistance = records.sumOf { it[StepRecordsTable.distanceKm] }
        val totalMinutes = records.sumOf { it[StepRecordsTable.activeMinutes] }

        StepDataDto(
            stepsToday = today?.get(StepRecordsTable.steps) ?: 0,
            goalSteps = 10_000,
            totalActiveDistance = Math.round(totalDistance * 10.0) / 10.0,
            totalActiveTimeMinutes = totalMinutes,
            totalHealthyDays = totalHealthyDays,
        )
    }

    suspend fun getSummary(userId: Int, period: String): StepSummaryDto = dbQuery {
        val records = StepRecordsTable.selectAll()
            .where { StepRecordsTable.userId eq userId }
            .orderBy(StepRecordsTable.date, SortOrder.ASC)
            .toList()

        when (period) {
            "weekly" -> buildWeeklySummary(records)
            "monthly" -> buildMonthlySummary(records)
            "yearly" -> buildYearlySummary(records)
            else -> buildWeeklySummary(records)
        }
    }

    suspend fun connectPlatform(userId: Int, platform: String) = dbQuery {
        val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        // Disconnect all other platforms for this user
        HealthConnectionsTable.update({
            (HealthConnectionsTable.userId eq userId) and (HealthConnectionsTable.isConnected eq true)
        }) { it[isConnected] = false }

        // Upsert: update existing row if present, otherwise insert
        val updated = HealthConnectionsTable.update({
            (HealthConnectionsTable.userId eq userId) and (HealthConnectionsTable.platform eq platform)
        }) {
            it[isConnected] = true
            it[connectedAt] = now
        }
        if (updated == 0) {
            HealthConnectionsTable.insert {
                it[this.userId] = userId
                it[this.platform] = platform
                it[isConnected] = true
                it[connectedAt] = now
            }
        }
    }

    suspend fun syncSteps(userId: Int, request: StepSyncRequest): StepSyncResponse = dbQuery {
        val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        var synced = 0
        var newHealthyDays = 0
        val goal = 10_000
        val dateRegex = Regex("""\d{4}-\d{2}-\d{2}""")

        request.entries.forEach { entry ->
            // Skip invalid entries
            if (entry.steps < 0 || entry.distanceKm < 0.0 || entry.activeMinutes < 0) return@forEach
            if (!dateRegex.matches(entry.date)) return@forEach

            val isHealthy = entry.steps >= goal

            // Atomic upsert — eliminates check-then-act race condition
            StepRecordsTable.upsert(
                keys = arrayOf(StepRecordsTable.userId, StepRecordsTable.date),
            ) {
                it[StepRecordsTable.userId] = userId
                it[date] = LocalDate.parse(entry.date)
                it[steps] = entry.steps
                it[distanceKm] = entry.distanceKm
                it[activeMinutes] = entry.activeMinutes
                it[isHealthyDay] = isHealthy
                it[createdAt] = now
            }

            synced++
            if (isHealthy) newHealthyDays++
        }

        val totalHealthyDays = StepRecordsTable.selectAll().where {
            (StepRecordsTable.userId eq userId) and (StepRecordsTable.isHealthyDay eq true)
        }.count().toInt()

        StepSyncResponse(synced = synced, newHealthyDays = newHealthyDays, totalHealthyDays = totalHealthyDays)
    }

    suspend fun getHealthJourneyMilestones(userId: Int): List<HealthMilestoneDto> = dbQuery {
        val totalHealthyDays = StepRecordsTable.selectAll().where {
            (StepRecordsTable.userId eq userId) and (StepRecordsTable.isHealthyDay eq true)
        }.count().toInt()

        data class MilestoneDef(val targetDays: Int, val discountPercent: Int)
        val milestones = listOf(
            MilestoneDef(75, 5),
            MilestoneDef(125, 10),
            MilestoneDef(150, 15),
        )
        milestones.map { m ->
            HealthMilestoneDto(
                targetDays = m.targetDays,
                discountPercent = m.discountPercent,
                currentDays = totalHealthyDays,
                isAchieved = totalHealthyDays >= m.targetDays,
                progressPercent = (totalHealthyDays.toDouble() / m.targetDays * 100).coerceAtMost(100.0),
            )
        }
    }

    suspend fun disconnectPlatform(userId: Int) = dbQuery {
        HealthConnectionsTable.update({
            (HealthConnectionsTable.userId eq userId) and (HealthConnectionsTable.isConnected eq true)
        }) { it[isConnected] = false }
    }

    suspend fun getConnectedPlatform(userId: Int): String? = dbQuery {
        HealthConnectionsTable.selectAll().where {
            (HealthConnectionsTable.userId eq userId) and (HealthConnectionsTable.isConnected eq true)
        }.firstOrNull()?.get(HealthConnectionsTable.platform)
    }

    private fun buildWeeklySummary(records: List<ResultRow>): StepSummaryDto {
        val dayNames = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
        val last7 = records.takeLast(7)
        val entries = last7.mapIndexed { i, row ->
            val date = row[StepRecordsTable.date].toString()
            val label = try {
                val dow = dayOfWeek(date)
                dayNames.getOrElse(dow - 1) { "D${i + 1}" }
            } catch (_: Exception) { dayNames.getOrElse(i) { "D${i + 1}" } }

            StepSummaryEntryDto(
                label = label,
                steps = row[StepRecordsTable.steps],
                healthyDays = if (row[StepRecordsTable.isHealthyDay]) 1 else 0,
                date = date,
            )
        }
        return StepSummaryDto(entries = entries, totalHealthyDays = entries.sumOf { it.healthyDays }, period = "weekly")
    }

    private fun buildMonthlySummary(records: List<ResultRow>): StepSummaryDto {
        val weeks = records.chunked(7)
        val entries = weeks.mapIndexed { i, week ->
            StepSummaryEntryDto(
                label = "W${i + 1}",
                steps = if (week.isNotEmpty()) (week.sumOf { it[StepRecordsTable.steps].toLong() } / week.size).toInt() else 0,
                healthyDays = week.count { it[StepRecordsTable.isHealthyDay] },
                date = week.firstOrNull()?.get(StepRecordsTable.date)?.toString() ?: "",
            )
        }
        return StepSummaryDto(entries = entries, totalHealthyDays = entries.sumOf { it.healthyDays }, period = "monthly")
    }

    private fun buildYearlySummary(records: List<ResultRow>): StepSummaryDto {
        val monthLabels = listOf("J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D")
        val byMonth = records.groupBy {
            it[StepRecordsTable.date].monthNumber
        }
        val entries = (1..12).map { month ->
            val recs = byMonth[month] ?: emptyList()
            StepSummaryEntryDto(
                label = monthLabels[month - 1],
                steps = if (recs.isNotEmpty()) (recs.sumOf { it[StepRecordsTable.steps].toLong() } / recs.size).toInt() else 0,
                healthyDays = recs.count { it[StepRecordsTable.isHealthyDay] },
                date = "",
            )
        }
        return StepSummaryDto(entries = entries, totalHealthyDays = entries.sumOf { it.healthyDays }, period = "yearly")
    }

    private fun dayOfWeek(date: String): Int {
        return LocalDate.parse(date).dayOfWeek.value // 1=Monday, 7=Sunday
    }
}
