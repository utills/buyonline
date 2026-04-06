package com.prudential.health.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AppNotification(
    @SerialName("_id") val id: String = "",
    val title: String = "",
    val message: String = "",
    val type: NotificationType = NotificationType.GENERAL,
    val timestamp: String = "",
    val isRead: Boolean = false,
)

@Serializable
enum class NotificationType {
    @SerialName("target_completed") TARGET_COMPLETED,
    @SerialName("target_incomplete") TARGET_INCOMPLETE,
    @SerialName("pending_connection") PENDING_CONNECTION,
    @SerialName("promotion") PROMOTION,
    @SerialName("general") GENERAL,
}
