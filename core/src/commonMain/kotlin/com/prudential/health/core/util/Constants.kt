package com.prudential.health.core.util

object AppConstants {
    // OTP
    const val OTP_LENGTH = 6
    const val OTP_EXPIRY_MINUTES = 3
    const val OTP_RESEND_COOLDOWN_SECONDS = 180
    const val OTP_MAX_ATTEMPTS_PER_HOUR = 5

    // Phone
    const val PHONE_NUMBER_LENGTH = 10

    // Steps
    const val DEFAULT_DAILY_STEP_GOAL = 10_000
    const val MAX_STEPS_PER_DAY = 200_000
    const val METERS_PER_STEP = 0.762

    // Pagination
    const val DEFAULT_PAGE_SIZE = 20
    const val MAX_PAGE_SIZE = 100

    // Calculators — medical ranges
    const val BMI_MIN_HEIGHT_CM = 50
    const val BMI_MAX_HEIGHT_CM = 250
    const val BMI_MIN_WEIGHT_KG = 10
    const val BMI_MAX_WEIGHT_KG = 500
    const val BMR_MIN_AGE = 15
    const val BMR_MAX_AGE = 100
    const val HEART_SCORE_MIN_AGE = 25
    const val HEART_SCORE_MAX_AGE = 84
}
