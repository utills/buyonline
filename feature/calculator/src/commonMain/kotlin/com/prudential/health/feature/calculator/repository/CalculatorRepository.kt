package com.prudential.health.feature.calculator.repository

import com.prudential.health.core.model.CalculatorInfo
import com.prudential.health.core.model.HeartScoreInput
import com.prudential.health.core.model.HeartScoreResult
import com.prudential.health.core.model.QDiabetesResult
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.ApiEndpoints
import com.prudential.health.core.network.NetworkResult
import com.prudential.health.feature.calculator.model.QDiabetesRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class CalculatorRepository(
    private val apiClient: ApiClient,
) {
    private val _calculators = MutableStateFlow<List<CalculatorInfo>>(emptyList())
    val calculators: StateFlow<List<CalculatorInfo>> = _calculators.asStateFlow()

    private val _heartScoreResult = MutableStateFlow<HeartScoreResult?>(null)
    val heartScoreResult: StateFlow<HeartScoreResult?> = _heartScoreResult.asStateFlow()

    suspend fun loadCalculators(): NetworkResult<List<CalculatorInfo>> {
        val result: NetworkResult<List<CalculatorInfo>> = apiClient.get(ApiEndpoints.Calculator.HISTORY)
        if (result is NetworkResult.Success) {
            _calculators.emit(result.data)
        }
        return result
    }

    suspend fun calculateHeartScore(input: HeartScoreInput): NetworkResult<HeartScoreResult> {
        val result: NetworkResult<HeartScoreResult> = apiClient.post(
            ApiEndpoints.Calculator.HEART_SCORE,
            input,
        )
        if (result is NetworkResult.Success) {
            _heartScoreResult.emit(result.data)
        }
        return result
    }

    suspend fun clearHeartScoreResult() {
        _heartScoreResult.emit(null)
    }

    suspend fun calculateQDiabetes(request: QDiabetesRequest): NetworkResult<QDiabetesResult> {
        return apiClient.post(ApiEndpoints.Calculator.QDIABETES, request)
    }
}
