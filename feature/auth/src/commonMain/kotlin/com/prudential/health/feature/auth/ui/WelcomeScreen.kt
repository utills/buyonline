package com.prudential.health.feature.auth.ui

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.theme.PruColors

@Composable
fun WelcomeScreen(
    onGetStarted: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val infiniteTransition = rememberInfiniteTransition(label = "welcome")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "pulse",
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White),
    ) {
        // Hero section with animated illustration
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .background(PruColors.Gray50),
            contentAlignment = Alignment.Center,
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(32.dp),
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
                    color = PruColors.Black,
                )
                Spacer(modifier = Modifier.height(40.dp))

                // Animated health illustration
                Box(
                    modifier = Modifier.size(200.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    // Pulsing background rings
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val center = Offset(size.width / 2, size.height / 2)
                        val outerRadius = size.minDimension / 2 * pulseScale
                        drawCircle(
                            color = PruColors.RedLight,
                            radius = outerRadius,
                            center = center,
                        )
                        drawCircle(
                            color = PruColors.PinkGradientStart,
                            radius = outerRadius * 0.75f,
                            center = center,
                        )
                    }

                    // Step counter ring
                    Canvas(
                        modifier = Modifier
                            .size(120.dp)
                            .align(Alignment.Center),
                    ) {
                        val strokeWidth = 8.dp.toPx()
                        val arcSize = size.minDimension - strokeWidth
                        val topLeft = Offset(strokeWidth / 2, strokeWidth / 2)

                        drawArc(
                            color = Color(0xFFE0E0E0),
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
                            sweepAngle = 270f * pulseScale,
                            useCenter = false,
                            topLeft = topLeft,
                            size = Size(arcSize, arcSize),
                            style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
                        )
                    }

                    // Center heart icon
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(PruColors.Red),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = "10K",
                            style = MaterialTheme.typography.titleMedium,
                            color = PruColors.White,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Walking dots animation
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp),
                ) {
                    val dotCount = 5
                    val dotRadius = 3.dp.toPx()
                    val spacing = size.width / (dotCount + 1)
                    repeat(dotCount) { i ->
                        val alpha = ((i + 1).toFloat() / dotCount) * pulseScale
                        drawCircle(
                            color = PruColors.Red.copy(alpha = alpha),
                            radius = dotRadius,
                            center = Offset(spacing * (i + 1), size.height / 2),
                        )
                    }
                }
            }
        }

        // Bottom section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = "Walk Your Way to Rewards",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "Track your 10K daily steps and unlock exclusive premium offers",
                style = MaterialTheme.typography.bodyLarge,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(8.dp))
            PruPrimaryButton(
                text = "Lets get started",
                onClick = onGetStarted,
            )
        }
    }
}
