package com.prudential.health.core.sync

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * iOS connectivity monitor.
 * Reports always-online; Ktor/Darwin handles network errors natively.
 * StepSyncManager requeues on failure, so sync is retried on the next
 * foreground resume or manual trigger.
 */
actual class ConnectivityMonitor actual constructor() {
    private val _isOnline = MutableStateFlow(true)
    actual val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()
    actual fun stop() = Unit
}
