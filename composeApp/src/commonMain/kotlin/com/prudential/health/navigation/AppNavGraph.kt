package com.prudential.health.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.outlined.Calculate
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.prudential.health.core.ui.components.PruTopBar
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.core.util.SessionManager
import com.prudential.health.feature.auth.ui.LoginScreen
import com.prudential.health.feature.auth.ui.MemberSelectionScreen
import com.prudential.health.feature.auth.ui.OtpScreen
import com.prudential.health.feature.auth.ui.PolicySelectionScreen
import com.prudential.health.feature.auth.ui.WelcomeScreen
import com.prudential.health.feature.auth.viewmodel.AuthViewModel
import com.prudential.health.feature.calculator.ui.BmiCalculatorScreen
import com.prudential.health.feature.calculator.ui.BmrCalculatorScreen
import com.prudential.health.feature.calculator.ui.CalculatorsScreen
import com.prudential.health.feature.calculator.ui.QDiabetesScreen
import com.prudential.health.feature.calculator.ui.HeartScoreDetailScreen
import com.prudential.health.feature.calculator.ui.HeartScoreFormScreen
import com.prudential.health.feature.calculator.ui.HeartScoreResultScreen
import com.prudential.health.feature.calculator.viewmodel.CalculatorViewModel
import com.prudential.health.feature.content.ui.BlogsScreen
import com.prudential.health.feature.content.viewmodel.ContentViewModel
import com.prudential.health.feature.dashboard.ui.HomeScreen
import com.prudential.health.feature.dashboard.viewmodel.DashboardViewModel
import com.prudential.health.feature.profile.ui.NotificationsScreen
import com.prudential.health.feature.profile.ui.ProfileScreen
import com.prudential.health.feature.profile.ui.SettingsScreen
import com.prudential.health.feature.profile.viewmodel.ProfileViewModel
import org.koin.compose.koinInject
import org.koin.compose.viewmodel.koinViewModel

private data class BottomNavItem(
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val route: AppRoute,
)

private val bottomNavItems = listOf(
    BottomNavItem("Home", Icons.Filled.Home, Icons.Outlined.Home, AppRoute.Home),
    BottomNavItem("Blogs", Icons.AutoMirrored.Filled.MenuBook, Icons.AutoMirrored.Outlined.MenuBook, AppRoute.Blogs),
    BottomNavItem("Calculators", Icons.Filled.Calculate, Icons.Outlined.Calculate, AppRoute.Calculators),
)

@Composable
fun AppNavGraph(
    startLoggedIn: Boolean = false,
    navController: NavHostController = rememberNavController(),
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    val sessionManager: SessionManager = koinInject()
    val currentUser by sessionManager.currentUser.collectAsState()
    val isLoggedIn by sessionManager.isLoggedIn.collectAsState()

    // Shared ViewModels for multi-screen flows
    val authViewModel: AuthViewModel = koinViewModel()
    val calculatorViewModel: CalculatorViewModel = koinViewModel()
    val profileViewModel: ProfileViewModel = koinViewModel()

    val isAuthScreen = currentDestination?.let { dest ->
        dest.hasRoute<AppRoute.Welcome>() ||
            dest.hasRoute<AppRoute.Login>() ||
            dest.hasRoute<AppRoute.Otp>() ||
            dest.hasRoute<AppRoute.PolicySelection>() ||
            dest.hasRoute<AppRoute.MemberSelection>()
    } ?: true

    val isMainTabScreen = currentDestination?.let { dest ->
        dest.hasRoute<AppRoute.Home>() ||
            dest.hasRoute<AppRoute.Blogs>() ||
            dest.hasRoute<AppRoute.Calculators>()
    } ?: false

    val snackbarHostState = remember { SnackbarHostState() }

    // Navigate to Welcome on logout (when user was on a non-auth screen)
    LaunchedEffect(isLoggedIn) {
        if (!isLoggedIn && !isAuthScreen) {
            navController.navigate(AppRoute.Welcome) {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        topBar = {
            if (!isAuthScreen) {
                PruTopBar(
                    showBack = !isMainTabScreen,
                    showLogo = isMainTabScreen,
                    onBackClick = { navController.popBackStack() },
                    onNotificationClick = { navController.navigate(AppRoute.Notifications) },
                    onProfileClick = { navController.navigate(AppRoute.Profile) },
                    userInitial = currentUser?.name?.firstOrNull()?.uppercase() ?: "P",
                )
            }
        },
        bottomBar = {
            if (isMainTabScreen) {
                NavigationBar(
                    containerColor = PruColors.White,
                    contentColor = PruColors.Red,
                ) {
                    bottomNavItems.forEach { item ->
                        val isSelected = currentDestination?.hasRoute(item.route::class) == true
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                navController.navigate(item.route) {
                                    popUpTo(AppRoute.Home) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = if (isSelected) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.label,
                                )
                            },
                            label = {
                                Text(text = item.label, style = MaterialTheme.typography.labelSmall)
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = PruColors.Red,
                                selectedTextColor = PruColors.Red,
                                unselectedIconColor = PruColors.Gray500,
                                unselectedTextColor = PruColors.Gray500,
                                indicatorColor = PruColors.RedLight,
                            ),
                        )
                    }
                }
            }
        },
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = if (startLoggedIn) AppRoute.Home else AppRoute.Welcome,
            modifier = Modifier.padding(paddingValues),
        ) {
            // ---- AUTH FLOW (shared AuthViewModel) ----
            composable<AppRoute.Welcome> {
                WelcomeScreen(
                    onGetStarted = { navController.navigate(AppRoute.Login) },
                )
            }

            composable<AppRoute.Login> {
                LoginScreen(
                    viewModel = authViewModel,
                    onOtpSent = { navController.navigate(AppRoute.Otp) },
                    onTermsClick = { },
                )
            }

            composable<AppRoute.Otp> {
                OtpScreen(
                    viewModel = authViewModel,
                    onVerified = { navController.navigate(AppRoute.PolicySelection) },
                )
            }

            composable<AppRoute.PolicySelection> {
                PolicySelectionScreen(
                    viewModel = authViewModel,
                    onPolicySelected = { navController.navigate(AppRoute.MemberSelection) },
                )
            }

            composable<AppRoute.MemberSelection> {
                MemberSelectionScreen(
                    viewModel = authViewModel,
                    onComplete = {
                        navController.navigate(AppRoute.Home) {
                            popUpTo(AppRoute.Welcome) { inclusive = true }
                        }
                    },
                )
            }

            // ---- MAIN TABS (ViewModels created per-screen, not eagerly) ----
            composable<AppRoute.Home> {
                val vm: DashboardViewModel = koinViewModel()
                HomeScreen(viewModel = vm)
            }

            composable<AppRoute.Blogs> {
                val vm: ContentViewModel = koinViewModel()
                BlogsScreen(viewModel = vm)
            }

            composable<AppRoute.Calculators> {
                CalculatorsScreen(
                    viewModel = calculatorViewModel,
                    onCalculatorClick = { id ->
                        when (id) {
                            "heart_score" -> navController.navigate(AppRoute.HeartScoreDetail(id))
                            "qdiabetes" -> navController.navigate(AppRoute.QDiabetesCalculator)
                            "bmi" -> navController.navigate(AppRoute.BmiCalculator)
                            "bmr" -> navController.navigate(AppRoute.BmrCalculator)
                        }
                    },
                )
            }

            // ---- CALCULATOR SUB-SCREENS (shared calculatorViewModel) ----
            composable<AppRoute.HeartScoreDetail> {
                HeartScoreDetailScreen(
                    viewModel = calculatorViewModel,
                    onTakeTest = { navController.navigate(AppRoute.HeartScoreForm) },
                )
            }

            composable<AppRoute.HeartScoreForm> {
                HeartScoreFormScreen(
                    viewModel = calculatorViewModel,
                    onResult = { navController.navigate(AppRoute.HeartScoreResult) },
                )
            }

            composable<AppRoute.HeartScoreResult> {
                HeartScoreResultScreen(
                    viewModel = calculatorViewModel,
                    onRetake = {
                        calculatorViewModel.retakeTest()
                        navController.popBackStack(AppRoute.HeartScoreForm, inclusive = false)
                    },
                )
            }

            composable<AppRoute.QDiabetesCalculator> {
                QDiabetesScreen(
                    viewModel = calculatorViewModel,
                    onBack = { navController.popBackStack() },
                )
            }

            composable<AppRoute.BmiCalculator> {
                BmiCalculatorScreen(
                    viewModel = calculatorViewModel,
                    onBack = { navController.popBackStack() },
                )
            }

            composable<AppRoute.BmrCalculator> {
                BmrCalculatorScreen(
                    viewModel = calculatorViewModel,
                    onBack = { navController.popBackStack() },
                )
            }

            // ---- PROFILE (shared profileViewModel) ----
            composable<AppRoute.Profile> {
                ProfileScreen(
                    viewModel = profileViewModel,
                    onSettingsClick = { navController.navigate(AppRoute.Settings) },
                    onBack = { navController.popBackStack() },
                )
            }

            composable<AppRoute.Settings> {
                SettingsScreen(
                    viewModel = profileViewModel,
                    onBack = { navController.popBackStack() },
                )
            }

            composable<AppRoute.Notifications> {
                NotificationsScreen(
                    viewModel = profileViewModel,
                    onBack = { navController.popBackStack() },
                )
            }
        }
    }
}
