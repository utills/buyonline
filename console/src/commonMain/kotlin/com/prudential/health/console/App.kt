package com.prudential.health.console

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import com.prudential.health.console.navigation.ConsoleNavHost
import com.prudential.health.core.ui.theme.PruHealthTheme

@Composable
fun ConsoleApp() {
    PruHealthTheme(darkTheme = false) {
        ConsoleNavHost()
    }
}
