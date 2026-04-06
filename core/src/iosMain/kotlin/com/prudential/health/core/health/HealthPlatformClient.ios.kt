package com.prudential.health.core.health

import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.datetime.LocalDate
import platform.Foundation.NSCalendar
import platform.Foundation.NSCalendarUnitDay
import platform.Foundation.NSCalendarUnitEra
import platform.Foundation.NSCalendarUnitMonth
import platform.Foundation.NSCalendarUnitYear
import platform.Foundation.NSDate
import platform.Foundation.NSDateComponents
import platform.HealthKit.* // wildcard required for metaclass extension fns (countUnit, predicateForSamplesWithStartDate, etc.)
import kotlin.coroutines.resume

@OptIn(ExperimentalForeignApi::class)
actual class HealthPlatformClient {

    private val store = HKHealthStore()

    private val stepsType: HKQuantityType? =
        HKObjectType.quantityTypeForIdentifier(HKQuantityTypeIdentifierStepCount)

    private val distanceType: HKQuantityType? =
        HKObjectType.quantityTypeForIdentifier(HKQuantityTypeIdentifierDistanceWalkingRunning)

    private val exerciseType: HKQuantityType? =
        HKObjectType.quantityTypeForIdentifier(HKQuantityTypeIdentifierAppleExerciseTime)

    actual fun isAvailable(): Boolean = HKHealthStore.isHealthDataAvailable()

    actual suspend fun hasPermissions(): Boolean {
        if (!isAvailable()) return false
        val types = setOfNotNull(stepsType, distanceType, exerciseType)
        if (types.isEmpty()) return false

        // HealthKit does not expose read permission status; we request and treat success as granted.
        // Query returns empty data if the user denies read access.
        return suspendCancellableCoroutine { cont ->
            store.requestAuthorizationToShareTypes(
                typesToShare = emptySet<HKSampleType>(),
                readTypes = types,
            ) { success, _ ->
                cont.resume(success)
            }
        }
    }

    actual suspend fun readToday(): DailyStepData? {
        if (!isAvailable()) return null
        val calendar = NSCalendar.currentCalendar
        val now = NSDate()
        val startOfDay = calendar.startOfDayForDate(now)

        val stepsType = stepsType ?: return null
        val steps = querySum(stepsType, startOfDay, now, HKUnit.countUnit()) ?: 0.0
        val distance = distanceType?.let { querySum(it, startOfDay, now, HKUnit.meterUnit()) } ?: 0.0
        val exerciseSecs = exerciseType?.let { querySum(it, startOfDay, now, HKUnit.secondUnit()) } ?: 0.0

        return DailyStepData(
            date = nsDateToLocalDate(startOfDay),
            steps = steps.toInt(),
            distanceMeters = distance,
            activeMinutes = (exerciseSecs / 60.0).toInt(),
        )
    }

    actual suspend fun readHistory(days: Int): List<DailyStepData> {
        if (!isAvailable()) return emptyList()
        val calendar = NSCalendar.currentCalendar
        val now = NSDate()

        val results = mutableListOf<DailyStepData>()
        for (i in 0 until days) {
            val offsetComponents = NSDateComponents()
            offsetComponents.day = (-i).toLong()
            val dayDate = calendar.dateByAddingComponents(offsetComponents, now, 0u) ?: continue
            val startOfDay = calendar.startOfDayForDate(dayDate)

            val nextDayComponents = NSDateComponents()
            nextDayComponents.day = 1L
            val endOfDay = calendar.dateByAddingComponents(nextDayComponents, startOfDay, 0u) ?: continue

            val stepsType = stepsType ?: continue
            val steps = querySum(stepsType, startOfDay, endOfDay, HKUnit.countUnit()) ?: continue
            val distance = distanceType?.let { querySum(it, startOfDay, endOfDay, HKUnit.meterUnit()) } ?: 0.0
            val exerciseSecs = exerciseType?.let { querySum(it, startOfDay, endOfDay, HKUnit.secondUnit()) } ?: 0.0

            results.add(
                DailyStepData(
                    date = nsDateToLocalDate(startOfDay),
                    steps = steps.toInt(),
                    distanceMeters = distance,
                    activeMinutes = (exerciseSecs / 60.0).toInt(),
                )
            )
        }
        return results.sortedBy { it.date }
    }

    private suspend fun querySum(
        type: HKQuantityType,
        start: NSDate,
        end: NSDate,
        unit: HKUnit,
    ): Double? = suspendCancellableCoroutine { cont ->
        val predicate = HKQuery.predicateForSamplesWithStartDate(start, end, HKQueryOptionNone)
        val query = HKStatisticsQuery(
            quantityType = type,
            quantitySamplePredicate = predicate,
            options = HKStatisticsOptionCumulativeSum,
        ) { _, statistics, error ->
            if (error != null) cont.resume(null)
            else cont.resume(statistics?.sumQuantity()?.doubleValueForUnit(unit))
        }
        store.executeQuery(query)
    }

    private fun nsDateToLocalDate(date: NSDate): LocalDate {
        val calendar = NSCalendar.currentCalendar
        val components = calendar.components(
            NSCalendarUnitYear or NSCalendarUnitMonth or NSCalendarUnitDay or NSCalendarUnitEra,
            fromDate = date,
        )
        return LocalDate(
            year = components.year.toInt(),
            monthNumber = components.month.toInt(),
            dayOfMonth = components.day.toInt(),
        )
    }
}
