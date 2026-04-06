package com.prudential.health.feature.content.di

import com.prudential.health.feature.content.repository.ContentRepository
import com.prudential.health.feature.content.viewmodel.ContentViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

val contentModule = module {
    single { ContentRepository(apiClient = get()) }
    viewModel { ContentViewModel(repository = get()) }
}
