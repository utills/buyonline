package com.prudential.health.feature.profile.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.core.model.AppNotification
import com.prudential.health.core.model.NotificationType
import com.prudential.health.core.ui.components.PruCard
import com.prudential.health.core.ui.components.PruEmptyState
import com.prudential.health.core.ui.components.PruLoadingIndicator
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.feature.profile.viewmodel.ProfileViewModel

@Composable
fun NotificationsScreen(
    viewModel: ProfileViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.notificationsState.collectAsState()

    if (state.isLoading && state.notifications.isEmpty()) {
        PruLoadingIndicator()
        return
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .padding(16.dp),
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                )
            }
            Text(
                text = "Notifications",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Promotional banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(PruColors.PinkGradientStart, PruColors.PinkGradientEnd),
                    ),
                    shape = RoundedCornerShape(16.dp),
                )
                .padding(20.dp),
        ) {
            Column {
                Text(
                    text = "Enjoy 35% off on premium",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "All you have to do is achieve 250 healthy days.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = PruColors.Gray700,
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        state.error?.let { error ->
            Text(
                text = error,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(16.dp),
            )
        }

        if (state.notifications.isEmpty() && !state.isLoading) {
            Box(
                modifier = Modifier.fillMaxWidth().padding(32.dp),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.Notifications,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "No notifications yet",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.bodyLarge,
                    )
                }
            }
        }

        // Notification list
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(state.notifications.take(100)) { notification ->
                NotificationItem(notification = notification)
            }
        }
    }
}

@Composable
private fun NotificationItem(notification: AppNotification) {
    PruCard {
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.Top,
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(PruColors.RedLight),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = when (notification.type) {
                        NotificationType.TARGET_COMPLETED -> Icons.Default.CheckCircle
                        NotificationType.TARGET_INCOMPLETE -> Icons.Default.Warning
                        NotificationType.PENDING_CONNECTION -> Icons.Default.Info
                        NotificationType.PROMOTION -> Icons.Default.Notifications
                        NotificationType.GENERAL -> Icons.Default.Info
                    },
                    contentDescription = null,
                    tint = PruColors.Red,
                    modifier = Modifier.size(24.dp),
                )
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = notification.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = notification.message,
                    style = MaterialTheme.typography.bodySmall,
                    color = PruColors.Gray600,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = notification.timestamp,
                    style = MaterialTheme.typography.labelSmall,
                    color = PruColors.Gray400,
                )
            }
        }
    }
}
