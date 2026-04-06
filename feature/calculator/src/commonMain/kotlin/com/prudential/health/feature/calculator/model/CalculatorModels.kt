package com.prudential.health.feature.calculator.model

import com.prudential.health.core.model.CalculatorInfo
import com.prudential.health.core.model.CommonQuery
import com.prudential.health.core.model.HeartScoreInput
import com.prudential.health.core.model.HeartScoreResult
import com.prudential.health.core.model.QDiabetesResult
import kotlinx.serialization.Serializable

data class CalculatorListUiState(
    val calculators: List<CalculatorInfo> = defaultCalculators,
    val isLoading: Boolean = false,
)

data class HeartScoreUiState(
    val input: HeartScoreInput = HeartScoreInput(),
    val result: HeartScoreResult? = null,
    val commonQueries: List<CommonQuery> = defaultQueries,
    val expandedQueryIndex: Int? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val showForm: Boolean = false,
    val showResult: Boolean = false,
)

val defaultCalculators = listOf(
    CalculatorInfo(
        id = "heart_score",
        name = "Heart score",
        description = "Calculate the risk of developing a heart attack or stroke",
    ),
    CalculatorInfo(
        id = "qdiabetes",
        name = "QDiabetes",
        description = "Calculate if you have a high risk of type 2 diabetes",
    ),
    CalculatorInfo(
        id = "bmi",
        name = "BMI",
        description = "Calculate the ratio of weight to height to assess body fat level.",
    ),
    CalculatorInfo(
        id = "bmr",
        name = "BMR",
        description = "Calculate the amount of energy expended while at rest",
    ),
)

data class BmiState(
    val heightCm: String = "",
    val weightKg: String = "",
    val result: Double? = null,
    val category: String = "",
    val error: String? = null,
)

data class BmrState(
    val age: String = "",
    val heightCm: String = "",
    val weightKg: String = "",
    val gender: String = "Male",
    val result: Double? = null,
    val error: String? = null,
)

data class QDiabetesState(
    val age: String = "",
    val gender: String = "Female",
    val bmi: String = "",
    val ethnicity: String = "",
    val smokingStatus: String = "",
    val familyHistoryDiabetes: Boolean? = null,
    val highBloodPressureTreatment: Boolean? = null,
    val steroidsUse: Boolean? = null,
    val gestationalDiabetes: Boolean? = null,
    val polycysticOvaries: Boolean? = null,
    val result: Double? = null,
    val riskLevel: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
)

@Serializable
data class QDiabetesRequest(
    val age: String,
    val gender: String,
    val bmi: String,
    val ethnicity: String,
    val smokingStatus: String,
    val familyHistoryDiabetes: Boolean,
    val highBloodPressureTreatment: Boolean,
    val steroidsUse: Boolean,
    val gestationalDiabetes: Boolean,
    val polycysticOvaries: Boolean,
)

val defaultQueries = listOf(
    CommonQuery(
        question = "What is the QRISK\u00ae3 score?",
        answer = "QRISK3 is a prediction algorithm for cardiovascular disease that estimates the 10-year risk of heart attack or stroke.",
    ),
    CommonQuery(
        question = "Has QRISK\u00ae3 been validated?",
        answer = "Yes, QRISK3 has been extensively validated in large populations and is recommended by NICE guidelines.",
    ),
    CommonQuery(
        question = "What is cardiovascular disease?",
        answer = "Cardiovascular disease (CVD) refers to conditions that affect the heart or blood vessels, including coronary heart disease, stroke, and peripheral arterial disease. Risk factors include high blood pressure, smoking, high cholesterol, diabetes, obesity, and physical inactivity.",
    ),
    CommonQuery(
        question = "What does 10 year risk of cardiovascular disease mean and why is it important?",
        answer = "It represents the probability that you will develop cardiovascular disease within the next 10 years based on your current risk factors.",
    ),
)
