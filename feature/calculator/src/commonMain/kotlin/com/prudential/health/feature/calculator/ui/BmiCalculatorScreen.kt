package com.prudential.health.feature.calculator.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.components.PruTextField
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.core.util.FormatUtils
import com.prudential.health.feature.calculator.viewmodel.CalculatorViewModel

@Composable
fun BmiCalculatorScreen(
    viewModel: CalculatorViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.bmiState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Text(
            text = "BMI",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Calculate the ratio of weight to height to assess body fat level",
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )

        Spacer(modifier = Modifier.height(24.dp))

        PruTextField(
            value = state.heightCm,
            onValueChange = { viewModel.updateBmiHeight(it) },
            label = "Height (cm)",
            placeholder = "e.g. 170",
            keyboardType = KeyboardType.Decimal,
        )

        Spacer(modifier = Modifier.height(16.dp))

        PruTextField(
            value = state.weightKg,
            onValueChange = { viewModel.updateBmiWeight(it) },
            label = "Weight (kg)",
            placeholder = "e.g. 70",
            keyboardType = KeyboardType.Decimal,
        )

        Spacer(modifier = Modifier.height(24.dp))

        PruPrimaryButton(
            text = "Calculate BMI",
            onClick = { viewModel.calculateBmi() },
            enabled = state.heightCm.isNotEmpty() && state.weightKg.isNotEmpty(),
        )

        state.error?.let { errorMsg ->
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = errorMsg,
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Red,
            )
        }

        state.result?.let { bmi ->
            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Results",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )

            Spacer(modifier = Modifier.height(16.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PruColors.GreenLight, RoundedCornerShape(16.dp))
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = "Your BMI is",
                    style = MaterialTheme.typography.bodyLarge,
                    color = PruColors.Gray700,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "${FormatUtils.formatDecimal(bmi)} kg/m²",
                    style = MaterialTheme.typography.displayMedium,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = state.category,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                    color = when (state.category) {
                        "Normal weight" -> PruColors.ChartGreen
                        "Underweight" -> PruColors.OrangeAccent
                        "Overweight" -> PruColors.OrangeAccent
                        else -> PruColors.Red
                    },
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // BMI ranges info
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PruColors.Gray50, RoundedCornerShape(16.dp))
                    .padding(20.dp),
            ) {
                Text("BMI Categories", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(12.dp))
                BmiRangeRow("Underweight", "< 18.5")
                BmiRangeRow("Normal weight", "18.5 - 24.9")
                BmiRangeRow("Overweight", "25.0 - 29.9")
                BmiRangeRow("Obese", ">= 30.0")
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Note: BMI is a screening tool and does not diagnose body fatness or health. It may be inaccurate for athletes, elderly individuals, and children. Consult a healthcare professional for a complete assessment.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun BmiRangeRow(label: String, range: String) {
    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(text = "$label: $range", style = MaterialTheme.typography.bodyMedium, color = PruColors.Gray700)
    }
}
