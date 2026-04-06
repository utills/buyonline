package com.prudential.health.core.sync

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

actual class ConnectivityMonitor actual constructor() {
    // Desktop (admin console) is assumed to always have connectivity.
    private val _isOnline = MutableStateFlow(true)
    actual val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()
    actual fun stop() = Unit
}
