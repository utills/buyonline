package com.prudential.health.feature.calculator.di

import com.prudential.health.feature.calculator.repository.CalculatorRepository
import com.prudential.health.feature.calculator.viewmodel.CalculatorViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

val calculatorModule = module {
    single { CalculatorRepository(apiClient = get()) }
    viewModel { CalculatorViewModel(repository = get()) }
}
