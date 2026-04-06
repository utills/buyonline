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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AdminLineChart(
    data: List<Pair<Float, Float>>,
    xLabels: List<String>,
    title: String,
    modifier: Modifier = Modifier,
) {
    val lineColor = MaterialTheme.colorScheme.primary
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

                    val xMin = data.minOf { it.first }
                    val xMax = data.maxOf { it.first }
                    val yMin = data.minOf { it.second }
                    val yMax = data.maxOf { it.second }
                    val xRange = if (xMax == xMin) 1f else xMax - xMin
                    val yRange = if (yMax == yMin) 1f else yMax - yMin

                    // Grid lines (4 horizontal)
                    val gridLines = 4
                    for (i in 0..gridLines) {
                        val y = padTop + chartH * (1f - i.toFloat() / gridLines)
                        drawLine(
                            color = gridColor,
                            start = Offset(padLeft, y),
                            end = Offset(padLeft + chartW, y),
                            strokeWidth = 1f,
                        )
                    }

                    // Line path
                    val path = Path()
                    data.forEachIndexed { idx, (x, y) ->
                        val cx = padLeft + (x - xMin) / xRange * chartW
                        val cy = padTop + chartH * (1f - (y - yMin) / yRange)
                        if (idx == 0) path.moveTo(cx, cy) else path.lineTo(cx, cy)
                    }
                    drawPath(
                        path = path,
                        color = lineColor,
                        style = Stroke(width = 2.5f, cap = StrokeCap.Round),
                    )

                    // Data points
                    data.forEach { (x, y) ->
                        val cx = padLeft + (x - xMin) / xRange * chartW
                        val cy = padTop + chartH * (1f - (y - yMin) / yRange)
                        drawCircle(color = lineColor, radius = 4f, center = Offset(cx, cy))
                        drawCircle(
                            color = Color.White,
                            radius = 2f,
                            center = Offset(cx, cy),
                        )
                    }
                }

                // X-axis labels
                if (xLabels.isNotEmpty()) {
                    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)) {
                        xLabels.forEach { label ->
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
}
