package com.prudential.health

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import kotlinx.coroutines.withTimeoutOrNull
import com.prudential.health.core.ui.components.PruLoadingIndicator
import com.prudential.health.core.ui.theme.PruHealthTheme
import com.prudential.health.core.util.SessionManager
import com.prudential.health.di.allModules
import com.prudential.health.navigation.AppNavGraph
import org.koin.compose.KoinApplication
import org.koin.compose.koinInject

@Composable
fun App() {
    KoinApplication(application = {
        modules(allModules)
    }) {
        PruHealthTheme {
            val sessionManager: SessionManager = koinInject()
            var isRestoring by remember { mutableStateOf(true) }

            LaunchedEffect(Unit) {
                try {
                    withTimeoutOrNull(3_000L) {
                        sessionManager.restoreSession()
                    } ?: run {
                        // Timeout: clear potentially corrupted session
                        sessionManager.logout()
                    }
                } catch (_: Exception) {
                    sessionManager.logout()
                }
                isRestoring = false
            }

            if (isRestoring) {
                PruLoadingIndicator()
            } else {
                val isLoggedIn by sessionManager.isLoggedIn.collectAsState()
                AppNavGraph(startLoggedIn = isLoggedIn)
            }
        }
    }
}
