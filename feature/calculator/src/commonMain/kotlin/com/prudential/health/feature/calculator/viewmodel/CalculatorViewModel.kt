package com.prudential.health.feature.calculator.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.core.model.Gender
import com.prudential.health.core.model.HeartScoreInput
import com.prudential.health.core.network.NetworkResult
import com.prudential.health.feature.calculator.model.BmiState
import com.prudential.health.feature.calculator.model.BmrState
import com.prudential.health.feature.calculator.model.CalculatorListUiState
import com.prudential.health.feature.calculator.model.HeartScoreUiState
import com.prudential.health.feature.calculator.model.QDiabetesState
import com.prudential.health.feature.calculator.repository.CalculatorRepository
import kotlin.math.roundToInt
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class CalculatorViewModel(
    private val repository: CalculatorRepository,
) : ViewModel() {

    private val _listState = MutableStateFlow(CalculatorListUiState())
    val listState: StateFlow<CalculatorListUiState> = _listState.asStateFlow()

    private val _heartScoreState = MutableStateFlow(HeartScoreUiState())
    val heartScoreState: StateFlow<HeartScoreUiState> = _heartScoreState.asStateFlow()

    private val _bmiState = MutableStateFlow(BmiState())
    val bmiState: StateFlow<BmiState> = _bmiState.asStateFlow()

    private val _bmrState = MutableStateFlow(BmrState())
    val bmrState: StateFlow<BmrState> = _bmrState.asStateFlow()

    private val _qDiabetesState = MutableStateFlow(QDiabetesState())
    val qDiabetesState: StateFlow<QDiabetesState> = _qDiabetesState.asStateFlow()

    init {
        loadCalculators()
    }

    private fun loadCalculators() {
        viewModelScope.launch {
            _listState.update { it.copy(isLoading = true) }
            repository.loadCalculators()
            _listState.update { it.copy(isLoading = false) }
        }

        viewModelScope.launch {
            repository.calculators.collect { calcs ->
                if (calcs.isNotEmpty()) {
                    _listState.update { it.copy(calculators = calcs) }
                }
            }
        }
    }

    fun showHeartScoreForm() {
        _heartScoreState.update { it.copy(showForm = true, showResult = false) }
    }

    fun onAgeChanged(age: String) {
        val ageInt = age.toIntOrNull()
        _heartScoreState.update { it.copy(input = it.input.copy(age = ageInt)) }
    }

    fun onGenderChanged(gender: Gender) {
        _heartScoreState.update { it.copy(input = it.input.copy(gender = gender)) }
    }

    fun onSmokingStatusChanged(status: String) {
        _heartScoreState.update { it.copy(input = it.input.copy(smokingStatus = status)) }
    }

    fun onDiabetesStatusChanged(status: String) {
        _heartScoreState.update { it.copy(input = it.input.copy(diabetesStatus = status)) }
    }

    fun onBooleanFieldChanged(field: String, value: Boolean) {
        _heartScoreState.update { state ->
            val input = state.input
            val updated = when (field) {
                "angina" -> input.copy(hasAnginaFamilyHistory = value)
                "kidney" -> input.copy(hasChronicKidneyDisease = value)
                "fibrillation" -> input.copy(hasAtrialFibrillation = value)
                "migraines" -> input.copy(hasMigraines = value)
                "arthritis" -> input.copy(hasRheumatoidArthritis = value)
                "sle" -> input.copy(hasSLE = value)
                "mental" -> input.copy(hasSevereMentalIllness = value)
                "antipsychotic" -> input.copy(onAntipsychoticMedication = value)
                "steroid" -> input.copy(onSteroidTablets = value)
                "erectile" -> input.copy(hasErectileDysfunction = value)
                else -> input
            }
            state.copy(input = updated)
        }
    }

    fun onCholesterolChanged(value: String) {
        _heartScoreState.update {
            it.copy(input = it.input.copy(cholesterolHdlRatio = value.toDoubleOrNull()))
        }
    }

    fun onSystolicBPChanged(value: String) {
        _heartScoreState.update {
            it.copy(input = it.input.copy(systolicBP = value.toDoubleOrNull()))
        }
    }

    fun onSystolicBPStdDevChanged(value: String) {
        _heartScoreState.update {
            it.copy(input = it.input.copy(systolicBPStdDev = value.toDoubleOrNull()))
        }
    }

    fun onHeightChanged(value: String) {
        _heartScoreState.update {
            it.copy(input = it.input.copy(heightCm = value.toDoubleOrNull()))
        }
    }

    fun onWeightChanged(value: String) {
        _heartScoreState.update {
            it.copy(input = it.input.copy(weightKg = value.toDoubleOrNull()))
        }
    }

    fun calculateHeartScore() {
        val input = _heartScoreState.value.input
        val age = input.age
        if (age == null || age !in 25..84) {
            _heartScoreState.update { it.copy(error = "Age must be between 25 and 84") }
            return
        }
        val cholesterol = input.cholesterolHdlRatio
        if (cholesterol == null || cholesterol !in 1.0..12.0) {
            _heartScoreState.update { it.copy(error = "Cholesterol/HDL ratio must be between 1.0 and 12.0") }
            return
        }
        val sbp = input.systolicBP
        if (sbp == null || sbp !in 70.0..210.0) {
            _heartScoreState.update { it.copy(error = "Systolic blood pressure must be between 70 and 210") }
            return
        }
        val sbpStdDev = input.systolicBPStdDev
        if (sbpStdDev == null || sbpStdDev !in 0.0..60.0) {
            _heartScoreState.update { it.copy(error = "Systolic BP variability must be between 0 and 60") }
            return
        }
        viewModelScope.launch {
            _heartScoreState.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.calculateHeartScore(input)) {
                is NetworkResult.Success -> {
                    _heartScoreState.update {
                        it.copy(
                            isLoading = false,
                            result = result.data,
                            showResult = true,
                            showForm = false,
                        )
                    }
                }
                is NetworkResult.Error -> {
                    _heartScoreState.update {
                        it.copy(isLoading = false, error = result.message)
                    }
                }
                else -> {}
            }
        }
    }

    fun onQueryToggled(index: Int) {
        _heartScoreState.update {
            it.copy(expandedQueryIndex = if (it.expandedQueryIndex == index) null else index)
        }
    }

    fun resetHeartScore() {
        _heartScoreState.update {
            HeartScoreUiState()
        }
        viewModelScope.launch {
            repository.clearHeartScoreResult()
        }
    }

    fun retakeTest() {
        _heartScoreState.update {
            HeartScoreUiState(showForm = true)
        }
    }

    // ---- BMI ----

    fun updateBmiHeight(value: String) {
        _bmiState.update { it.copy(heightCm = value, error = null) }
    }

    fun updateBmiWeight(value: String) {
        _bmiState.update { it.copy(weightKg = value, error = null) }
    }

    fun calculateBmi() {
        val state = _bmiState.value
        val weight = state.weightKg.toDoubleOrNull()
        val heightCm = state.heightCm.toDoubleOrNull()

        when {
            weight == null || weight !in 10.0..500.0 -> {
                _bmiState.update { it.copy(error = "Weight must be between 10 and 500 kg") }
                return
            }
            heightCm == null || heightCm !in 50.0..250.0 -> {
                _bmiState.update { it.copy(error = "Height must be between 50 and 250 cm") }
                return
            }
        }

        val safeHeight = heightCm ?: return
        val safeWeight = weight ?: return
        val hm = safeHeight / 100.0
        val bmi = safeWeight / (hm * hm)
        val rounded = (bmi * 100).roundToInt() / 100.0
        val category = when {
            bmi < 18.5 -> "Underweight"
            bmi < 25.0 -> "Normal weight"
            bmi < 30.0 -> "Overweight"
            else -> "Obese"
        }
        _bmiState.update { it.copy(result = rounded, category = category, error = null) }
    }

    // ---- BMR ----

    fun updateBmrAge(value: String) {
        _bmrState.update { it.copy(age = value, error = null) }
    }

    fun updateBmrHeight(value: String) {
        _bmrState.update { it.copy(heightCm = value, error = null) }
    }

    fun updateBmrWeight(value: String) {
        _bmrState.update { it.copy(weightKg = value, error = null) }
    }

    fun updateBmrGender(value: String) {
        _bmrState.update { it.copy(gender = value) }
    }

    fun calculateBmr() {
        val state = _bmrState.value
        val age = state.age.toIntOrNull()
        val weight = state.weightKg.toDoubleOrNull()
        val height = state.heightCm.toDoubleOrNull()

        when {
            age == null || age !in 15..100 -> {
                _bmrState.update { it.copy(error = "Age must be between 15 and 100") }
                return
            }
            weight == null || weight !in 10.0..500.0 -> {
                _bmrState.update { it.copy(error = "Weight must be between 10 and 500 kg") }
                return
            }
            height == null || height !in 50.0..250.0 -> {
                _bmrState.update { it.copy(error = "Height must be between 50 and 250 cm") }
                return
            }
        }

        val safeAge = age ?: return
        val safeWeight = weight ?: return
        val safeHeight = height ?: return
        val bmr = if (state.gender == "Male") {
            88.362 + (13.397 * safeWeight) + (4.799 * safeHeight) - (5.677 * safeAge)
        } else {
            447.593 + (9.247 * safeWeight) + (3.098 * safeHeight) - (4.330 * safeAge)
        }
        _bmrState.update { it.copy(result = (bmr * 10).roundToInt() / 10.0, error = null) }
    }

    // ---- QDiabetes ----

    fun updateQDiabetesAge(value: String) {
        _qDiabetesState.update { it.copy(age = value, error = null) }
    }

    fun updateQDiabetesGender(value: String) {
        _qDiabetesState.update { it.copy(gender = value) }
    }

    fun updateQDiabetesBmi(value: String) {
        _qDiabetesState.update { it.copy(bmi = value, error = null) }
    }

    fun updateQDiabetesEthnicity(value: String) {
        _qDiabetesState.update { it.copy(ethnicity = value) }
    }

    fun updateQDiabetesSmokingStatus(value: String) {
        _qDiabetesState.update { it.copy(smokingStatus = value) }
    }

    fun updateQDiabetesFamilyHistory(value: Boolean) {
        _qDiabetesState.update { it.copy(familyHistoryDiabetes = value) }
    }

    fun updateQDiabetesBpTreatment(value: Boolean) {
        _qDiabetesState.update { it.copy(highBloodPressureTreatment = value) }
    }

    fun updateQDiabetesSteroids(value: Boolean) {
        _qDiabetesState.update { it.copy(steroidsUse = value) }
    }

    fun updateQDiabetesGestational(value: Boolean) {
        _qDiabetesState.update { it.copy(gestationalDiabetes = value) }
    }

    fun updateQDiabetesPolycystic(value: Boolean) {
        _qDiabetesState.update { it.copy(polycysticOvaries = value) }
    }

    fun calculateQDiabetesRisk() {
        val state = _qDiabetesState.value
        val age = state.age.toIntOrNull()
        if (age == null || age !in 25..84) {
            _qDiabetesState.update { it.copy(error = "Age must be between 25 and 84") }
            return
        }
        val bmi = state.bmi.toDoubleOrNull()
        if (bmi == null || bmi !in 10.0..60.0) {
            _qDiabetesState.update { it.copy(error = "Please enter a valid BMI (10–60)") }
            return
        }

        var riskScore = 0.0
        riskScore += (age - 25).coerceAtLeast(0) * 0.15
        if (bmi >= 35) riskScore += 4.0
        else if (bmi >= 30) riskScore += 2.5
        else if (bmi >= 25) riskScore += 1.0
        if (state.gender == "Male") riskScore += 1.5
        riskScore += when (state.ethnicity) {
            "Indian", "Pakistani", "Bangladeshi" -> 3.0
            "Other Asian", "Chinese" -> 1.5
            "Black Caribbean", "Black African" -> 1.0
            else -> 0.0
        }
        riskScore += when {
            state.smokingStatus.contains("heavy", ignoreCase = true) -> 1.5
            state.smokingStatus.contains("moderate", ignoreCase = true) -> 1.0
            state.smokingStatus.contains("light", ignoreCase = true) -> 0.5
            else -> 0.0
        }
        if (state.familyHistoryDiabetes == true) riskScore += 5.0
        if (state.highBloodPressureTreatment == true) riskScore += 2.0
        if (state.steroidsUse == true) riskScore += 3.0
        if (state.gestationalDiabetes == true) riskScore += 4.0
        if (state.polycysticOvaries == true) riskScore += 2.0

        val riskPercent = riskScore.coerceIn(0.1, 50.0)
        val riskLevel = when {
            riskPercent < 5.6 -> "Low risk"
            riskPercent < 10.0 -> "Moderate risk"
            riskPercent < 20.0 -> "High risk"
            else -> "Very high risk"
        }

        _qDiabetesState.update {
            it.copy(
                result = (riskPercent * 10).roundToInt() / 10.0,
                riskLevel = riskLevel,
                error = null,
            )
        }
    }
}
