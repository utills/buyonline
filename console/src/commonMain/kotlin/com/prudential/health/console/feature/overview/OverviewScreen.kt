package com.prudential.health.console.feature.overview

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.prudential.health.console.ui.components.KpiCard
import org.koin.compose.koinInject

@Composable
fun OverviewScreen() {
    val viewModel: OverviewViewModel = koinInject()
    val state by viewModel.state.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            text = "Overview",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onSurface,
        )

        when {
            state.isLoading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(modifier = Modifier.size(48.dp))
                }
            }

            state.error != null -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
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

            state.kpis != null -> {
                val kpis = state.kpis!!
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 220.dp),
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = PaddingValues(bottom = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    item {
                        KpiCard(
                            title = "Total Users",
                            value = kpis.totalUsers.toString(),
                            changePercent = kpis.userGrowthPercent,
                        )
                    }
                    item {
                        KpiCard(
                            title = "Active Today",
                            value = kpis.activeUsersToday.toString(),
                        )
                    }
                    item {
                        KpiCard(
                            title = "Avg Steps Today",
                            value = kpis.avgStepsToday.toString(),
                            changePercent = kpis.stepsChangePercent,
                        )
                    }
                    item {
                        KpiCard(
                            title = "Healthy Days (Month)",
                            value = kpis.totalHealthyDaysThisMonth.toString(),
                        )
                    }
                    item {
                        KpiCard(
                            title = "User Growth",
                            value = "${"%.1f".format(kpis.userGrowthPercent)}%",
                            changePercent = kpis.userGrowthPercent,
                        )
                    }
                    item {
                        KpiCard(
                            title = "Steps Change",
                            value = "${"%.1f".format(kpis.stepsChangePercent)}%",
                            changePercent = kpis.stepsChangePercent,
                        )
                    }
                }
            }
        }
    }
}
