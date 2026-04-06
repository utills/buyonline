package com.prudential.health.console.ui.shell

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.prudential.health.console.model.AdminUser
import com.prudential.health.console.navigation.ConsoleRoute

@Composable
fun ConsoleShell(
    currentRoute: ConsoleRoute,
    onNavigate: (ConsoleRoute) -> Unit,
    onSignOut: () -> Unit,
    adminUser: AdminUser?,
    content: @Composable BoxScope.() -> Unit,
) {
    Row(modifier = Modifier.fillMaxSize()) {
        Sidebar(
            currentRoute = currentRoute,
            onNavigate = onNavigate,
            onSignOut = onSignOut,
            adminUser = adminUser,
        )
        VerticalDivider()
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxHeight(),
            content = content,
        )
    }
}
