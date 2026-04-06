package com.prudential.health.server.service

import com.prudential.health.server.database.CalculatorResultsTable
import com.prudential.health.server.database.DatabaseFactory.dbQuery
import com.prudential.health.server.model.CalculatorInfoDto
import com.prudential.health.server.model.HeartScoreInputDto
import com.prudential.health.server.model.HeartScoreResultDto
import com.prudential.health.server.model.QDiabetesInputDto
import com.prudential.health.server.model.QDiabetesResultDto
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import kotlin.math.pow
import kotlin.math.roundToInt

class CalculatorService {

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun getCalculatorHistory(userId: Int): List<CalculatorInfoDto> = dbQuery {
        val previousResults = CalculatorResultsTable.selectAll()
            .where { CalculatorResultsTable.userId eq userId }
            .orderBy(CalculatorResultsTable.createdAt, SortOrder.DESC)
            .toList()

        val heartScorePrev = previousResults.firstOrNull {
            it[CalculatorResultsTable.calculatorType] == "heart_score"
        }

        listOf(
            CalculatorInfoDto(
                id = "heart_score",
                name = "Heart score",
                description = "Calculate the risk of developing a heart attack or stroke",
                previousScore = heartScorePrev?.get(CalculatorResultsTable.score)?.let { "${it}%" },
                previousScoreMessage = heartScorePrev?.get(CalculatorResultsTable.score)?.toDoubleOrNull()?.let { score ->
                    when {
                        score < 10 -> "Your risk is low"
                        score < 20 -> "Your risk is moderate"
                        else -> "You are at higher risk"
                    }
                },
            ),
            CalculatorInfoDto(
                id = "qdiabetes",
                name = "QDiabetes",
                description = "Calculate if you have a high risk of type 2 diabetes",
            ),
            CalculatorInfoDto(
                id = "bmi",
                name = "BMI",
                description = "Calculate the ratio of weight to height to assess body fat level.",
            ),
            CalculatorInfoDto(
                id = "bmr",
                name = "BMR",
                description = "Calculate the amount of energy expended while at rest",
            ),
        )
    }

    /**
     * Simplified cardiovascular risk estimator.
     *
     * NOTE: This is NOT a validated QRISK3 implementation. It uses a basic additive
     * scoring model for demonstration purposes only. Before any clinical or
     * production use, this MUST be replaced with the fully validated QRISK3
     * algorithm using peer-reviewed coefficients from ClinRisk Ltd.
     * See: https://qrisk.org/
     */
    suspend fun calculateHeartScore(userId: Int, input: HeartScoreInputDto): HeartScoreResultDto {
        val heightM = ((input.heightCm ?: 170.0) / 100.0).coerceAtLeast(0.01)
        val weight = input.weightKg ?: 70.0
        val bmi = weight / (heightM * heightM)
        val age = input.age ?: 30

        // Simplified risk scoring (additive model, NOT validated QRISK3)
        var riskScore = 0.0
        riskScore += (age - 25).coerceAtLeast(0) * 0.3
        if (input.gender == "male") riskScore += 2.0
        if (input.smokingStatus.contains("heavy", ignoreCase = true)) riskScore += 5.0
        else if (input.smokingStatus.contains("moderate", ignoreCase = true)) riskScore += 3.0
        else if (input.smokingStatus.contains("light", ignoreCase = true)) riskScore += 1.5
        if (input.diabetesStatus == "Type 1") riskScore += 6.0
        else if (input.diabetesStatus == "Type 2") riskScore += 4.0
        if (input.hasAnginaFamilyHistory) riskScore += 3.0
        if (input.hasChronicKidneyDisease) riskScore += 2.5
        if (input.hasAtrialFibrillation) riskScore += 4.0
        if (input.hasRheumatoidArthritis) riskScore += 1.0
        if (input.hasSLE) riskScore += 1.5
        if (input.hasSevereMentalIllness) riskScore += 1.0
        if (bmi > 30) riskScore += 2.0
        else if (bmi > 25) riskScore += 1.0
        val systolic = input.systolicBP ?: 120.0
        if (systolic > 160) riskScore += 4.0
        else if (systolic > 140) riskScore += 2.0

        val riskPercent = riskScore.coerceIn(0.0, 100.0)
        val healthyPersonScore = ((age - 25).coerceAtLeast(0) * 0.1 + 0.3).coerceIn(0.3, 100.0)
        val relativeRisk = if (healthyPersonScore > 0) {
            (riskPercent / healthyPersonScore * 10).roundToInt() / 10.0
        } else 1.0
        val excessRiskYears = ((riskPercent - healthyPersonScore) * 0.5).toInt().coerceAtLeast(0)
        val healthyHeartAge = (age + excessRiskYears).coerceIn(age, 120)

        val result = HeartScoreResultDto(
            riskPercent = (riskPercent * 10).roundToInt() / 10.0,
            bmi = (bmi * 100).roundToInt() / 100.0,
            qrisk3Score = (riskPercent * 10).roundToInt() / 10.0,
            healthyPersonScore = (healthyPersonScore * 10).roundToInt() / 10.0,
            relativeRisk = relativeRisk,
            healthyHeartAge = healthyHeartAge,
        )

        // Store result
        dbQuery {
            CalculatorResultsTable.insert {
                it[this.userId] = userId
                it[calculatorType] = "heart_score"
                it[inputJson] = json.encodeToString(input)
                it[resultJson] = json.encodeToString(result)
                it[score] = riskPercent.roundToInt().toString()
                it[createdAt] = Clock.System.now().toLocalDateTime(TimeZone.UTC)
            }
        }

        return result
    }

    /**
     * Simplified QDiabetes-like risk estimator.
     *
     * NOTE: This is NOT the validated QDiabetes algorithm. It uses a basic additive
     * scoring model for demonstration purposes only. Before any clinical or production
     * use, this MUST be replaced with the fully validated QDiabetes algorithm.
     * See: https://qdiabetes.org/
     */
    suspend fun calculateQDiabetes(userId: Int, input: QDiabetesInputDto): QDiabetesResultDto {
        val age = input.age.toDoubleOrNull() ?: 40.0
        val bmi = input.bmi.toDoubleOrNull() ?: 25.0

        var riskScore = 0.0
        riskScore += (age - 25.0).coerceAtLeast(0.0) * 0.15
        if (bmi >= 35) riskScore += 4.0
        else if (bmi >= 30) riskScore += 2.5
        else if (bmi >= 25) riskScore += 1.0
        if (input.gender == "Male") riskScore += 0.5
        riskScore += when (input.ethnicity) {
            "Indian", "Pakistani", "Bangladeshi" -> 2.5
            "Other Asian", "Chinese" -> 1.5
            "Black Caribbean", "Black African" -> 1.0
            else -> 0.0
        }
        riskScore += when {
            input.smokingStatus.contains("heavy", ignoreCase = true) -> 1.5
            input.smokingStatus.contains("moderate", ignoreCase = true) -> 1.0
            input.smokingStatus.contains("light", ignoreCase = true) -> 0.5
            else -> 0.0
        }
        if (input.familyHistoryDiabetes) riskScore += 3.0
        if (input.highBloodPressureTreatment) riskScore += 1.5
        if (input.steroidsUse) riskScore += 2.0
        if (input.gestationalDiabetes) riskScore += 4.5
        if (input.polycysticOvaries) riskScore += 2.5

        val riskPercent = riskScore.coerceIn(0.0, 100.0)
        val riskLevel = when {
            riskPercent < 5.6 -> "Low risk"
            riskPercent < 10.0 -> "Moderate risk"
            else -> "High risk"
        }

        dbQuery {
            CalculatorResultsTable.insert {
                it[this.userId] = userId
                it[calculatorType] = "qdiabetes"
                it[inputJson] = json.encodeToString(input)
                it[CalculatorResultsTable.score] = "%.1f".format(riskPercent)
                it[resultJson] = json.encodeToString(QDiabetesResultDto(riskPercent = riskPercent, riskLevel = riskLevel))
                it[createdAt] = Clock.System.now().toLocalDateTime(TimeZone.UTC)
            }
        }

        return QDiabetesResultDto(riskPercent = (riskPercent * 10).roundToInt() / 10.0, riskLevel = riskLevel)
    }
}
