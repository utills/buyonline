package com.prudential.health.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Article(
    @SerialName("_id") val id: String = "",
    val title: String = "",
    val description: String = "",
    val imageUrl: String? = null,
    val category: String = "",
    val publishedDate: String = "",
)

@Serializable
data class HelpTopic(
    @SerialName("_id") val id: String = "",
    val question: String = "",
    val answer: String = "",
    val order: Int = 0,
)
