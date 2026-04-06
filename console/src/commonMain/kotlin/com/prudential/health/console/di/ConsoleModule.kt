package com.prudential.health.console.di

import com.prudential.health.console.feature.analytics.AnalyticsRepository
import com.prudential.health.console.feature.analytics.AnalyticsViewModel
import com.prudential.health.console.feature.auth.AdminAuthRepository
import com.prudential.health.console.feature.auth.LoginViewModel
import com.prudential.health.console.feature.content.ContentAdminRepository
import com.prudential.health.console.feature.content.ContentAdminViewModel
import com.prudential.health.console.feature.overview.OverviewRepository
import com.prudential.health.console.feature.overview.OverviewViewModel
import com.prudential.health.console.feature.reports.ReportsRepository
import com.prudential.health.console.feature.reports.ReportsViewModel
import com.prudential.health.console.feature.settings.SettingsViewModel
import com.prudential.health.console.feature.users.PolicyListViewModel
import com.prudential.health.console.feature.users.UserAdminRepository
import com.prudential.health.console.feature.users.UserDetailViewModel
import com.prudential.health.console.feature.users.UserListViewModel
import com.prudential.health.console.session.AdminSessionManager
import com.prudential.health.console.session.AdminStorageKeys
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.AppConfig
import com.prudential.health.core.util.PersistentStorage
import org.koin.dsl.module

val consoleModule = module {
    single { PersistentStorage() }
    single { AdminSessionManager(storage = get()) }

    single {
        val sessionManager = get<AdminSessionManager>()
        val storage = get<PersistentStorage>()
        ApiClient(
            baseUrl = AppConfig.baseUrl,
            tokenProvider = { sessionManager.getAccessToken() },
            refreshTokenProvider = { sessionManager.getRefreshToken() },
            onTokenRefreshed = { access, refresh ->
                sessionManager.storeSession(
                    accessToken = access,
                    refreshToken = refresh,
                    expiresAt = System.currentTimeMillis() + 30L * 24 * 60 * 60 * 1000,
                    adminId = storage.getString(AdminStorageKeys.ADMIN_ID)?.toIntOrNull() ?: 0,
                    email = storage.getString(AdminStorageKeys.ADMIN_EMAIL) ?: "",
                    name = storage.getString(AdminStorageKeys.ADMIN_NAME) ?: "",
                    role = storage.getString(AdminStorageKeys.ADMIN_ROLE) ?: "viewer",
                )
            },
            onSessionExpired = {
                sessionManager.clearSession()
            },
        )
    }

    single { AdminAuthRepository(apiClient = get(), sessionManager = get()) }
    single { OverviewRepository(apiClient = get()) }
    single { AnalyticsRepository(apiClient = get()) }
    single { UserAdminRepository(apiClient = get()) }
    single { ContentAdminRepository(apiClient = get()) }
    single { ReportsRepository(apiClient = get()) }

    factory { LoginViewModel(repository = get()) }
    factory { OverviewViewModel(repository = get()) }
    factory { AnalyticsViewModel(repository = get()) }
    factory { UserListViewModel(repository = get()) }
    factory { UserDetailViewModel(repository = get()) }
    factory { PolicyListViewModel(repository = get()) }
    factory { ContentAdminViewModel(repository = get()) }
    factory { ReportsViewModel(repository = get()) }
    factory { SettingsViewModel(apiClient = get(), sessionManager = get()) }
}
