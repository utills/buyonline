package com.prudential.health.console.feature.content

import com.prudential.health.console.model.AdminApiSuccess
import com.prudential.health.console.model.ArticleAdminDto
import com.prudential.health.console.model.CreateArticleRequest
import com.prudential.health.console.model.CreateHelpTopicRequest
import com.prudential.health.console.model.HelpTopicAdminDto
import com.prudential.health.console.model.SendNotificationRequest
import com.prudential.health.console.network.AdminApiEndpoints
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.NetworkResult
import kotlinx.serialization.Serializable

@Serializable
private data class PublishToggleBody(val isPublished: Boolean)

class ContentAdminRepository(private val apiClient: ApiClient) {

    suspend fun getArticles(): NetworkResult<List<ArticleAdminDto>> =
        apiClient.get(AdminApiEndpoints.Content.ARTICLES)

    suspend fun createArticle(req: CreateArticleRequest): NetworkResult<AdminApiSuccess> =
        apiClient.post(AdminApiEndpoints.Content.ARTICLES, body = req)

    suspend fun updateArticle(id: Int, req: CreateArticleRequest): NetworkResult<AdminApiSuccess> =
        apiClient.put("${AdminApiEndpoints.Content.ARTICLES}/$id", body = req)

    suspend fun togglePublished(id: Int, isPublished: Boolean): NetworkResult<AdminApiSuccess> =
        apiClient.patch("${AdminApiEndpoints.Content.ARTICLES}/$id/publish", body = PublishToggleBody(isPublished))

    suspend fun deleteArticle(id: Int): NetworkResult<Unit> {
        return when (val result = apiClient.delete<AdminApiSuccess>(
            "${AdminApiEndpoints.Content.ARTICLES}/$id"
        )) {
            is NetworkResult.Success -> NetworkResult.Success(Unit)
            is NetworkResult.Error -> NetworkResult.Error(result.message, result.code ?: 0)
            else -> NetworkResult.Error("Unknown error")
        }
    }

    suspend fun getHelpTopics(): NetworkResult<List<HelpTopicAdminDto>> =
        apiClient.get(AdminApiEndpoints.Content.HELP_TOPICS)

    suspend fun createHelpTopic(req: CreateHelpTopicRequest): NetworkResult<AdminApiSuccess> =
        apiClient.post(AdminApiEndpoints.Content.HELP_TOPICS, body = req)

    suspend fun updateHelpTopic(id: Int, req: CreateHelpTopicRequest): NetworkResult<AdminApiSuccess> =
        apiClient.put("${AdminApiEndpoints.Content.HELP_TOPICS}/$id", body = req)

    suspend fun deleteHelpTopic(id: Int): NetworkResult<Unit> {
        return when (val result = apiClient.delete<AdminApiSuccess>(
            "${AdminApiEndpoints.Content.HELP_TOPICS}/$id"
        )) {
            is NetworkResult.Success -> NetworkResult.Success(Unit)
            is NetworkResult.Error -> NetworkResult.Error(result.message, result.code ?: 0)
            else -> NetworkResult.Error("Unknown error")
        }
    }

    suspend fun sendNotification(req: SendNotificationRequest): NetworkResult<Unit> {
        return when (val result = apiClient.post<AdminApiSuccess, SendNotificationRequest>(
            AdminApiEndpoints.Notifications.SEND,
            body = req,
        )) {
            is NetworkResult.Success -> NetworkResult.Success(Unit)
            is NetworkResult.Error -> NetworkResult.Error(result.message, result.code ?: 0)
            else -> NetworkResult.Error("Unknown error")
        }
    }
}
