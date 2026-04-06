package com.prudential.health.sync

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.prudential.health.core.health.HealthPlatformClient
import com.prudential.health.core.health.LocationValidator
import com.prudential.health.core.sync.StepSyncManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import java.util.concurrent.TimeUnit

/**
 * Periodic worker that reads today's steps from Health Connect and records them
 * into the offline sync queue. Runs every 30 minutes when the app has permissions.
 *
 * Also performs a lightweight location-based fraud check and logs suspicious readings.
 */
class HealthReadWorker(
    appContext: Context,
    params: WorkerParameters,
) : CoroutineWorker(appContext, params), KoinComponent {

    private val syncManager: StepSyncManager by inject()

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val healthClient = HealthPlatformClient(applicationContext)

            if (!healthClient.isAvailable()) {
                Log.d(TAG, "Health Connect not available on this device")
                return@withContext Result.success()
            }

            if (!healthClient.hasPermissions()) {
                Log.d(TAG, "Health Connect permissions not granted — skipping read")
                return@withContext Result.success()
            }

            val today = healthClient.readToday()
            if (today == null) {
                Log.d(TAG, "No step data for today from Health Connect")
                return@withContext Result.success()
            }

            Log.d(TAG, "Health Connect: ${today.steps} steps, ${today.distanceMeters}m, ${today.activeMinutes}min")

            // Optional: location validation (only if location permission is granted)
            val validator = LocationValidator(applicationContext)
            val snapshot = validator.snapshotLocation()
            if (snapshot != null) {
                val validation = validator.validate(today.steps, snapshot)
                if (validation is LocationValidator.ValidationResult.Suspicious) {
                    Log.w(TAG, "Suspicious step data: ${validation.steps} steps but only ${validation.actualDisplacementM.toInt()}m displacement (expected >=${(validation.impliedDistanceM * 0.20).toInt()}m)")
                    // Still record — flag is logged; server-side can apply further rules
                }
            }

            syncManager.recordSteps(
                date = today.date.toString(),
                steps = today.steps,
                distanceKm = today.distanceMeters / 1000.0,
                activeMinutes = today.activeMinutes,
            )

            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "HealthReadWorker failed", e)
            Result.retry()
        }
    }

    companion object {
        private const val TAG = "HealthReadWorker"
        private const val WORK_NAME = "health_read_periodic"

        fun schedule(context: Context) {
            val request = PeriodicWorkRequestBuilder<HealthReadWorker>(30, TimeUnit.MINUTES)
                .build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request,
            )
        }
    }
}
