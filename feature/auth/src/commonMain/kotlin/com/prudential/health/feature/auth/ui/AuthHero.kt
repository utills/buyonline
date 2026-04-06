package com.prudential.health.feature.auth.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.core.ui.theme.PruColors

/**
 * Shared hero section for auth flow screens (Login, OTP, Policy Selection).
 * Displays Prudential branding with a health-themed visual.
 */
@Composable
fun AuthHeroSection(
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(PruColors.Gray50),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(24.dp),
        ) {
            Text(
                text = "PRUDENTIAL",
                style = MaterialTheme.typography.headlineMedium,
                color = PruColors.Red,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Pru Health App",
                style = MaterialTheme.typography.displaySmall,
                fontWeight = FontWeight.Bold,
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Health visual - step ring with decorative elements
            Box(
                modifier = Modifier.size(140.dp),
                contentAlignment = Alignment.Center,
            ) {
                // Decorative circles
                Canvas(modifier = Modifier.size(140.dp)) {
                    val center = Offset(size.width / 2, size.height / 2)
                    drawCircle(
                        color = PruColors.RedLight,
                        radius = size.minDimension / 2,
                        center = center,
                    )
                    drawCircle(
                        color = PruColors.PinkGradientStart,
                        radius = size.minDimension / 2 * 0.7f,
                        center = center,
                    )
                }

                // Step ring
                Canvas(modifier = Modifier.size(80.dp)) {
                    val strokeWidth = 6.dp.toPx()
                    val arcSize = size.minDimension - strokeWidth
                    val topLeft = Offset(strokeWidth / 2, strokeWidth / 2)
                    drawArc(
                        color = PruColors.Gray200,
                        startAngle = -90f,
                        sweepAngle = 360f,
                        useCenter = false,
                        topLeft = topLeft,
                        size = Size(arcSize, arcSize),
                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
                    )
                    drawArc(
                        color = PruColors.ChartGreen,
                        startAngle = -90f,
                        sweepAngle = 240f,
                        useCenter = false,
                        topLeft = topLeft,
                        size = Size(arcSize, arcSize),
                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
                    )
                }

                // Center badge
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(PruColors.Red),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "10K",
                        style = MaterialTheme.typography.labelMedium,
                        color = PruColors.White,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}
