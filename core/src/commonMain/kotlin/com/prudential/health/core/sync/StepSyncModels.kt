package com.prudential.health.core.sync

import kotlinx.serialization.Serializable

@Serializable
data class StepSyncEntry(
    val date: String,             // YYYY-MM-DD
    val steps: Int,
    val distanceKm: Double = 0.0,
    val activeMinutes: Int = 0,
)

@Serializable
data class StepSyncRequest(val entries: List<StepSyncEntry>)

@Serializable
data class StepSyncResponse(
    val synced: Int,
    val newHealthyDays: Int,
    val totalHealthyDays: Int,
)

@Serializable
data class StepQueue(val entries: List<StepSyncEntry> = emptyList())

enum class SyncStatus {
    IDLE,     // No pending entries, nothing to sync
    PENDING,  // Entries queued, waiting for connectivity
    SYNCING,  // Network call in progress
    SUCCESS,  // Last sync completed successfully
    ERROR,    // Last sync failed, entries still queued
}
