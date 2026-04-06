package com.prudential.health.core.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.prudential.health.core.ui.theme.PruColors

@Composable
fun OfflineBanner(
    isVisible: Boolean,
    modifier: Modifier = Modifier,
    message: String = "No internet connection. Some features may be unavailable.",
) {
    AnimatedVisibility(
        visible = isVisible,
        enter = expandVertically(),
        exit = shrinkVertically(),
        modifier = modifier,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(PruColors.YellowWarning.copy(alpha = 0.15f))
                .padding(horizontal = 16.dp, vertical = 10.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Offline",
                    tint = PruColors.OrangeAccent,
                    modifier = Modifier.size(18.dp),
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodySmall,
                    color = PruColors.Gray800,
                )
            }
        }
    }
}

@Composable
fun ErrorRetryCard(
    message: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    PruCard(modifier = modifier) {
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray700,
        )
        Spacer(modifier = Modifier.padding(top = 12.dp))
        PruPrimaryButton(
            text = "Retry",
            onClick = onRetry,
        )
    }
}
