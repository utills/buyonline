package com.prudential.health.core.sync

import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.ApiEndpoints
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Application-scoped manager for offline step recording and deferred sync.
 *
 * Usage:
 * - Call [recordSteps] whenever the health platform provides new step data.
 *   If the device is online the entry is synced immediately; otherwise it is
 *   stored in the [OfflineStepsQueue] and retried when connectivity is restored.
 * - Observe [syncStatus] / [pendingCount] to update the UI.
 * - Call [syncIfNeeded] manually (e.g. on pull-to-refresh or foreground resume).
 */
class StepSyncManager(
    private val queue: OfflineStepsQueue,
    private val apiClient: ApiClient,
    private val connectivity: ConnectivityMonitor,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private val _syncStatus = MutableStateFlow(SyncStatus.IDLE)
    val syncStatus: StateFlow<SyncStatus> = _syncStatus.asStateFlow()

    private val _pendingCount = MutableStateFlow(0)
    val pendingCount: StateFlow<Int> = _pendingCount.asStateFlow()

    init {
        // Auto-sync whenever connectivity is (re)established.
        scope.launch {
            connectivity.isOnline.collect { online ->
                if (online) syncIfNeeded()
            }
        }
        // Reflect any previously-queued entries at startup.
        scope.launch { refreshPendingCount() }
    }

    /**
     * Record steps for [date] (YYYY-MM-DD format).
     * If the same date already exists in the queue the entry is replaced, so
     * only the most recent reading per day is ever sent to the server.
     */
    suspend fun recordSteps(
        date: String,
        steps: Int,
        distanceKm: Double = 0.0,
        activeMinutes: Int = 0,
    ) {
        queue.enqueue(StepSyncEntry(date, steps, distanceKm, activeMinutes))
        _pendingCount.value = queue.peekAll().size
        _syncStatus.value = SyncStatus.PENDING
        if (connectivity.isOnline.value) syncIfNeeded()
    }

    /**
     * Flush the queue to the server.
     * @return true if the queue is empty after the call (either it was already
     *   empty or sync succeeded), false if entries remain due to a network error.
     */
    suspend fun syncIfNeeded(): Boolean {
        val pending = queue.peekAll()
        if (pending.isEmpty()) {
            _syncStatus.value = SyncStatus.IDLE
            _pendingCount.value = 0
            return true
        }

        _syncStatus.value = SyncStatus.SYNCING
        val toSync = queue.dequeueAll()

        val result: NetworkResult<StepSyncResponse>? = withTimeoutOrNull(30_000L) {
            apiClient.post(ApiEndpoints.Steps.SYNC, StepSyncRequest(toSync))
        }
        if (result == null) {
            queue.requeue(toSync)
            _pendingCount.value = queue.peekAll().size
            _syncStatus.value = SyncStatus.ERROR
            return false
        }

        return when (result) {
            is NetworkResult.Success -> {
                _syncStatus.value = SyncStatus.SUCCESS
                _pendingCount.value = 0
                true
            }
            is NetworkResult.Error -> {
                queue.requeue(toSync)
                _pendingCount.value = queue.peekAll().size
                _syncStatus.value = SyncStatus.ERROR
                false
            }
            else -> {
                queue.requeue(toSync)
                _syncStatus.value = SyncStatus.PENDING
                false
            }
        }
    }

    private suspend fun refreshPendingCount() {
        val pending = queue.peekAll()
        _pendingCount.value = pending.size
        if (pending.isNotEmpty()) _syncStatus.value = SyncStatus.PENDING
    }

    /** Cancel the internal coroutine scope. Call when the app is terminating. */
    fun close() { scope.cancel() }
}
