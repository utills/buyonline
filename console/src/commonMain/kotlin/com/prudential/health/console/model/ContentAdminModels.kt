package com.prudential.health.console.model

import kotlinx.serialization.Serializable

@Serializable
data class CreateArticleRequest(
    val title: String,
    val description: String,
    val imageUrl: String? = null,
    val category: String = "",
    val publishedDate: String,
    val isPublished: Boolean = false,
)

@Serializable
data class CreateHelpTopicRequest(
    val question: String,
    val answer: String,
    val sortOrder: Int = 0,
    val isActive: Boolean = true,
)

@Serializable
data class SendNotificationRequest(
    val userIds: List<Int>? = null,
    val title: String,
    val message: String,
    val type: String = "general",
)

@Serializable
data class ArticleAdminDto(
    val id: Int = 0,
    val title: String = "",
    val description: String = "",
    val imageUrl: String? = null,
    val category: String = "",
    val publishedDate: String = "",
    val isPublished: Boolean = false,
)

@Serializable
data class HelpTopicAdminDto(
    val id: Int = 0,
    val question: String = "",
    val answer: String = "",
    val order: Int = 0,
    val isActive: Boolean = true,
)

@Serializable
data class AdminApiSuccess(
    val success: Boolean = true,
    val message: String = "OK",
)
