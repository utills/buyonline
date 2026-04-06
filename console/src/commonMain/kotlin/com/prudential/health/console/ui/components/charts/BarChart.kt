package com.prudential.health.console.ui.components.charts

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AdminBarChart(
    data: List<Pair<String, Float>>,
    title: String,
    modifier: Modifier = Modifier,
) {
    val barColor = MaterialTheme.colorScheme.primary
    val gridColor = MaterialTheme.colorScheme.outlineVariant
    val labelColor = MaterialTheme.colorScheme.onSurfaceVariant

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Spacer(modifier = Modifier.height(12.dp))

            if (data.isEmpty()) {
                Text(
                    text = "No data available",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            } else {
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                ) {
                    val padLeft = 40f
                    val padRight = 16f
                    val padTop = 16f
                    val padBottom = 36f
                    val chartW = size.width - padLeft - padRight
                    val chartH = size.height - padTop - padBottom

                    val maxValue = data.maxOf { it.second }.coerceAtLeast(1f)
                    val gridLines = 4

                    // Horizontal grid lines
                    for (i in 0..gridLines) {
                        val y = padTop + chartH * (1f - i.toFloat() / gridLines)
                        drawLine(
                            color = gridColor,
                            start = Offset(padLeft, y),
                            end = Offset(padLeft + chartW, y),
                            strokeWidth = 1f,
                        )
                    }

                    val count = data.size
                    val groupWidth = chartW / count
                    val barWidth = groupWidth * 0.6f

                    data.forEachIndexed { i, (_, value) ->
                        val barH = (value / maxValue) * chartH
                        val left = padLeft + i * groupWidth + (groupWidth - barWidth) / 2f
                        val top = padTop + chartH - barH

                        drawRoundRect(
                            color = barColor,
                            topLeft = Offset(left, top),
                            size = Size(barWidth, barH),
                            cornerRadius = CornerRadius(3f, 3f),
                        )
                    }
                }

                // X-axis labels
                Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp)) {
                    data.forEach { (label, _) ->
                        Text(
                            text = label,
                            modifier = Modifier.weight(1f),
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                            color = labelColor,
                            textAlign = TextAlign.Center,
                            maxLines = 1,
                        )
                    }
                }
            }
        }
    }
}
