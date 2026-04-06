package com.prudential.health.sync

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.prudential.health.core.sync.StepSyncManager
import org.koin.core.context.GlobalContext
import java.util.concurrent.TimeUnit

/**
 * Background worker that flushes the offline step queue whenever the device
 * is online. Scheduled as a periodic task (every 15 minutes, network required).
 *
 * The minimum interval enforced by WorkManager is 15 minutes, which is sufficient
 * for health data that is meaningful at a per-day granularity.
 */
class StepSyncWorker(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val syncManager = runCatching {
            GlobalContext.get().get<StepSyncManager>()
        }.getOrNull() ?: return Result.retry() // Retry — Koin may not be ready yet

        return if (syncManager.syncIfNeeded()) Result.success() else Result.retry()
    }

    companion object {
        private const val WORK_NAME = "step_sync_periodic"

        fun schedule(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = PeriodicWorkRequestBuilder<StepSyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request,
            )
        }
    }
}
