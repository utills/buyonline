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
import com.prudential.health.core.ui.components.PruDropdown
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.components.PruTextField
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.core.util.FormatUtils
import com.prudential.health.feature.calculator.viewmodel.CalculatorViewModel
import kotlin.math.roundToInt

@Composable
fun BmrCalculatorScreen(
    viewModel: CalculatorViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.bmrState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Text(
            text = "BMR",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Calculate the amount of energy expended while at rest",
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )

        Spacer(modifier = Modifier.height(24.dp))

        PruTextField(
            value = state.age,
            onValueChange = { viewModel.updateBmrAge(it) },
            label = "Age",
            placeholder = "e.g. 30",
            keyboardType = KeyboardType.Number,
        )

        Spacer(modifier = Modifier.height(16.dp))

        PruDropdown(
            label = "Gender",
            selectedValue = state.gender,
            options = listOf("Male", "Female"),
            onValueSelected = { viewModel.updateBmrGender(it) },
        )

        Spacer(modifier = Modifier.height(16.dp))

        PruTextField(
            value = state.heightCm,
            onValueChange = { viewModel.updateBmrHeight(it) },
            label = "Height (cm)",
            placeholder = "e.g. 170",
            keyboardType = KeyboardType.Decimal,
        )

        Spacer(modifier = Modifier.height(16.dp))

        PruTextField(
            value = state.weightKg,
            onValueChange = { viewModel.updateBmrWeight(it) },
            label = "Weight (kg)",
            placeholder = "e.g. 70",
            keyboardType = KeyboardType.Decimal,
        )

        Spacer(modifier = Modifier.height(24.dp))

        PruPrimaryButton(
            text = "Calculate BMR",
            onClick = { viewModel.calculateBmr() },
            enabled = state.age.isNotEmpty() && state.heightCm.isNotEmpty() && state.weightKg.isNotEmpty(),
        )

        state.error?.let { errorMsg ->
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = errorMsg,
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Red,
            )
        }

        state.result?.let { bmr ->
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
                    text = "Your Basal Metabolic Rate is",
                    style = MaterialTheme.typography.bodyLarge,
                    color = PruColors.Gray700,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "${FormatUtils.formatDecimal(bmr, 1)} kcal/day",
                    style = MaterialTheme.typography.displayMedium,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "This is the number of calories your body needs at rest to maintain basic life-sustaining functions.",
                    style = MaterialTheme.typography.bodySmall,
                    color = PruColors.Gray600,
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Daily calorie needs
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PruColors.Gray50, RoundedCornerShape(16.dp))
                    .padding(20.dp),
            ) {
                Text(
                    "Estimated Daily Calorie Needs",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(12.dp))
                CalorieRow("Sedentary (little/no exercise)", "${(bmr * 1.2).roundToInt()}")
                CalorieRow("Lightly active (1-3 days/week)", "${(bmr * 1.375).roundToInt()}")
                CalorieRow("Moderately active (3-5 days/week)", "${(bmr * 1.55).roundToInt()}")
                CalorieRow("Very active (6-7 days/week)", "${(bmr * 1.725).roundToInt()}")
                CalorieRow("Extra active (very intense)", "${(bmr * 1.9).roundToInt()}")
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun CalorieRow(label: String, calories: String) {
    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(text = label, style = MaterialTheme.typography.bodySmall, color = PruColors.Gray600)
        Text(text = "$calories kcal/day", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
    }
}
