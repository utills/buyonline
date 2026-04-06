package com.prudential.health.feature.content.repository

import com.prudential.health.core.model.Article
import com.prudential.health.core.model.HelpTopic
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.ApiEndpoints
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable

@Serializable
private data class ArticlePage(val items: List<Article>, val total: Long = 0, val limit: Int = 0, val offset: Int = 0)

@Serializable
private data class HelpTopicPage(val items: List<HelpTopic>, val total: Long = 0, val limit: Int = 0, val offset: Int = 0)

class ContentRepository(
    private val apiClient: ApiClient,
) {
    private val _articles = MutableStateFlow<List<Article>>(emptyList())
    val articles: StateFlow<List<Article>> = _articles.asStateFlow()

    private val _helpTopics = MutableStateFlow<List<HelpTopic>>(emptyList())
    val helpTopics: StateFlow<List<HelpTopic>> = _helpTopics.asStateFlow()

    suspend fun loadArticles(): NetworkResult<List<Article>> {
        val result: NetworkResult<ArticlePage> = apiClient.get("${ApiEndpoints.Content.ARTICLES}?limit=50&offset=0")
        return when (result) {
            is NetworkResult.Success -> {
                _articles.emit(result.data.items)
                NetworkResult.Success(result.data.items)
            }
            is NetworkResult.Error -> result
            else -> NetworkResult.Error("Unknown network state")
        }
    }

    suspend fun loadHelpTopics(): NetworkResult<List<HelpTopic>> {
        val result: NetworkResult<HelpTopicPage> = apiClient.get("${ApiEndpoints.Content.HELP_TOPICS}?limit=100&offset=0")
        return when (result) {
            is NetworkResult.Success -> {
                _helpTopics.emit(result.data.items)
                NetworkResult.Success(result.data.items)
            }
            is NetworkResult.Error -> result
            else -> NetworkResult.Error("Unknown network state")
        }
    }
}
