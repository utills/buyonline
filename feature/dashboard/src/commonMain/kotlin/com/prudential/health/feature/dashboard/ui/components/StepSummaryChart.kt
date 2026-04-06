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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.core.model.StepSummary
import com.prudential.health.core.model.SummaryPeriod
import com.prudential.health.core.ui.theme.PruColors

@Composable
fun StepSummaryChart(
    weeklySummary: StepSummary,
    monthlySummary: StepSummary,
    yearlySummary: StepSummary,
    selectedPeriod: SummaryPeriod,
    onPeriodSelected: (SummaryPeriod) -> Unit,
    modifier: Modifier = Modifier,
) {
    val currentSummary = when (selectedPeriod) {
        SummaryPeriod.WEEKLY -> weeklySummary
        SummaryPeriod.MONTHLY -> monthlySummary
        SummaryPeriod.YEARLY -> yearlySummary
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(PruColors.Gray50, RoundedCornerShape(16.dp))
            .padding(20.dp),
    ) {
        Text(
            text = "Your steps summary",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Period tabs
        val periods = SummaryPeriod.entries
        val selectedIndex = periods.indexOf(selectedPeriod)

        TabRow(
            selectedTabIndex = selectedIndex,
            containerColor = Color.Transparent,
            contentColor = PruColors.Black,
            indicator = { tabPositions ->
                if (selectedIndex < tabPositions.size) {
                    TabRowDefaults.SecondaryIndicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[selectedIndex]),
                        color = PruColors.Red,
                    )
                }
            },
            divider = {},
        ) {
            periods.forEachIndexed { index, period ->
                Tab(
                    selected = index == selectedIndex,
                    onClick = { onPeriodSelected(period) },
                    text = {
                        Text(
                            text = period.name.lowercase().replaceFirstChar { it.uppercase() },
                            fontWeight = if (index == selectedIndex) FontWeight.Bold else FontWeight.Normal,
                            style = MaterialTheme.typography.titleSmall,
                        )
                    },
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Total ${currentSummary.totalHealthyDays} healthy days this ${selectedPeriod.name.lowercase()}",
            style = MaterialTheme.typography.bodySmall,
            color = PruColors.Gray600,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Bar chart
        BarChart(
            entries = currentSummary.entries,
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp),
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Legend
        Row(
            horizontalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth(),
        ) {
            LegendItem(color = PruColors.ChartBar, label = "No of steps")
            Spacer(modifier = Modifier.width(24.dp))
            LegendItem(color = PruColors.Red, label = ">10k steps")
        }
    }
}

@Composable
private fun BarChart(
    entries: List<com.prudential.health.core.model.StepSummaryEntry>,
    modifier: Modifier = Modifier,
) {
    if (entries.isEmpty()) {
        Box(
            modifier = modifier,
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "No data available",
                style = MaterialTheme.typography.bodyMedium,
                color = PruColors.Gray500,
            )
        }
        return
    }

    val maxSteps = entries.maxOfOrNull { it.steps }?.toFloat()?.coerceAtLeast(1f) ?: 1f
    val barColor = PruColors.ChartBar
    val highlightColor = PruColors.ChartBarHighlight
    val goalThreshold = 10_000

    Column(modifier = modifier) {
        // Chart area
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
        ) {
            val barCount = entries.size.coerceAtLeast(1)
            val spacing = 8.dp.toPx()
            val totalSpacing = (barCount + 1) * spacing
            val barWidth = ((size.width - totalSpacing) / barCount).coerceAtLeast(4.dp.toPx())
            val chartHeight = size.height

            entries.forEachIndexed { index, entry ->
                val ratio = if (maxSteps > 0) entry.steps / maxSteps else 0f
                val barHeight = (ratio * chartHeight * 0.9f).coerceAtLeast(2.dp.toPx())
                val x = spacing + index * (barWidth + spacing)
                val y = chartHeight - barHeight
                val color = if (entry.steps >= goalThreshold) highlightColor else barColor

                drawRoundRect(
                    color = color,
                    topLeft = Offset(x, y),
                    size = Size(barWidth, barHeight),
                    cornerRadius = CornerRadius(4.dp.toPx()),
                )
            }
        }

        // Labels row - aligned with bars
        Spacer(modifier = Modifier.height(4.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            entries.forEach { entry ->
                Text(
                    text = entry.label,
                    style = MaterialTheme.typography.labelSmall,
                    color = PruColors.Gray600,
                )
            }
        }
    }
}

@Composable
private fun LegendItem(
    color: Color,
    label: String,
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .background(color, CircleShape),
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = PruColors.Gray600,
        )
    }
}
