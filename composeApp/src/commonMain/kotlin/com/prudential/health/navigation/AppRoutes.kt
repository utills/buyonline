package com.prudential.health.navigation

import kotlinx.serialization.Serializable

@Serializable
sealed interface AppRoute {
    // Auth flow
    @Serializable data object Welcome : AppRoute
    @Serializable data object Login : AppRoute
    @Serializable data object Otp : AppRoute
    @Serializable data object PolicySelection : AppRoute
    @Serializable data object MemberSelection : AppRoute

    // Main tabs
    @Serializable data object Home : AppRoute
    @Serializable data object Blogs : AppRoute
    @Serializable data object Calculators : AppRoute

    // Calculator sub-screens
    @Serializable data class HeartScoreDetail(val calculatorId: String = "heart_score") : AppRoute
    @Serializable data object HeartScoreForm : AppRoute
    @Serializable data object HeartScoreResult : AppRoute
    @Serializable data object QDiabetesCalculator : AppRoute
    @Serializable data object BmiCalculator : AppRoute
    @Serializable data object BmrCalculator : AppRoute

    // Profile
    @Serializable data object Profile : AppRoute
    @Serializable data object Settings : AppRoute
    @Serializable data object Notifications : AppRoute
}
