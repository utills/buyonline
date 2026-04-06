package com.prudential.health.core.sync

import kotlinx.coroutines.flow.StateFlow

/**
 * Platform-specific network connectivity monitor.
 * Emits true when an internet-capable network is available, false when offline.
 * The initial value reflects the current connectivity state at instantiation time.
 */
expect class ConnectivityMonitor() {
    val isOnline: StateFlow<Boolean>

    /** Unregister any OS-level callbacks. Safe to call multiple times. */
    fun stop()
}
