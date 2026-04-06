package com.prudential.health.console.model

import kotlinx.serialization.Serializable

@Serializable
data class PaginatedResponse<T>(
    val items: List<T>,
    val total: Long,
    val limit: Int,
    val offset: Int,
)

@Serializable
data class AdminUser(
    val id: Int,
    val email: String,
    val name: String,
    val role: AdminRole,
)

@Serializable
enum class AdminRole {
    VIEWER, EDITOR, SUPERADMIN;

    companion object {
        fun from(value: String): AdminRole = when (value.lowercase()) {
            "superadmin" -> SUPERADMIN
            "editor" -> EDITOR
            "viewer" -> VIEWER
            else -> {
                println("WARNING: Unknown admin role '$value', defaulting to VIEWER")
                VIEWER
            }
        }
    }
}

@Serializable
data class AdminLoginRequest(val email: String, val password: String)

@Serializable
data class AdminLoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresAt: Long,
    val adminId: Int,
    val name: String,
    val role: String,
)

@Serializable
data class AdminUserListDto(
    val id: Int,
    val email: String,
    val name: String,
    val role: String,
    val isActive: Boolean,
    val createdAt: String,
    val lastLoginAt: String?,
)

@Serializable
data class CreateAdminUserRequest(
    val email: String,
    val name: String,
    val role: String = "viewer",
    val temporaryPassword: String,
)

@Serializable
data class UpdateAdminUserRequest(
    val role: String? = null,
    val isActive: Boolean? = null,
)

@Serializable
data class AuditLogEntryDto(
    val id: Int,
    val action: String,
    val detail: String,
    val ipAddress: String,
    val timestamp: String,
    val adminId: Int?,
)
