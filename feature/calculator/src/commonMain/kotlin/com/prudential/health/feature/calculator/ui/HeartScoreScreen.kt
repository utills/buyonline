package com.prudential.health.feature.calculator.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.prudential.health.core.model.Gender
import com.prudential.health.core.ui.components.PruDropdown
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.components.PruTextField
import com.prudential.health.core.ui.components.YesNoToggle
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.core.util.FormatUtils
import com.prudential.health.feature.calculator.viewmodel.CalculatorViewModel

@Composable
fun HeartScoreDetailScreen(
    viewModel: CalculatorViewModel,
    onTakeTest: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.heartScoreState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Text(
            text = "Heart score",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Calculate the risk of developing a heart attack or stroke",
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Take the test card
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(PruColors.Gray50, RoundedCornerShape(16.dp))
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = "Cardiac risk check",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(modifier = Modifier.height(12.dp))
            PruPrimaryButton(
                text = "Take the test",
                onClick = {
                    viewModel.showHeartScoreForm()
                    onTakeTest()
                },
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "This calculator site should not be used for direct patient care by health professionals. This calculator is only valid if you do not already have a diagnosis of coronary heart disease (including angina or heart attack) or stroke/transient ischaemic attack, and not on statins.",
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Gray500,
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Common queries
        Text(
            text = "Common queries",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
        )

        Spacer(modifier = Modifier.height(12.dp))

        state.commonQueries.forEachIndexed { index, query ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.onQueryToggled(index) }
                    .padding(vertical = 12.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = query.question,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.weight(1f),
                    )
                    Icon(
                        imageVector = if (state.expandedQueryIndex == index) {
                            Icons.Default.KeyboardArrowUp
                        } else {
                            Icons.Default.KeyboardArrowDown
                        },
                        contentDescription = null,
                        tint = PruColors.Gray600,
                    )
                }
                AnimatedVisibility(visible = state.expandedQueryIndex == index) {
                    Text(
                        text = query.answer,
                        style = MaterialTheme.typography.bodyMedium,
                        color = PruColors.Gray600,
                        modifier = Modifier.padding(top = 8.dp),
                    )
                }
                HorizontalDivider(modifier = Modifier.padding(top = 12.dp), color = PruColors.Gray200)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun HeartScoreFormScreen(
    viewModel: CalculatorViewModel,
    onResult: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.heartScoreState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Text(
            text = "Heart score",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Calculate the risk of developing a heart attack or stroke",
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Age
        PruTextField(
            value = state.input.age?.toString() ?: "",
            onValueChange = viewModel::onAgeChanged,
            label = "Enter Age (25-84)",
            placeholder = "Placeholder",
            keyboardType = KeyboardType.Number,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Gender
        PruDropdown(
            label = "Gender",
            selectedValue = state.input.gender.name.lowercase().replaceFirstChar { it.uppercase() },
            options = Gender.entries.map { it.name.lowercase().replaceFirstChar { c -> c.uppercase() } },
            onValueSelected = { viewModel.onGenderChanged(Gender.valueOf(it.uppercase())) },
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Smoking status
        PruDropdown(
            label = "Smoking status",
            selectedValue = state.input.smokingStatus,
            options = listOf("Non-smoker", "Ex-smoker", "Light smoker", "Moderate smoker", "Heavy smoker"),
            onValueSelected = viewModel::onSmokingStatusChanged,
            placeholder = "Select status",
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Diabetes status
        PruDropdown(
            label = "Diabetes status",
            selectedValue = state.input.diabetesStatus,
            options = listOf("None", "Type 1", "Type 2"),
            onValueSelected = viewModel::onDiabetesStatusChanged,
            placeholder = "Select status",
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Boolean questions
        val booleanQuestions = listOf(
            "angina" to "Angina or heart attack in a 1st degree relative < 60?",
            "kidney" to "Chronic kidney disease (stage 3, 4 or 5)?",
            "fibrillation" to "Atrial fibrillation?",
            "migraines" to "Do you have migraines?",
            "arthritis" to "Rheumatoid arthritis?",
            "sle" to "Systemic lupus erythematosus (SLE)?",
            "mental" to "Severe mental illness?",
            "antipsychotic" to "On atypical antipsychotic medication?",
            "steroid" to "Are you on regular steroid tablets?",
            "erectile" to "A diagnosis of or treatment for erectile dysfunction?",
        )

        booleanQuestions.forEach { (field, question) ->
            val currentValue = when (field) {
                "angina" -> state.input.hasAnginaFamilyHistory
                "kidney" -> state.input.hasChronicKidneyDisease
                "fibrillation" -> state.input.hasAtrialFibrillation
                "migraines" -> state.input.hasMigraines
                "arthritis" -> state.input.hasRheumatoidArthritis
                "sle" -> state.input.hasSLE
                "mental" -> state.input.hasSevereMentalIllness
                "antipsychotic" -> state.input.onAntipsychoticMedication
                "steroid" -> state.input.onSteroidTablets
                "erectile" -> state.input.hasErectileDysfunction
                else -> false
            }
            Text(
                text = question,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Medium,
            )
            Spacer(modifier = Modifier.height(8.dp))
            YesNoToggle(
                value = currentValue,
                onValueChange = { viewModel.onBooleanFieldChanged(field, it) },
            )
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Numeric inputs
        PruTextField(
            value = state.input.cholesterolHdlRatio?.toString() ?: "",
            onValueChange = viewModel::onCholesterolChanged,
            label = "Cholesterol/HDL ratio",
            keyboardType = KeyboardType.Decimal,
        )
        Spacer(modifier = Modifier.height(16.dp))

        PruTextField(
            value = state.input.systolicBP?.toString() ?: "",
            onValueChange = viewModel::onSystolicBPChanged,
            label = "Systolic blood pressure (mmHg)",
            keyboardType = KeyboardType.Decimal,
        )
        Spacer(modifier = Modifier.height(16.dp))

        PruTextField(
            value = state.input.systolicBPStdDev?.toString() ?: "",
            onValueChange = viewModel::onSystolicBPStdDevChanged,
            label = "Standard deviation of at least two most recent systolic blood pressure readings (mmHg)",
            keyboardType = KeyboardType.Decimal,
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Body mass index section
        Text(
            text = "Body mass index",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(12.dp))

        PruTextField(
            value = state.input.heightCm?.toString() ?: "",
            onValueChange = viewModel::onHeightChanged,
            label = "Height (cm)",
            keyboardType = KeyboardType.Decimal,
        )
        Spacer(modifier = Modifier.height(16.dp))

        PruTextField(
            value = state.input.weightKg?.toString() ?: "",
            onValueChange = viewModel::onWeightChanged,
            label = "Weight (kg)",
            keyboardType = KeyboardType.Decimal,
        )

        Spacer(modifier = Modifier.height(24.dp))

        PruPrimaryButton(
            text = if (state.isLoading) "Calculating..." else "Calculate risk",
            onClick = { viewModel.calculateHeartScore() },
            enabled = !state.isLoading,
        )

        state.error?.let { error ->
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = error,
                color = PruColors.RedDark,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center,
            )
        }

        // State-driven navigation
        LaunchedEffect(state.showResult) {
            if (state.showResult) onResult()
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun HeartScoreResultScreen(
    viewModel: CalculatorViewModel,
    onRetake: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.heartScoreState.collectAsState()
    val result = state.result

    if (result == null) {
        Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = PruColors.Red)
        }
        return
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Text(
            text = "Heart score",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Calculate the risk of developing a heart attack or stroke",
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Results",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Risk result card
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(PruColors.YellowLight, RoundedCornerShape(16.dp))
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = "Your risk of having a heart attack or stroke within the next 10 years is:",
                style = MaterialTheme.typography.bodyLarge,
                color = PruColors.Gray700,
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "${result.riskPercent.toInt()}%",
                style = MaterialTheme.typography.displayLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(16.dp))
            PruPrimaryButton(
                text = "Retake the test",
                onClick = {
                    viewModel.retakeTest()
                    onRetake()
                },
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "This calculator site should not be used for direct patient care by health professionals. This calculator is only valid if you do not already have a diagnosis of coronary heart disease (including angina or heart attack) or stroke/transient ischaemic attack, and not on statins.",
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Gray500,
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // BMI section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(PruColors.YellowLight, RoundedCornerShape(16.dp))
                .padding(24.dp),
        ) {
            Text(
                text = "BMI",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = PruColors.OrangeAccent,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Your body mass index was calculated as",
                style = MaterialTheme.typography.bodyMedium,
                color = PruColors.Gray700,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "${FormatUtils.formatDecimal(result.bmi)} kg/m2.",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // QRISK comparison
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(PruColors.Gray50, RoundedCornerShape(16.dp))
                .padding(24.dp),
        ) {
            Text(
                text = "How does your 10-year score compare?",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
            )

            Spacer(modifier = Modifier.height(16.dp))

            ScoreRow("Your 10-year QRISK\u00ae3 score", "${result.qrisk3Score}%")
            ScoreRow("The score of a healthy person with the same age, sex, and ethnicity*", "${result.healthyPersonScore}%")
            ScoreRow("Relative risk**", "${result.relativeRisk}")
            ScoreRow("Your QRISK\u00ae3 Healthy Heart Age***", "${result.healthyHeartAge}")

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "* This is the score of a healthy person of your age, sex and ethnic group, i.e. with no adverse clinical indicators and a cholesterol ratio of 4.0, a stable systolic blood pressure of 125, and BMI of 25.",
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "** Your relative risk is your risk divided by the healthy person's risk.",
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "*** Your QRISK\u00ae3 Healthy Heart Age is the age at which a healthy person of your sex and ethnicity has your 10-year QRISK3 score.",
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Gray600,
            )
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun ScoreRow(label: String, value: String) {
    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray700,
        )
        Text(
            text = value,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
        )
    }
}
