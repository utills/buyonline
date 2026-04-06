package com.prudential.health.di

import com.prudential.health.core.di.coreModule
import com.prudential.health.feature.auth.di.authModule
import com.prudential.health.feature.calculator.di.calculatorModule
import com.prudential.health.feature.content.di.contentModule
import com.prudential.health.feature.dashboard.di.dashboardModule
import com.prudential.health.feature.profile.di.profileModule
import org.koin.core.module.Module

val allModules: List<Module> = listOf(
    coreModule,
    authModule,
    dashboardModule,
    contentModule,
    calculatorModule,
    profileModule,
)
