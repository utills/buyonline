package com.prudential.health.console.feature.auth

import com.prudential.health.console.model.AdminLoginRequest
import com.prudential.health.console.model.AdminLoginResponse
import com.prudential.health.console.network.AdminApiEndpoints
import com.prudential.health.console.session.AdminSessionManager
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.NetworkResult

class AdminAuthRepository(
    private val apiClient: ApiClient,
    private val sessionManager: AdminSessionManager,
) {
    suspend fun login(email: String, password: String): NetworkResult<AdminLoginResponse> {
        val result = apiClient.post<AdminLoginResponse, AdminLoginRequest>(
            path = AdminApiEndpoints.Auth.LOGIN,
            body = AdminLoginRequest(email = email, password = password),
        )
        if (result is NetworkResult.Success) {
            val r = result.data
            sessionManager.storeSession(
                accessToken = r.accessToken,
                refreshToken = r.refreshToken,
                expiresAt = r.expiresAt,
                adminId = r.adminId,
                email = email,
                name = r.name,
                role = r.role,
            )
        }
        return result
    }
}
