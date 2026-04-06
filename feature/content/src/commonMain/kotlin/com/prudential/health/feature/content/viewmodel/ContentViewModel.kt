package com.prudential.health.feature.content.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.core.model.Article
import com.prudential.health.core.network.NetworkResult
import com.prudential.health.feature.content.model.ContentTab
import com.prudential.health.feature.content.model.ContentUiState
import com.prudential.health.feature.content.repository.ContentRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class ContentViewModel(
    private val repository: ContentRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ContentUiState())
    val uiState: StateFlow<ContentUiState> = _uiState.asStateFlow()

    init {
        // Collect flows once for ViewModel lifetime
        viewModelScope.launch {
            repository.articles.collect { articles ->
                _uiState.update { it.copy(articles = articles) }
            }
        }
        viewModelScope.launch {
            repository.helpTopics.collect { topics ->
                _uiState.update { it.copy(helpTopics = topics) }
            }
        }
        loadContent()
    }

    fun loadContent() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            val articlesDeferred = async { repository.loadArticles() }
            val topicsDeferred = async { repository.loadHelpTopics() }

            val articlesResult = articlesDeferred.await()
            val topicsResult = topicsDeferred.await()

            val error = when {
                articlesResult is NetworkResult.Error && topicsResult is NetworkResult.Error ->
                    "Failed to load content. Please try again."
                articlesResult is NetworkResult.Error -> articlesResult.message
                topicsResult is NetworkResult.Error -> topicsResult.message
                else -> null
            }
            _uiState.update { it.copy(isLoading = false, error = error) }
        }
    }

    fun onTabSelected(tab: ContentTab) {
        _uiState.update { it.copy(selectedTab = tab) }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun onArticleSelected(article: Article) {
        _uiState.update { it.copy(selectedArticle = article) }
    }

    fun onTopicToggled(topicId: String) {
        _uiState.update {
            it.copy(
                expandedTopicId = if (it.expandedTopicId == topicId) null else topicId,
            )
        }
    }
}
