package com.prudential.health.feature.auth.di

import com.prudential.health.feature.auth.repository.AuthRepository
import com.prudential.health.feature.auth.viewmodel.AuthViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

val authModule = module {
    single { AuthRepository(apiClient = get(), sessionManager = get()) }
    viewModel { AuthViewModel(repository = get()) }
}
