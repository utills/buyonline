package com.prudential.health.core.network

import kotlinx.serialization.Serializable

@Serializable
data class ApiResponse<T>(
    val success: Boolean = false,
    val data: T? = null,
    val message: String? = null,
    val error: String? = null,
)

sealed class NetworkResult<out T> {
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Error(val message: String, val code: Int? = null) : NetworkResult<Nothing>()
    // Reserved for use with Flow/StateFlow-based loading states in repositories and ViewModels
    data object Loading : NetworkResult<Nothing>()
}
