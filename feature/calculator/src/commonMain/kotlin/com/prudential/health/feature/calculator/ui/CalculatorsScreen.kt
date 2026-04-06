package com.prudential.health.feature.calculator.ui

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.prudential.health.core.model.CalculatorInfo
import com.prudential.health.core.ui.components.PruCard
import com.prudential.health.core.ui.components.PruLoadingIndicator
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.feature.calculator.viewmodel.CalculatorViewModel

@Composable
fun CalculatorsScreen(
    viewModel: CalculatorViewModel,
    onCalculatorClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val listState by viewModel.listState.collectAsState()

    if (listState.isLoading && listState.calculators.isEmpty()) {
        PruLoadingIndicator()
        return
    }

    if (listState.calculators.isEmpty() && !listState.isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(
                text = "No calculators available",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        return
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .padding(horizontal = 16.dp),
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = buildAnnotatedString {
                append("Calculate your ")
                withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
                    append("health metrics")
                }
            },
            style = MaterialTheme.typography.headlineLarge,
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Monitor your health with our suite of calculators",
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )

        Spacer(modifier = Modifier.height(20.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            items(listState.calculators) { calculator ->
                CalculatorCard(
                    calculator = calculator,
                    onClick = { onCalculatorClick(calculator.id) },
                )
            }
            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}

@Composable
private fun CalculatorCard(
    calculator: CalculatorInfo,
    onClick: () -> Unit,
) {
    PruCard(onClick = onClick) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = calculator.name,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                    )
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                        contentDescription = "Open",
                        tint = PruColors.Red,
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = calculator.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = PruColors.Gray600,
                )
            }

            // Icon
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .background(PruColors.RedLight, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = when (calculator.id) {
                        "heart_score" -> Icons.Default.FavoriteBorder
                        "qdiabetes" -> Icons.Default.Favorite
                        "bmi" -> Icons.Default.Star
                        "bmr" -> Icons.Default.Star
                        else -> Icons.Default.Favorite
                    },
                    contentDescription = calculator.name,
                    tint = PruColors.Red,
                    modifier = Modifier.size(32.dp),
                )
            }
        }

        // Previous score if available
        if (calculator.previousScore != null) {
            Spacer(modifier = Modifier.height(8.dp))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PruColors.YellowLight, RoundedCornerShape(8.dp))
                    .padding(12.dp),
            ) {
                Text(
                    text = "Previous score: ${calculator.previousScore}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )
                val scoreMessage = calculator.previousScoreMessage
                if (scoreMessage != null) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = scoreMessage,
                        style = MaterialTheme.typography.bodySmall,
                        color = PruColors.Gray700,
                    )
                }
            }
        }
    }
}
