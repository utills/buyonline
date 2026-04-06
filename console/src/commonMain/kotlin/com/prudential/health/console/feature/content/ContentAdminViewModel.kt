package com.prudential.health.console.feature.content

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prudential.health.console.model.ArticleAdminDto
import com.prudential.health.console.model.CreateArticleRequest
import com.prudential.health.console.model.CreateHelpTopicRequest
import com.prudential.health.console.model.HelpTopicAdminDto
import com.prudential.health.console.model.SendNotificationRequest
import com.prudential.health.core.network.NetworkResult
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

data class ContentUiState(
    val isLoading: Boolean = false,
    val articles: List<ArticleAdminDto> = emptyList(),
    val helpTopics: List<HelpTopicAdminDto> = emptyList(),
    val selectedArticle: ArticleAdminDto? = null,
    val selectedHelpTopic: HelpTopicAdminDto? = null,
    val showArticleEditor: Boolean = false,
    val showHelpTopicEditor: Boolean = false,
    val showNotificationDialog: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null,
)

class ContentAdminViewModel(private val repository: ContentAdminRepository) : ViewModel() {

    private val _state = MutableStateFlow(ContentUiState())
    val state: StateFlow<ContentUiState> = _state.asStateFlow()

    init {
        loadAll()
    }

    fun loadAll() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }

            val articlesDeferred = async { repository.getArticles() }
            val helpTopicsDeferred = async { repository.getHelpTopics() }

            val articlesResult = articlesDeferred.await()
            val helpTopicsResult = helpTopicsDeferred.await()

            _state.update { current ->
                val articles = when (articlesResult) {
                    is NetworkResult.Success -> articlesResult.data
                    else -> current.articles
                }
                val helpTopics = when (helpTopicsResult) {
                    is NetworkResult.Success -> helpTopicsResult.data
                    else -> current.helpTopics
                }
                val error = when {
                    articlesResult is NetworkResult.Error -> articlesResult.message
                    helpTopicsResult is NetworkResult.Error -> helpTopicsResult.message
                    else -> null
                }
                current.copy(isLoading = false, articles = articles, helpTopics = helpTopics, error = error)
            }
        }
    }

    fun selectArticleForEdit(article: ArticleAdminDto?) {
        _state.update { it.copy(selectedArticle = article, showArticleEditor = article != null) }
    }

    fun selectHelpTopicForEdit(topic: HelpTopicAdminDto?) {
        _state.update { it.copy(selectedHelpTopic = topic, showHelpTopicEditor = topic != null) }
    }

    fun showNewArticleEditor() {
        _state.update { it.copy(selectedArticle = null, showArticleEditor = true) }
    }

    fun showNewHelpTopicEditor() {
        _state.update { it.copy(selectedHelpTopic = null, showHelpTopicEditor = true) }
    }

    fun showNotificationDialog() {
        _state.update { it.copy(showNotificationDialog = true) }
    }

    fun saveArticle(
        title: String,
        description: String,
        imageUrl: String?,
        category: String,
        isPublished: Boolean,
    ) {
        val current = _state.value
        val selected = current.selectedArticle
        val today = Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault()).date.toString()

        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }

            val req = CreateArticleRequest(
                title = title.trim(),
                description = description.trim(),
                imageUrl = imageUrl?.trim()?.takeIf { it.isNotEmpty() },
                category = category.trim(),
                publishedDate = selected?.publishedDate?.takeIf { it.isNotEmpty() } ?: today,
                isPublished = isPublished,
            )

            val result = if (selected == null || selected.id == 0) {
                repository.createArticle(req)
            } else {
                repository.updateArticle(selected.id, req)
            }

            when (result) {
                is NetworkResult.Success -> {
                    _state.update {
                        it.copy(
                            showArticleEditor = false,
                            selectedArticle = null,
                            successMessage = if (selected == null || selected.id == 0) "Article created" else "Article updated",
                        )
                    }
                    loadAll()
                }
                is NetworkResult.Error -> _state.update { it.copy(isLoading = false, error = result.message) }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun saveHelpTopic(question: String, answer: String, order: Int) {
        val selected = _state.value.selectedHelpTopic

        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }

            val req = CreateHelpTopicRequest(
                question = question.trim(),
                answer = answer.trim(),
                sortOrder = order,
            )

            val result = if (selected == null || selected.id == 0) {
                repository.createHelpTopic(req)
            } else {
                repository.updateHelpTopic(selected.id, req)
            }

            when (result) {
                is NetworkResult.Success -> {
                    _state.update {
                        it.copy(
                            showHelpTopicEditor = false,
                            selectedHelpTopic = null,
                            successMessage = if (selected == null || selected.id == 0) "Help topic created" else "Help topic updated",
                        )
                    }
                    loadAll()
                }
                is NetworkResult.Error -> _state.update { it.copy(isLoading = false, error = result.message) }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun toggleArticlePublished(article: ArticleAdminDto) {
        viewModelScope.launch {
            _state.update { it.copy(error = null) }
            when (val result = repository.togglePublished(article.id, !article.isPublished)) {
                is NetworkResult.Success -> {
                    _state.update { it.copy(successMessage = if (!article.isPublished) "Article published" else "Article unpublished") }
                    loadAll()
                }
                is NetworkResult.Error -> _state.update { it.copy(error = result.message) }
                else -> Unit
            }
        }
    }

    fun deleteArticle(article: ArticleAdminDto) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.deleteArticle(article.id)) {
                is NetworkResult.Success -> {
                    _state.update { it.copy(isLoading = false, successMessage = "Article deleted") }
                    loadAll()
                }
                is NetworkResult.Error -> _state.update { it.copy(isLoading = false, error = result.message) }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun deleteHelpTopic(topic: HelpTopicAdminDto) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.deleteHelpTopic(topic.id)) {
                is NetworkResult.Success -> {
                    _state.update { it.copy(isLoading = false, successMessage = "Help topic deleted") }
                    loadAll()
                }
                is NetworkResult.Error -> _state.update { it.copy(isLoading = false, error = result.message) }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun sendNotification(title: String, message: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            val result = repository.sendNotification(
                SendNotificationRequest(title = title.trim(), message = message.trim())
            )
            when (result) {
                is NetworkResult.Success -> {
                    _state.update {
                        it.copy(
                            isLoading = false,
                            showNotificationDialog = false,
                            successMessage = "Notification sent to all users",
                        )
                    }
                }
                is NetworkResult.Error -> _state.update { it.copy(isLoading = false, error = result.message) }
                else -> _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun dismissEditor() {
        _state.update {
            it.copy(
                showArticleEditor = false,
                showHelpTopicEditor = false,
                showNotificationDialog = false,
                selectedArticle = null,
                selectedHelpTopic = null,
            )
        }
    }

    fun clearMessage() {
        _state.update { it.copy(successMessage = null, error = null) }
    }
}
