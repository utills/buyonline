package com.prudential.health.core.health

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.tasks.await

/**
 * Validates that reported step counts are plausible given the device's location history.
 *
 * Uses a simple heuristic: compare the total displacement (meters) implied by the step count
 * (using an average stride length of 0.762 m) against actual GPS displacement.
 *
 * A result of [ValidationResult.Suspicious] means the reported steps are implausibly high
 * relative to observed movement — useful as a fraud signal for insurance validation.
 */
class LocationValidator(private val context: Context) {

    private val fusedClient = LocationServices.getFusedLocationProviderClient(context)

    /** Average stride length in meters (adult average ~0.762 m per step). */
    private val avgStrideMeters = 0.762

    /** Tolerance multiplier — GPS has error, indoor steps don't move far, etc.
     *  We allow actual displacement to be as low as 20% of implied stride distance. */
    private val minDisplacementRatio = 0.20

    sealed class ValidationResult {
        /** Steps and displacement are plausible. */
        object OK : ValidationResult()
        /** Steps seem too high relative to actual movement — flag for review. */
        data class Suspicious(val steps: Int, val impliedDistanceM: Double, val actualDisplacementM: Double) : ValidationResult()
        /** Location data unavailable — cannot validate. */
        object Unavailable : ValidationResult()
    }

    /**
     * Validate [steps] reported for today against the device's current location vs [previousLocation].
     * [previousLocation] should be snapshotted at the start of the day (or last check).
     */
    // Permission is verified by snapshotLocation() before this is called; SecurityException caught by runCatching.
    @SuppressLint("MissingPermission")
    suspend fun validate(steps: Int, previousLocation: Location?): ValidationResult {
        if (steps <= 0) return ValidationResult.OK
        val cts = CancellationTokenSource()
        val currentLocation: Location = runCatching {
            fusedClient.getCurrentLocation(
                Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                cts.token,
            ).await()
        }.getOrNull() ?: return ValidationResult.Unavailable

        val prev = previousLocation ?: return ValidationResult.Unavailable

        val actualDisplacementM = prev.distanceTo(currentLocation).toDouble()
        val impliedDistanceM = steps * avgStrideMeters

        // If displacement is less than 20% of what steps imply, flag it.
        // Example: 10,000 steps implies 7,620 m. If GPS shows only 100 m moved → suspicious.
        // Exception: treadmill/indoor walking has zero displacement — tuned via minDisplacementRatio.
        return if (actualDisplacementM >= impliedDistanceM * minDisplacementRatio || actualDisplacementM >= 500.0) {
            ValidationResult.OK
        } else {
            ValidationResult.Suspicious(steps, impliedDistanceM, actualDisplacementM)
        }
    }

    /** Snapshot current location for later comparison. Returns null if unavailable or no permission. */
    suspend fun snapshotLocation(): Location? {
        val hasFine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (!hasFine && !hasCoarse) return null
        val cts = CancellationTokenSource()
        return runCatching {
            fusedClient.getCurrentLocation(
                Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                cts.token,
            ).await()
        }.getOrNull()
    }
}
