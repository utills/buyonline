package com.prudential.health.core.di

import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.AppConfig
import com.prudential.health.core.sync.ConnectivityMonitor
import com.prudential.health.core.sync.OfflineStepsQueue
import com.prudential.health.core.sync.StepSyncManager
import com.prudential.health.core.util.PersistentStorage
import com.prudential.health.core.util.SessionManager
import com.prudential.health.core.util.StorageKeys
import org.koin.dsl.module

val coreModule = module {
    single { PersistentStorage() }

    // ApiClient is created before SessionManager to break the circular dependency.
    // Token callbacks and session-expired handler reference SessionManager via a
    // lazy get() call that is safe because Koin resolves singletons only once.
    single {
        val storage = get<PersistentStorage>()
        ApiClient(
            baseUrl = AppConfig.baseUrl,
            tokenProvider = {
                storage.getString(StorageKeys.ACCESS_TOKEN)
            },
            refreshTokenProvider = {
                storage.getString(StorageKeys.REFRESH_TOKEN)
            },
            onTokenRefreshed = { access, refresh ->
                get<SessionManager>().storeTokens(access, refresh)
            },
            onSessionExpired = {
                get<SessionManager>().logout()
            },
        )
    }

    single { SessionManager(storage = get(), apiClient = get()) }

    // Offline sync infrastructure
    single { ConnectivityMonitor() }
    single { OfflineStepsQueue(storage = get()) }
    single { StepSyncManager(queue = get(), apiClient = get(), connectivity = get()) }
}
