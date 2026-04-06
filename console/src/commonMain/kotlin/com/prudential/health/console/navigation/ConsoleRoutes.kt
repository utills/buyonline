package com.prudential.health.console.navigation

import kotlinx.serialization.Serializable

sealed interface ConsoleRoute {
    @Serializable data object Login : ConsoleRoute
    @Serializable data object Overview : ConsoleRoute
    @Serializable data object Analytics : ConsoleRoute
    @Serializable data object Users : ConsoleRoute
    @Serializable data object Policies : ConsoleRoute
    @Serializable data object Content : ConsoleRoute
    @Serializable data object Reports : ConsoleRoute
    @Serializable data object Settings : ConsoleRoute
}

data class NavItem(
    val route: ConsoleRoute,
    val label: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
)
