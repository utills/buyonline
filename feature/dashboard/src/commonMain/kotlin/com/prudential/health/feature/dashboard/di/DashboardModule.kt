package com.prudential.health.feature.dashboard.di

import com.prudential.health.feature.dashboard.repository.DashboardRepository
import com.prudential.health.feature.dashboard.viewmodel.DashboardViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

val dashboardModule = module {
    single {
        DashboardRepository(
            apiClient = get(),
            sessionManager = get(),
            storage = get(),
            syncManager = get(),
        )
    }
    viewModel { DashboardViewModel(repository = get()) }
}
