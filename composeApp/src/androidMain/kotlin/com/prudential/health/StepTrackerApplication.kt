package com.prudential.health

import android.app.Application
import com.prudential.health.core.network.AppConfig
import com.prudential.health.core.util.PersistentStorage
import com.prudential.health.sync.HealthReadWorker
import com.prudential.health.sync.StepSyncWorker

class StepTrackerApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        PersistentStorage.appContext = applicationContext
        // Configure API base URL from BuildConfig (debug → emulator, release → production)
        AppConfig.configure(BuildConfig.API_BASE_URL)
        // Schedule background step sync (runs every 15 min when connected)
        StepSyncWorker.schedule(this)
        // Schedule Health Connect reads (runs every 30 min)
        HealthReadWorker.schedule(this)
    }
}
