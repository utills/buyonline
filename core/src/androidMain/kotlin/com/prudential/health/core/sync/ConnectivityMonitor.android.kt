package com.prudential.health.core.sync

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import com.prudential.health.core.util.PersistentStorage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

actual class ConnectivityMonitor actual constructor() {

    private val _isOnline = MutableStateFlow(checkInitial())
    actual val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()

    private var connectivityManager: ConnectivityManager? = null
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

    init {
        registerCallback()
    }

    private fun registerCallback() {
        val ctx = PersistentStorage.appContext ?: return
        val cm = ctx.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                _isOnline.value = true
            }
            override fun onLost(network: Network) {
                val active = cm.activeNetwork
                val caps = active?.let { cm.getNetworkCapabilities(it) }
                _isOnline.value = caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
            }
        }
        cm.registerNetworkCallback(request, callback)
        connectivityManager = cm
        networkCallback = callback
    }

    actual fun stop() {
        val cm = connectivityManager ?: return
        val cb = networkCallback ?: return
        try {
            cm.unregisterNetworkCallback(cb)
        } catch (_: IllegalArgumentException) {
            // already unregistered
        }
        connectivityManager = null
        networkCallback = null
    }

    private fun checkInitial(): Boolean {
        val ctx = PersistentStorage.appContext ?: return true
        val cm = ctx.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(network) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
}
