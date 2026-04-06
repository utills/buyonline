package com.prudential.health.console.feature.analytics

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.console.model.CalculatorUsageDto
import com.prudential.health.console.model.ConsentStatDto
import com.prudential.health.console.model.TopUserEntry
import com.prudential.health.console.ui.components.DataTable
import com.prudential.health.console.ui.components.FilterChipRow
import com.prudential.health.console.ui.components.KpiCard
import com.prudential.health.console.ui.components.TableColumn
import com.prudential.health.console.ui.components.charts.AdminLineChart
import com.prudential.health.console.ui.components.charts.AdminPieChart
import org.koin.compose.koinInject

private val PERIOD_OPTIONS = listOf("7", "14", "30", "90")

@Composable
fun StepTrendsScreen() {
    val viewModel: AnalyticsViewModel = koinInject()
    val state by viewModel.state.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp, vertical = 20.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        // Title + period filter
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                text = "Analytics",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface,
            )
            FilterChipRow(
                options = PERIOD_OPTIONS,
                selected = state.selectedDays.toString(),
                onSelect = { viewModel.onDaysChanged(it.toInt()) },
            )
        }

        when {
            state.isLoading && state.stepTrends.isEmpty() -> {
                Box(
                    modifier = Modifier.fillMaxWidth().height(300.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(modifier = Modifier.size(48.dp))
                }
            }

            state.error != null && state.stepTrends.isEmpty() -> {
                Box(
                    modifier = Modifier.fillMaxWidth().height(300.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Text(
                            text = state.error.orEmpty(),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.error,
                        )
                        Button(onClick = viewModel::refresh) {
                            Text(text = "Retry")
                        }
                    }
                }
            }

            else -> {
                // Step Trends line chart
                val trendData = state.stepTrends.mapIndexed { index, entry ->
                    Pair(index.toFloat(), entry.avgSteps.toFloat())
                }
                val trendLabels = state.stepTrends.map { it.date }
                AdminLineChart(
                    data = trendData,
                    xLabels = trendLabels,
                    title = "Step Trends (${state.selectedDays}d)",
                    modifier = Modifier.fillMaxWidth(),
                )

                // Platform breakdown + Calculator usage side by side
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    // Platform pie chart
                    val platformSlices = state.platforms.map { Pair(it.platform, it.count.toFloat()) }
                    AdminPieChart(
                        slices = platformSlices,
                        title = "Platform Breakdown",
                        modifier = Modifier.weight(1f),
                    )

                    // Calculator usage cards
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Text(
                            text = "Calculator Usage",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.padding(top = 4.dp),
                        )
                        if (state.calculatorUsage.isEmpty()) {
                            Text(
                                text = "No data available",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        } else {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                state.calculatorUsage.forEach { calc ->
                                    CalculatorUsageCard(
                                        calc = calc,
                                        modifier = Modifier.weight(1f),
                                    )
                                }
                            }
                        }
                    }
                }

                // Top Users table
                SectionTitle(text = "Top Users")
                if (state.topUsers.isEmpty()) {
                    EmptyState(message = "No top users data available")
                } else {
                    val topUsersColumns = listOf<TableColumn<TopUserEntry>>(
                        TableColumn(header = "Name", weight = 2f) { entry ->
                            Text(
                                text = entry.name,
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 1,
                            )
                        },
                        TableColumn(header = "Phone", weight = 1.5f) { entry ->
                            Text(
                                text = entry.phone,
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 1,
                            )
                        },
                        TableColumn(header = "Steps (30d)", weight = 1.5f) { entry ->
                            Text(
                                text = "%,d".format(entry.totalSteps),
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 1,
                            )
                        },
                        TableColumn(header = "Healthy Days", weight = 1.5f) { entry ->
                            Text(
                                text = entry.healthyDays.toString(),
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 1,
                            )
                        },
                        TableColumn(header = "Policy", weight = 2f) { entry ->
                            Text(
                                text = entry.policyNumber ?: "—",
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 1,
                            )
                        },
                    )
                    DataTable(
                        columns = topUsersColumns,
                        rows = state.topUsers,
                        modifier = Modifier.fillMaxWidth().height(320.dp),
                    )
                }

                // Consent Stats table
                SectionTitle(text = "Consent Stats")
                if (state.consentStats.isEmpty()) {
                    EmptyState(message = "No consent data available")
                } else {
                    val consentColumns = listOf<TableColumn<ConsentStatDto>>(
                        TableColumn(header = "Type", weight = 2f) { stat ->
                            Text(
                                text = stat.consentType,
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 1,
                            )
                        },
                        TableColumn(header = "Accepted", weight = 1.5f) { stat ->
                            Text(
                                text = stat.acceptedCount.toString(),
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 1,
                            )
                        },
                        TableColumn(header = "Total", weight = 1.5f) { stat ->
                            Text(
                                text = stat.totalUsers.toString(),
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 1,
                            )
                        },
                        TableColumn(header = "Compliance Rate", weight = 1.5f) { stat ->
                            Text(
                                text = "${"%.1f".format(stat.complianceRate * 100)}%",
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 1,
                            )
                        },
                    )
                    DataTable(
                        columns = consentColumns,
                        rows = state.consentStats,
                        modifier = Modifier.fillMaxWidth().height(
                            (48 + state.consentStats.size * 44).coerceAtMost(280).dp,
                        ),
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.onSurface,
    )
}

@Composable
private fun EmptyState(message: String) {
    Text(
        text = message,
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}

@Composable
private fun CalculatorUsageCard(
    calc: CalculatorUsageDto,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = calc.calculatorType,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
            )
            Text(
                text = "${calc.usageCount} uses",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
            )
            if (calc.avgScore > 0.0) {
                Text(
                    text = "Avg: ${"%.1f".format(calc.avgScore)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
