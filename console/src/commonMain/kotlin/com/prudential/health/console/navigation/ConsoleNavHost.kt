package com.prudential.health.console.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.prudential.health.console.feature.analytics.StepTrendsScreen
import com.prudential.health.console.feature.auth.LoginScreen
import com.prudential.health.console.feature.content.ArticleListScreen
import com.prudential.health.console.feature.overview.OverviewScreen
import com.prudential.health.console.feature.reports.ReportsScreen
import com.prudential.health.console.feature.settings.AdminUsersScreen
import com.prudential.health.console.feature.users.UserListScreen
import com.prudential.health.console.feature.users.PolicyListScreen
import com.prudential.health.console.session.AdminSessionManager
import com.prudential.health.console.ui.shell.ConsoleShell
import org.koin.compose.koinInject

@Composable
fun ConsoleNavHost() {
    val navController = rememberNavController()
    val sessionManager = koinInject<AdminSessionManager>()
    val adminUser by sessionManager.adminUser.collectAsState()

    val startDestination: ConsoleRoute = remember {
        if (sessionManager.restoreSession()) ConsoleRoute.Overview else ConsoleRoute.Login
    }

    NavHost(
        navController = navController,
        startDestination = startDestination,
    ) {
        composable<ConsoleRoute.Login> {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(ConsoleRoute.Overview) {
                        popUpTo<ConsoleRoute.Login> { inclusive = true }
                    }
                }
            )
        }

        composable<ConsoleRoute.Overview> {
            ConsoleShell(
                currentRoute = ConsoleRoute.Overview,
                onNavigate = { navController.navigate(it) },
                onSignOut = {
                    sessionManager.clearSession()
                    navController.navigate(ConsoleRoute.Login) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                adminUser = adminUser,
            ) {
                OverviewScreen()
            }
        }

        composable<ConsoleRoute.Analytics> {
            ConsoleShell(
                currentRoute = ConsoleRoute.Analytics,
                onNavigate = { navController.navigate(it) },
                onSignOut = {
                    sessionManager.clearSession()
                    navController.navigate(ConsoleRoute.Login) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                adminUser = adminUser,
            ) {
                StepTrendsScreen()
            }
        }

        composable<ConsoleRoute.Users> {
            ConsoleShell(
                currentRoute = ConsoleRoute.Users,
                onNavigate = { navController.navigate(it) },
                onSignOut = {
                    sessionManager.clearSession()
                    navController.navigate(ConsoleRoute.Login) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                adminUser = adminUser,
            ) {
                UserListScreen()
            }
        }

        composable<ConsoleRoute.Policies> {
            ConsoleShell(
                currentRoute = ConsoleRoute.Policies,
                onNavigate = { navController.navigate(it) },
                onSignOut = {
                    sessionManager.clearSession()
                    navController.navigate(ConsoleRoute.Login) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                adminUser = adminUser,
            ) {
                PolicyListScreen()
            }
        }

        composable<ConsoleRoute.Content> {
            ConsoleShell(
                currentRoute = ConsoleRoute.Content,
                onNavigate = { navController.navigate(it) },
                onSignOut = {
                    sessionManager.clearSession()
                    navController.navigate(ConsoleRoute.Login) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                adminUser = adminUser,
            ) {
                ArticleListScreen()
            }
        }

        composable<ConsoleRoute.Reports> {
            ConsoleShell(
                currentRoute = ConsoleRoute.Reports,
                onNavigate = { navController.navigate(it) },
                onSignOut = {
                    sessionManager.clearSession()
                    navController.navigate(ConsoleRoute.Login) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                adminUser = adminUser,
            ) {
                ReportsScreen()
            }
        }

        composable<ConsoleRoute.Settings> {
            ConsoleShell(
                currentRoute = ConsoleRoute.Settings,
                onNavigate = { navController.navigate(it) },
                onSignOut = {
                    sessionManager.clearSession()
                    navController.navigate(ConsoleRoute.Login) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                adminUser = adminUser,
            ) {
                AdminUsersScreen()
            }
        }
    }
}
