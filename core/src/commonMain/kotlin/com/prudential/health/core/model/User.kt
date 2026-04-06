package com.prudential.health.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class User(
    @SerialName("_id") val id: String = "",
    val name: String = "",
    val phone: String = "",
    val email: String? = null,
    val profileImageUrl: String? = null,
    val joinedDate: String = "",
    val policyNumber: String = "",
    val isProposer: Boolean = false,
)

@Serializable
data class PolicyMember(
    @SerialName("_id") val id: String = "",
    val name: String = "",
    val isProposer: Boolean = false,
    val relationship: String? = null,
    val phone: String? = null,
    val joinedDate: String? = null,
)

@Serializable
data class Policy(
    @SerialName("_id") val id: String = "",
    val policyNumber: String = "",
    val planName: String = "",
    val policyHolder: String = "",
    val sumInsured: Double = 0.0,
    val annualPremium: Double = 0.0,
    val startDate: String = "",
    val renewalDate: String = "",
    val isAutoDebitActive: Boolean = false,
    val status: PolicyStatus = PolicyStatus.ACTIVE,
    val members: List<PolicyMember> = emptyList(),
)

@Serializable
enum class PolicyStatus {
    @SerialName("active") ACTIVE,
    @SerialName("inactive") INACTIVE,
    @SerialName("expired") EXPIRED,
}
