package com.prudential.health.core.di

import org.koin.core.KoinApplication
import org.koin.core.context.startKoin
import org.koin.core.module.Module
import org.koin.dsl.KoinAppDeclaration

object AppKoin {
    @PublishedApi
    internal var koinApp: KoinApplication? = null

    fun init(
        modules: List<Module>,
        appDeclaration: KoinAppDeclaration = {},
    ) {
        if (koinApp != null) return
        koinApp = startKoin {
            appDeclaration()
            modules(modules)
        }
    }

    inline fun <reified T : Any> get(): T {
        return koinApp?.koin?.get()
            ?: throw IllegalStateException("Koin not initialized. Call AppKoin.init() first.")
    }
}
