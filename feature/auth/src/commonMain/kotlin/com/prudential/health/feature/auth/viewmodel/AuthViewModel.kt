package com.prudential.health.feature.auth.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.core.model.Policy
import com.prudential.health.core.model.PolicyMember
import com.prudential.health.core.network.NetworkResult
import com.prudential.health.feature.auth.model.AuthUiState
import com.prudential.health.feature.auth.model.ConsentStep
import com.prudential.health.feature.auth.repository.AuthRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class AuthViewModel(
    private val repository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    val policies: StateFlow<List<Policy>> = repository.policies
    val members: StateFlow<List<PolicyMember>> = repository.members

    private var timerJob: Job? = null

    fun onPhoneChanged(phone: String) {
        if (phone.length <= 10) {
            _uiState.update { it.copy(phone = phone.filter { c -> c.isDigit() }, error = null) }
        }
    }

    fun onTermsAccepted(accepted: Boolean) {
        _uiState.update { it.copy(isTermsAccepted = accepted) }
    }

    fun onShowTermsSheet(show: Boolean) {
        _uiState.update { it.copy(showTermsSheet = show) }
    }

    fun sendOtp() {
        val phone = _uiState.value.phone
        if (phone.length != 10 || !phone.matches(Regex("^[6-9]\\d{9}$"))) {
            _uiState.update { it.copy(error = "Please enter a valid 10-digit phone number") }
            return
        }
        if (!_uiState.value.isTermsAccepted) {
            _uiState.update { it.copy(error = "Please accept the Terms and Conditions") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.sendOtp(phone)) {
                is NetworkResult.Success -> {
                    _uiState.update { it.copy(isLoading = false, otpSent = true) }
                    startOtpTimer()
                }
                is NetworkResult.Error -> {
                    _uiState.update {
                        it.copy(isLoading = false, error = result.message.ifBlank { "Failed to send OTP" })
                    }
                }
                else -> {
                    _uiState.update { it.copy(isLoading = false) }
                }
            }
        }
    }

    fun onOtpChanged(otp: String) {
        if (otp.length <= 6) {
            _uiState.update { it.copy(otp = otp.filter { c -> c.isDigit() }, error = null) }
        }
    }

    fun verifyOtp() {
        val state = _uiState.value
        if (state.otp.length != 6) {
            _uiState.update { it.copy(error = "Please enter a valid 6-digit OTP") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = repository.verifyOtp(state.phone, state.otp)
            when (result) {
                is NetworkResult.Success -> {
                    _uiState.update { it.copy(isLoading = false, isOtpVerified = true) }
                    timerJob?.cancel()
                    // Load policies after successful OTP verification
                    loadPolicies()
                }
                is NetworkResult.Error -> {
                    val errorMessage = when {
                        result.code == 429 || result.message.contains("rate_limited", ignoreCase = true) ->
                            "Too many attempts. Please request a new OTP."
                        else -> "Invalid OTP. Please try again."
                    }
                    _uiState.update { it.copy(isLoading = false, error = errorMessage) }
                }
                else -> {}
            }
        }
    }

    fun resendOtp() {
        timerJob?.cancel()
        _uiState.update { it.copy(otp = "") }
        sendOtp()
    }

    private fun startOtpTimer() {
        timerJob?.cancel()
        _uiState.update { it.copy(otpTimerSeconds = 180) }
        timerJob = viewModelScope.launch {
            while (_uiState.value.otpTimerSeconds > 0) {
                delay(1_000)
                _uiState.update { state ->
                    state.copy(otpTimerSeconds = maxOf(0, state.otpTimerSeconds - 1))
                }
            }
        }
    }

    private fun loadPolicies() {
        viewModelScope.launch {
            repository.loadPolicies()
        }
    }

    fun onPolicySelected(policyNumber: String) {
        _uiState.update { it.copy(selectedPolicyNumber = policyNumber) }
        viewModelScope.launch {
            repository.loadMembers(policyNumber)
        }
    }

    fun onMemberTapped(memberId: String) {
        _uiState.update {
            it.copy(
                selectedMemberId = memberId,
                showMemberConfirmSheet = true,
                consentStep = ConsentStep.MEMBER_CONFIRM,
            )
        }
    }

    fun onMemberConfirmed() {
        val state = _uiState.value
        val member = members.value.find { it.id == state.selectedMemberId } ?: return
        val policy = policies.value.find { it.policyNumber == state.selectedPolicyNumber } ?: return

        viewModelScope.launch {
            repository.selectMember(member, policy)
            _uiState.update {
                it.copy(
                    isMemberConfirmed = true,
                    showMemberConfirmSheet = false,
                    consentStep = ConsentStep.USER_CONSENT,
                )
            }
        }
    }

    fun onConsentAccepted(step: ConsentStep) {
        _uiState.update {
            when (step) {
                ConsentStep.USER_CONSENT -> it.copy(
                    isUserConsentAccepted = true,
                    consentStep = ConsentStep.LOCATION_PERMISSION,
                )
                ConsentStep.LOCATION_PERMISSION -> it.copy(
                    isLocationConsentAccepted = true,
                    consentStep = ConsentStep.NOTIFICATION_PERMISSION,
                )
                ConsentStep.NOTIFICATION_PERMISSION -> it.copy(
                    isEmailSmsConsentAccepted = true,
                    isWhatsappConsentAccepted = true,
                    consentStep = ConsentStep.COMPLETED,
                )
                else -> it
            }
        }
        val consentType = when (step) {
            ConsentStep.USER_CONSENT -> "user_consent"
            ConsentStep.LOCATION_PERMISSION -> "location_permission"
            ConsentStep.NOTIFICATION_PERMISSION -> "notification_permission"
            else -> return
        }
        recordConsent(consentType, isAccepted = true)
    }

    fun recordConsent(consentType: String, isAccepted: Boolean) {
        viewModelScope.launch {
            try {
                repository.recordConsent(consentType, isAccepted)
            } catch (e: Exception) {
                // Log but don't fail the flow — consent is also tracked locally
            }
        }
    }

    fun onConsentSkipped(step: ConsentStep) {
        _uiState.update {
            when (step) {
                ConsentStep.MEMBER_CONFIRM -> it.copy(
                    showMemberConfirmSheet = false,
                    consentStep = ConsentStep.NONE,
                    selectedMemberId = null,
                )
                ConsentStep.USER_CONSENT -> it.copy(consentStep = ConsentStep.LOCATION_PERMISSION)
                ConsentStep.LOCATION_PERMISSION -> it.copy(consentStep = ConsentStep.NOTIFICATION_PERMISSION)
                ConsentStep.NOTIFICATION_PERMISSION -> it.copy(consentStep = ConsentStep.COMPLETED)
                else -> it
            }
        }
    }

    fun consumeOtpSentEvent() {
        _uiState.update { it.copy(otpSent = false) }
    }

    fun consumeOtpVerifiedEvent() {
        _uiState.update { it.copy(isOtpVerified = false) }
    }

    fun logout() {
        viewModelScope.launch {
            repository.logout()
            repository.clearSession()
            _uiState.value = AuthUiState()
        }
    }

    override fun onCleared() {
        super.onCleared()
        timerJob?.cancel()
    }
}
