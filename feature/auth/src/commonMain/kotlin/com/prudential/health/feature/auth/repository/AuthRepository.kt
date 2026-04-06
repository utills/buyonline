package com.prudential.health.feature.auth.repository

import com.prudential.health.core.model.Policy
import com.prudential.health.core.model.PolicyMember
import com.prudential.health.core.model.User
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.ApiEndpoints
import com.prudential.health.core.network.NetworkResult
import com.prudential.health.core.util.SessionManager
import com.prudential.health.core.util.urlEncode
import com.prudential.health.feature.auth.model.SendOtpResponse
import com.prudential.health.feature.auth.model.VerifyOtpResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable

class AuthRepository(
    private val apiClient: ApiClient,
    private val sessionManager: SessionManager,
) {
    private val _policies = MutableStateFlow<List<Policy>>(emptyList())
    val policies: StateFlow<List<Policy>> = _policies.asStateFlow()

    private val _members = MutableStateFlow<List<PolicyMember>>(emptyList())
    val members: StateFlow<List<PolicyMember>> = _members.asStateFlow()

    @Serializable
    private data class OtpSendBody(val phone: String)

    @Serializable
    private data class OtpVerifyBody(val phone: String, val otp: String)

    @Serializable
    private data class ConsentBody(val consentType: String, val isAccepted: Boolean)

    suspend fun sendOtp(phone: String): NetworkResult<SendOtpResponse> {
        return apiClient.post(
            ApiEndpoints.Auth.SEND_OTP,
            OtpSendBody(phone),
        )
    }

    suspend fun verifyOtp(phone: String, otp: String): NetworkResult<VerifyOtpResponse> {
        val result: NetworkResult<VerifyOtpResponse> = apiClient.post(
            ApiEndpoints.Auth.VERIFY_OTP,
            OtpVerifyBody(phone, otp),
        )
        if (result is NetworkResult.Success) {
            sessionManager.storeTokens(
                access = result.data.accessToken,
                refresh = result.data.refreshToken,
            )
        }
        return result
    }

    suspend fun loadPolicies(): NetworkResult<List<Policy>> {
        val result: NetworkResult<List<Policy>> = apiClient.get(ApiEndpoints.Auth.POLICIES)
        if (result is NetworkResult.Success) {
            _policies.emit(result.data)
        }
        return result
    }

    suspend fun loadMembers(policyNumber: String): NetworkResult<List<PolicyMember>> {
        val result: NetworkResult<List<PolicyMember>> = apiClient.get(
            "${ApiEndpoints.Auth.MEMBERS}?policy=${policyNumber.urlEncode()}",
        )
        if (result is NetworkResult.Success) {
            _members.emit(result.data)
        }
        return result
    }

    suspend fun selectMember(member: PolicyMember, policy: Policy) {
        val user = User(
            id = member.id,
            name = member.name,
            isProposer = member.isProposer,
            policyNumber = policy.policyNumber,
            phone = member.phone ?: "",
            joinedDate = member.joinedDate ?: "",
        )
        sessionManager.setUser(user)
        sessionManager.setPolicy(policy)
    }

    suspend fun logout() {
        apiClient.post<Unit, Unit>(ApiEndpoints.Auth.LOGOUT, Unit)
        sessionManager.logout()
    }

    suspend fun recordConsent(consentType: String, isAccepted: Boolean): NetworkResult<Unit> {
        return apiClient.post(
            ApiEndpoints.Profile.CONSENT,
            ConsentBody(consentType, isAccepted),
        )
    }

    fun clearSession() {
        _policies.value = emptyList()
        _members.value = emptyList()
    }
}
