package com.prudential.health.core.health

actual class HealthPlatformClient {
    actual fun isAvailable(): Boolean = false
    actual suspend fun hasPermissions(): Boolean = false
    actual suspend fun readToday(): DailyStepData? = null
    actual suspend fun readHistory(days: Int): List<DailyStepData> = emptyList()
}
