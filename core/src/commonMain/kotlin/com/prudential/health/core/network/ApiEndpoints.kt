package com.prudential.health.core.network

/**
 * Centralised environment configuration for API connectivity.
 *
 * On startup, [baseUrl] is initialised from the platform-specific [getBaseUrl]
 * (Android emulator → 10.0.2.2, iOS simulator → localhost). Call [configure]
 * to override with a production URL before Koin initialises the network layer.
 *
 * Usage at app startup (e.g. Application.onCreate or before KoinApplication):
 * ```
 * AppConfig.configure("https://api.pruhealth.com/v1/")
 * ```
 */
object AppConfig {
    var baseUrl: String = getBaseUrl()
        private set

    /**
     * Override the base URL for the current process.
     * Must be called **before** the Koin graph is created so that [ApiClient]
     * picks up the correct value.
     */
    fun configure(baseUrl: String) {
        this.baseUrl = baseUrl
    }
}

object ApiEndpoints {

    object Auth {
        const val SEND_OTP = "auth/otp/send"
        const val VERIFY_OTP = "auth/otp/verify"
        const val REFRESH_TOKEN = "auth/token/refresh"
        const val LOGOUT = "auth/logout"
        const val POLICIES = "auth/policies"
        const val MEMBERS = "auth/members"
    }

    object Steps {
        const val TODAY = "steps/today"
        const val SUMMARY = "steps/summary"
        const val SYNC = "steps/sync"
        const val MILESTONES = "steps/milestones"
        const val CONNECT = "steps/connect"
        const val CONNECTION = "steps/connection"
        const val DISCONNECT = "steps/disconnect"
    }

    object Content {
        const val ARTICLES = "content/articles"
        const val HELP_TOPICS = "content/help-topics"
    }

    object Calculator {
        const val HEART_SCORE = "calculator/heart-score"
        const val DIABETES = "calculator/diabetes"
        const val QDIABETES = "calculator/qdiabetes"
        const val BMI = "calculator/bmi"
        const val BMR = "calculator/bmr"
        const val HISTORY = "calculator/history"
    }

    object Profile {
        const val ME = "profile/me"
        const val UPDATE = "profile/update"
        const val POLICY = "profile/policy"
        const val NOTIFICATIONS = "profile/notifications"
        const val SETTINGS = "profile/settings"
        const val CONSENT = "profile/consent"
        const val CONSENTS = "profile/consents"
        const val SESSIONS = "profile/sessions"
    }
}
