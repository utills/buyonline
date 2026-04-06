package com.prudential.health.console.ui.shell

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Article
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.prudential.health.console.model.AdminUser
import com.prudential.health.console.navigation.ConsoleRoute
import com.prudential.health.core.ui.theme.PruColors

data class SidebarItem(
    val route: ConsoleRoute,
    val label: String,
    val icon: ImageVector,
)

val mainNavItems = listOf(
    SidebarItem(ConsoleRoute.Overview, "Overview", Icons.Default.Dashboard),
    SidebarItem(ConsoleRoute.Analytics, "Analytics", Icons.Default.BarChart),
    SidebarItem(ConsoleRoute.Users, "Users", Icons.Default.Group),
    SidebarItem(ConsoleRoute.Policies, "Policies", Icons.Default.Policy),
    SidebarItem(ConsoleRoute.Content, "Content", Icons.AutoMirrored.Filled.Article),
    SidebarItem(ConsoleRoute.Reports, "Reports", Icons.Default.Assessment),
)

val bottomNavItems = listOf(
    SidebarItem(ConsoleRoute.Settings, "Settings", Icons.Default.AdminPanelSettings),
)

@Composable
fun Sidebar(
    currentRoute: ConsoleRoute,
    onNavigate: (ConsoleRoute) -> Unit,
    onSignOut: () -> Unit,
    adminUser: AdminUser?,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .width(220.dp)
            .fillMaxHeight()
            .background(MaterialTheme.colorScheme.surfaceVariant),
    ) {
        // Logo + Title
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 20.dp),
        ) {
            Text(
                text = "PruHealth",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = PruColors.Red,
            )
            Text(
                text = "Console",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        HorizontalDivider(modifier = Modifier.padding(horizontal = 12.dp))
        Spacer(modifier = Modifier.height(8.dp))

        // Main nav items
        mainNavItems.forEach { item ->
            SidebarNavItem(
                item = item,
                isSelected = currentRoute == item.route,
                onClick = { onNavigate(item.route) },
            )
        }

        Spacer(modifier = Modifier.weight(1f))
        HorizontalDivider(modifier = Modifier.padding(horizontal = 12.dp))
        Spacer(modifier = Modifier.height(8.dp))

        // Bottom nav items
        bottomNavItems.forEach { item ->
            SidebarNavItem(
                item = item,
                isSelected = currentRoute == item.route,
                onClick = { onNavigate(item.route) },
            )
        }

        // Admin info + sign out
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                imageVector = Icons.Default.AccountCircle,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(32.dp),
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = adminUser?.name ?: "Admin",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Medium,
                )
                Text(
                    text = adminUser?.role?.name?.lowercase()?.replaceFirstChar { it.uppercase() } ?: "",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            IconButton(onClick = onSignOut) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Logout,
                    contentDescription = "Sign out",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
    }
}

@Composable
private fun SidebarNavItem(
    item: SidebarItem,
    isSelected: Boolean,
    onClick: () -> Unit,
) {
    NavigationDrawerItem(
        icon = { Icon(item.icon, contentDescription = item.label) },
        label = { Text(item.label) },
        selected = isSelected,
        onClick = onClick,
        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
    )
}
