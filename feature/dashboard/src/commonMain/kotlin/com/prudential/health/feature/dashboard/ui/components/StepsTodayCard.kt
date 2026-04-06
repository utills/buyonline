package com.prudential.health.feature.dashboard.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.core.model.StepData
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.core.util.FormatUtils

@Composable
fun StepsTodayCard(
    stepData: StepData,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth()) {
        // Distance and Active time
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(PruColors.Gray50, RoundedCornerShape(12.dp))
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            StatItem(
                value = FormatUtils.formatDistance(stepData.totalActiveDistance),
                label = "Total active distance",
            )
            StatItem(
                value = FormatUtils.formatActiveTime(stepData.totalActiveTimeMinutes),
                label = "Total active time",
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Steps walked today with circular progress
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(PruColors.GreenLight, RoundedCornerShape(12.dp))
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                Text(
                    text = "Steps walked today",
                    style = MaterialTheme.typography.bodySmall,
                    color = PruColors.Gray700,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = FormatUtils.formatSteps(stepData.stepsToday),
                    style = MaterialTheme.typography.displayMedium,
                    fontWeight = FontWeight.Bold,
                    color = PruColors.Black,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "/ ${FormatUtils.formatSteps(stepData.goalSteps)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = PruColors.Gray600,
                )
            }

            // Circular progress
            CircularStepProgress(
                current = stepData.stepsToday,
                goal = stepData.goalSteps,
                modifier = Modifier.size(80.dp),
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Total healthy days
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(PruColors.YellowLight, RoundedCornerShape(12.dp))
                .padding(16.dp),
        ) {
            Text(
                text = "Total healthy days = ${stepData.totalHealthyDays}",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "You earn 1 healthy day everytime on completion of ${FormatUtils.formatSteps(stepData.goalSteps)} steps.",
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Gray700,
            )
        }
    }
}

@Composable
private fun StatItem(
    value: String,
    label: String,
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = PruColors.Gray600,
        )
    }
}

@Composable
fun CircularStepProgress(
    current: Int,
    goal: Int,
    modifier: Modifier = Modifier,
) {
    val progress = if (goal > 0) (current.toFloat() / goal.toFloat()).coerceIn(0f, 1f) else 0f
    val trackColor = PruColors.Gray200
    val progressColor = PruColors.ChartGreen

    Canvas(modifier = modifier) {
        val strokeWidth = 10.dp.toPx()
        val arcSize = size.minDimension - strokeWidth
        val topLeft = Offset(strokeWidth / 2, strokeWidth / 2)

        // Track
        drawArc(
            color = trackColor,
            startAngle = -90f,
            sweepAngle = 360f,
            useCenter = false,
            topLeft = topLeft,
            size = Size(arcSize, arcSize),
            style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
        )

        // Progress
        drawArc(
            color = progressColor,
            startAngle = -90f,
            sweepAngle = 360f * progress,
            useCenter = false,
            topLeft = topLeft,
            size = Size(arcSize, arcSize),
            style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
        )
    }
}
