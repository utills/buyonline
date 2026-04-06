package com.prudential.health.feature.content.model

import com.prudential.health.core.model.Article
import com.prudential.health.core.model.HelpTopic

data class ContentUiState(
    val articles: List<Article> = emptyList(),
    val helpTopics: List<HelpTopic> = emptyList(),
    val selectedTab: ContentTab = ContentTab.ARTICLES,
    val searchQuery: String = "",
    val expandedTopicId: String? = null,
    val selectedArticle: Article? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
)

enum class ContentTab {
    ARTICLES,
    HELP_TOPICS,
}
