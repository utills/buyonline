package com.prudential.health.feature.profile.di

import com.prudential.health.feature.profile.repository.ProfileRepository
import com.prudential.health.feature.profile.viewmodel.ProfileViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

val profileModule = module {
    single { ProfileRepository(apiClient = get(), sessionManager = get()) }
    viewModel { ProfileViewModel(repository = get()) }
}
