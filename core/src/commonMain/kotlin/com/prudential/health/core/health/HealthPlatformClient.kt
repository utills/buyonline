package com.prudential.health.core.health

import kotlinx.datetime.LocalDate

data class DailyStepData(
    val date: LocalDate,
    val steps: Int,
    val distanceMeters: Double,
    val activeMinutes: Int,
)

expect class HealthPlatformClient {
    /** True if Health Connect (Android) / HealthKit (iOS) is available on this device. */
    fun isAvailable(): Boolean
    /** True if all required read permissions are granted. */
    suspend fun hasPermissions(): Boolean
    /** Read today's aggregated steps, distance, and active time. Returns null if no data. */
    suspend fun readToday(): DailyStepData?
    /** Read step data for [days] past days (including today). */
    suspend fun readHistory(days: Int): List<DailyStepData>
}
