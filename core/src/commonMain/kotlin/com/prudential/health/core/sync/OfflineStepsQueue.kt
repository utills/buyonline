package com.prudential.health.core.sync

import com.prudential.health.core.util.PersistentStorage
import com.prudential.health.core.util.StorageKeys
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Thread-safe persistent queue for step sync entries.
 * Backed by PersistentStorage so entries survive app restarts.
 * Entries are keyed by date — enqueueing the same date overwrites the previous entry,
 * so only the latest reading for each day is ever synced.
 */
class OfflineStepsQueue(private val storage: PersistentStorage) {

    private val mutex = Mutex()
    private val json = Json { ignoreUnknownKeys = true }

    /** Add or replace the entry for the given date. Max 365 entries (one year). */
    suspend fun enqueue(entry: StepSyncEntry): Unit = mutex.withLock {
        val safeEntry = entry.copy(
            steps = entry.steps.coerceIn(0, 200_000),
            distanceKm = entry.distanceKm.coerceIn(0.0, 500.0),
            activeMinutes = entry.activeMinutes.coerceIn(0, 1440),
        )
        val entries = load().toMutableList()
        val idx = entries.indexOfFirst { it.date == safeEntry.date }
        if (idx >= 0) entries[idx] = safeEntry else entries.add(safeEntry)
        if (entries.size > 365) entries.removeAt(0)
        save(entries)
    }

    /** Return all pending entries without removing them. */
    suspend fun peekAll(): List<StepSyncEntry> = mutex.withLock { load() }

    /** Remove and return all pending entries atomically. */
    suspend fun dequeueAll(): List<StepSyncEntry> = mutex.withLock {
        val entries = load()
        storage.remove(StorageKeys.STEPS_SYNC_QUEUE)
        entries
    }

    /** Put entries back after a failed sync (merges by date to avoid duplicates). */
    suspend fun requeue(entries: List<StepSyncEntry>): Unit = mutex.withLock {
        val current = load().toMutableList()
        for (e in entries) {
            val idx = current.indexOfFirst { it.date == e.date }
            if (idx >= 0) current[idx] = e else current.add(e)
        }
        save(current)
    }

    private fun load(): List<StepSyncEntry> {
        val raw = storage.getString(StorageKeys.STEPS_SYNC_QUEUE) ?: return emptyList()
        return try { json.decodeFromString<StepQueue>(raw).entries } catch (_: Exception) { emptyList() }
    }

    private fun save(entries: List<StepSyncEntry>) {
        if (entries.isEmpty()) {
            storage.remove(StorageKeys.STEPS_SYNC_QUEUE)
        } else {
            storage.putString(StorageKeys.STEPS_SYNC_QUEUE, json.encodeToString(StepQueue(entries)))
        }
    }
}
