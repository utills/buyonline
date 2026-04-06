package com.prudential.health.server.model

import kotlinx.serialization.Serializable

@Serializable
data class StepSyncRequest(
    val entries: List<StepSyncEntry>,
)

@Serializable
data class StepSyncEntry(
    val date: String, // YYYY-MM-DD
    val steps: Int,
    val distanceKm: Double = 0.0,
    val activeMinutes: Int = 0,
)

@Serializable
data class StepSyncResponse(
    val synced: Int,
    val newHealthyDays: Int,
    val totalHealthyDays: Int,
)
