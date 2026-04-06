package com.prudential.health.feature.dashboard.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.core.model.HealthPlatform
import com.prudential.health.core.ui.theme.PruColors

@Composable
fun ConnectHealthCard(
    onConnectGoogleFit: (HealthPlatform) -> Unit,
    onConnectAppleHealth: (HealthPlatform) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(PruColors.PinkGradientStart, PruColors.PinkGradientEnd),
                ),
                shape = RoundedCornerShape(16.dp),
            )
            .padding(24.dp),
    ) {
        Text(
            text = "Get rewarded for\nbeing healthy!",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = "Integrate Pru Health app with\nGoogle Fit or Apple Health",
            style = MaterialTheme.typography.bodyLarge,
            color = PruColors.Gray700,
        )
        Spacer(modifier = Modifier.height(24.dp))

        // Google Fit button
        ConnectButton(
            label = "Connect with Google Fit",
            icon = Icons.Default.FavoriteBorder,
            onClick = { onConnectGoogleFit(HealthPlatform.GOOGLE_FIT) },
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Apple Health button
        ConnectButton(
            label = "Connect with Apple Health",
            icon = Icons.Default.Favorite,
            iconTint = PruColors.Red,
            onClick = { onConnectAppleHealth(HealthPlatform.APPLE_HEALTH) },
        )
    }
}

@Composable
private fun ConnectButton(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    iconTint: androidx.compose.ui.graphics.Color = PruColors.ChartGreen,
) {
    Button(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(26.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = PruColors.Red,
            contentColor = PruColors.White,
        ),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconTint,
                modifier = Modifier.size(24.dp),
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
            )
        }
    }
}
