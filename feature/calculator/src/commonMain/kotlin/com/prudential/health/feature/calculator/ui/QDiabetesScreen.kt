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
import com.prudential.health.core.ui.components.YesNoToggle
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.core.util.FormatUtils
import com.prudential.health.feature.calculator.viewmodel.CalculatorViewModel

@Composable
fun QDiabetesScreen(
    viewModel: CalculatorViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.qDiabetesState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Text(
            text = "QDiabetes",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Calculate if you have a high risk of type 2 diabetes",
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )

        Spacer(modifier = Modifier.height(24.dp))

        PruTextField(
            value = state.age,
            onValueChange = { viewModel.updateQDiabetesAge(it) },
            label = "Age (25-84)",
            placeholder = "Enter your age",
            keyboardType = KeyboardType.Number,
        )

        Spacer(modifier = Modifier.height(16.dp))

        PruDropdown(
            label = "Gender",
            selectedValue = state.gender,
            options = listOf("Male", "Female"),
            onValueSelected = { viewModel.updateQDiabetesGender(it) },
        )

        Spacer(modifier = Modifier.height(16.dp))

        PruDropdown(
            label = "Ethnicity",
            selectedValue = state.ethnicity,
            options = listOf("White", "Indian", "Pakistani", "Bangladeshi", "Other Asian", "Black Caribbean", "Black African", "Chinese", "Other"),
            onValueSelected = { viewModel.updateQDiabetesEthnicity(it) },
            placeholder = "Select ethnicity",
        )

        Spacer(modifier = Modifier.height(16.dp))

        PruDropdown(
            label = "Smoking status",
            selectedValue = state.smokingStatus,
            options = listOf("Non-smoker", "Ex-smoker", "Light smoker", "Moderate smoker", "Heavy smoker"),
            onValueSelected = { viewModel.updateQDiabetesSmokingStatus(it) },
            placeholder = "Select status",
        )

        Spacer(modifier = Modifier.height(16.dp))

        PruTextField(
            value = state.bmi,
            onValueChange = { viewModel.updateQDiabetesBmi(it) },
            label = "BMI (kg/m²)",
            placeholder = "e.g. 25.5",
            keyboardType = KeyboardType.Decimal,
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text("Family history of diabetes?", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(8.dp))
        YesNoToggle(value = state.familyHistoryDiabetes, onValueChange = { viewModel.updateQDiabetesFamilyHistory(it) })

        Spacer(modifier = Modifier.height(16.dp))

        Text("On blood pressure treatment?", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(8.dp))
        YesNoToggle(value = state.highBloodPressureTreatment, onValueChange = { viewModel.updateQDiabetesBpTreatment(it) })

        Spacer(modifier = Modifier.height(16.dp))

        Text("Regular use of corticosteroids?", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(8.dp))
        YesNoToggle(value = state.steroidsUse, onValueChange = { viewModel.updateQDiabetesSteroids(it) })

        if (state.gender == "Female") {
            Spacer(modifier = Modifier.height(16.dp))
            Text("History of gestational diabetes?", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(8.dp))
            YesNoToggle(value = state.gestationalDiabetes, onValueChange = { viewModel.updateQDiabetesGestational(it) })

            Spacer(modifier = Modifier.height(16.dp))
            Text("Polycystic ovary syndrome?", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(8.dp))
            YesNoToggle(value = state.polycysticOvaries, onValueChange = { viewModel.updateQDiabetesPolycystic(it) })
        }

        Spacer(modifier = Modifier.height(24.dp))

        PruPrimaryButton(
            text = "Calculate risk",
            onClick = { viewModel.calculateQDiabetesRisk() },
            enabled = state.age.isNotEmpty() && state.bmi.isNotEmpty() && !state.isLoading,
        )

        state.error?.let { errorMsg ->
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = errorMsg,
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Red,
            )
        }

        state.result?.let { riskPercent ->
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
                    .background(
                        when (state.riskLevel) {
                            "Low risk" -> PruColors.GreenLight
                            "Moderate risk" -> PruColors.YellowLight
                            else -> PruColors.RedLight
                        },
                        RoundedCornerShape(16.dp),
                    )
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = "Your 10-year risk of developing type 2 diabetes is:",
                    style = MaterialTheme.typography.bodyLarge,
                    color = PruColors.Gray700,
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "${FormatUtils.formatDecimal(riskPercent, 1)}%",
                    style = MaterialTheme.typography.displayLarge,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = state.riskLevel,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                    color = when (state.riskLevel) {
                        "Low risk" -> PruColors.ChartGreen
                        "Moderate risk" -> PruColors.OrangeAccent
                        else -> PruColors.Red
                    },
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PruColors.Gray50, RoundedCornerShape(16.dp))
                    .padding(20.dp),
            ) {
                Text("What does this mean?", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "This score estimates your risk of developing type 2 diabetes over the next 10 years based on your risk factors. A score above 5.6% is considered elevated. Speak with your doctor about lifestyle changes and monitoring.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = PruColors.Gray600,
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
