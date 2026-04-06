package com.prudential.health.feature.dashboard.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.prudential.health.core.model.HealthJourneyMilestone
import com.prudential.health.core.ui.theme.PruColors

@Composable
fun HealthJourneySection(
    milestones: List<HealthJourneyMilestone>,
    totalHealthyDays: Int,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(PruColors.RedSurface, RoundedCornerShape(16.dp))
            .padding(20.dp),
    ) {
        Text(
            text = buildAnnotatedString {
                append("Your journey of\n")
                withStyle(SpanStyle(fontWeight = FontWeight.Bold, color = PruColors.ChartGreen)) {
                    append("healthy days")
                }
            },
            style = MaterialTheme.typography.headlineMedium,
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Milestone progression
        milestones.forEach { milestone ->
            val isAchieved = totalHealthyDays >= milestone.targetDays
            MilestoneItem(
                milestone = milestone,
                isAchieved = isAchieved,
            )
            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

@Composable
private fun MilestoneItem(
    milestone: HealthJourneyMilestone,
    isAchieved: Boolean,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        if (isAchieved) {
            Text(
                text = "Congratulations!\nYou get ${milestone.discountPercent}% off\non premium",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = PruColors.ChartGreen,
            )
        } else {
            Text(
                text = buildAnnotatedString {
                    append("Get ${milestone.discountPercent}% off on\npremium ")
                    withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
                        append("on\ncompletion of\n${milestone.targetDays} days")
                    }
                },
                style = MaterialTheme.typography.bodyLarge,
            )
        }

        // Days badge
        Column(
            modifier = Modifier
                .background(
                    if (isAchieved) PruColors.ChartGreen else PruColors.Red,
                    RoundedCornerShape(8.dp),
                )
                .padding(horizontal = 12.dp, vertical = 6.dp),
        ) {
            Text(
                text = "${milestone.targetDays} days",
                style = MaterialTheme.typography.labelMedium,
                color = PruColors.White,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}
