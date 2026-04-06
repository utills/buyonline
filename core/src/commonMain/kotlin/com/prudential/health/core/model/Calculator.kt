package com.prudential.health.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CalculatorInfo(
    val id: String = "",
    val name: String = "",
    val description: String = "",
    val previousScore: String? = null,
    val previousScoreMessage: String? = null,
)

@Serializable
data class HeartScoreInput(
    val age: Int? = null,
    val gender: Gender = Gender.FEMALE,
    val smokingStatus: String = "",
    val diabetesStatus: String = "",
    val hasAnginaFamilyHistory: Boolean = false,
    val hasChronicKidneyDisease: Boolean = false,
    val hasAtrialFibrillation: Boolean = false,
    val hasMigraines: Boolean = false,
    val hasRheumatoidArthritis: Boolean = false,
    val hasSLE: Boolean = false,
    val hasSevereMentalIllness: Boolean = false,
    val onAntipsychoticMedication: Boolean = false,
    val onSteroidTablets: Boolean = false,
    val hasErectileDysfunction: Boolean = false,
    val cholesterolHdlRatio: Double? = null,
    val systolicBP: Double? = null,
    val systolicBPStdDev: Double? = null,
    val heightCm: Double? = null,
    val weightKg: Double? = null,
)

@Serializable
enum class Gender {
    @SerialName("male") MALE,
    @SerialName("female") FEMALE,
}

@Serializable
data class HeartScoreResult(
    val riskPercent: Double = 0.0,
    val bmi: Double = 0.0,
    val qrisk3Score: Double = 0.0,
    val healthyPersonScore: Double = 0.0,
    val relativeRisk: Double = 0.0,
    val healthyHeartAge: Int = 0,
)

@Serializable
data class CommonQuery(
    val question: String = "",
    val answer: String = "",
)

@Serializable
data class QDiabetesResult(
    val riskPercent: Double = 0.0,
    val riskLevel: String = "",
)
