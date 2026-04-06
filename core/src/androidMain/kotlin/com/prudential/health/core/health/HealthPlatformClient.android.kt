package com.prudential.health.core.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.minus
import kotlinx.datetime.plus
import kotlinx.datetime.toLocalDateTime

actual class HealthPlatformClient(private val context: Context) {

    private val client: HealthConnectClient? by lazy {
        runCatching { HealthConnectClient.getOrCreate(context) }.getOrNull()
    }

    private val requiredPermissions = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(DistanceRecord::class),
        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
    )

    actual fun isAvailable(): Boolean =
        HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE

    actual suspend fun hasPermissions(): Boolean {
        val c = client ?: return false
        return runCatching {
            c.permissionController.getGrantedPermissions().containsAll(requiredPermissions)
        }.getOrDefault(false)
    }

    actual suspend fun readToday(): DailyStepData? {
        val c = client ?: return null
        val tz = TimeZone.currentSystemDefault()
        val today = Clock.System.now().toLocalDateTime(tz).date
        return readForDate(c, today, tz)
    }

    actual suspend fun readHistory(days: Int): List<DailyStepData> {
        val c = client ?: return emptyList()
        val tz = TimeZone.currentSystemDefault()
        val today = Clock.System.now().toLocalDateTime(tz).date
        return (0 until days).mapNotNull { offset ->
            val date = today.minus(offset, DateTimeUnit.DAY)
            readForDate(c, date, tz)
        }
    }

    private suspend fun readForDate(
        client: HealthConnectClient,
        date: LocalDate,
        tz: TimeZone,
    ): DailyStepData? = runCatching {
        val startInstant = date.atStartOfDayIn(tz)
        val endInstant = date.plus(1, DateTimeUnit.DAY).atStartOfDayIn(tz)
        val timeRange = TimeRangeFilter.between(
            startInstant.toJavaInstant(),
            endInstant.toJavaInstant(),
        )

        val response = client.aggregate(
            AggregateRequest(
                metrics = setOf(
                    StepsRecord.COUNT_TOTAL,
                    DistanceRecord.DISTANCE_TOTAL,
                    ExerciseSessionRecord.EXERCISE_DURATION_TOTAL,
                ),
                timeRangeFilter = timeRange,
            ),
        )

        val steps = response[StepsRecord.COUNT_TOTAL]?.toInt() ?: 0
        if (steps == 0) return@runCatching null

        val distanceMeters = response[DistanceRecord.DISTANCE_TOTAL]?.inMeters ?: 0.0
        val activeDuration = response[ExerciseSessionRecord.EXERCISE_DURATION_TOTAL]
        val activeMinutes = activeDuration?.toMinutes()?.toInt() ?: (steps / 100)

        DailyStepData(
            date = date,
            steps = steps,
            distanceMeters = distanceMeters,
            activeMinutes = activeMinutes,
        )
    }.getOrNull()
}

private fun kotlinx.datetime.Instant.toJavaInstant(): java.time.Instant =
    java.time.Instant.ofEpochMilli(this.toEpochMilliseconds())
