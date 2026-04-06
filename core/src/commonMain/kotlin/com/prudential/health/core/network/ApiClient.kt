package com.prudential.health.core.network

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
private data class RefreshBody(val refreshToken: String)

@Serializable
private data class RefreshResponse(
    val accessToken: String = "",
    val refreshToken: String = "",
    val expiresAt: Long = 0,
)

class ApiClient(
    private val baseUrl: String,
    private val tokenProvider: () -> String? = { null },
    @PublishedApi internal val refreshTokenProvider: () -> String? = { null },
    @PublishedApi internal val onTokenRefreshed: (access: String, refresh: String) -> Unit = { _, _ -> },
    @PublishedApi internal val onSessionExpired: () -> Unit = {},
) {
    @PublishedApi internal val refreshMutex = Mutex()

    val json = Json {
        ignoreUnknownKeys = true
        isLenient = false
        prettyPrint = false
        encodeDefaults = true
    }

    val httpClient = HttpClient {
        install(ContentNegotiation) {
            json(json)
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 30_000
            connectTimeoutMillis = 10_000
            socketTimeoutMillis = 30_000
        }
        install(Logging) {
            level = LogLevel.INFO
            sanitizeHeader { header -> header == "Authorization" }
        }
        defaultRequest {
            url(baseUrl)
            contentType(ContentType.Application.Json)
            tokenProvider()?.let { token ->
                header("Authorization", "Bearer $token")
            }
        }
    }

    @PublishedApi
    internal suspend fun attemptTokenRefresh(): Boolean {
        val currentRefresh = refreshTokenProvider() ?: return false
        return try {
            val response = httpClient.post("auth/token/refresh") {
                setBody(RefreshBody(currentRefresh))
            }
            if (response.status.isSuccess()) {
                val tokens: RefreshResponse = response.body()
                onTokenRefreshed(tokens.accessToken, tokens.refreshToken)
                true
            } else false
        } catch (_: Exception) {
            false
        }
    }

    suspend inline fun <reified T> get(path: String): NetworkResult<T> {
        return try {
            val response = httpClient.get(path)
            when {
                response.status.isSuccess() -> NetworkResult.Success(response.body())
                response.status == HttpStatusCode.Unauthorized -> {
                    val refreshed = refreshMutex.withLock { attemptTokenRefresh() }
                    if (refreshed) {
                        val retry = httpClient.get(path)
                        if (retry.status.isSuccess()) NetworkResult.Success(retry.body())
                        else { onSessionExpired(); NetworkResult.Error("Session expired", 401) }
                    } else {
                        onSessionExpired()
                        NetworkResult.Error("Session expired", 401)
                    }
                }
                else -> NetworkResult.Error(response.bodyAsText(), response.status.value)
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }

    suspend inline fun <reified T, reified B> post(path: String, body: B): NetworkResult<T> {
        return try {
            val response = httpClient.post(path) { setBody(body) }
            when {
                response.status.isSuccess() -> NetworkResult.Success(response.body())
                response.status == HttpStatusCode.Unauthorized -> {
                    val refreshed = refreshMutex.withLock { attemptTokenRefresh() }
                    if (refreshed) {
                        val retry = httpClient.post(path) { setBody(body) }
                        if (retry.status.isSuccess()) NetworkResult.Success(retry.body())
                        else { onSessionExpired(); NetworkResult.Error("Session expired", 401) }
                    } else {
                        onSessionExpired()
                        NetworkResult.Error("Session expired", 401)
                    }
                }
                else -> NetworkResult.Error(response.bodyAsText(), response.status.value)
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }

    suspend inline fun <reified T, reified B> put(path: String, body: B): NetworkResult<T> {
        return try {
            val response = httpClient.put(path) { setBody(body) }
            when {
                response.status.isSuccess() -> NetworkResult.Success(response.body())
                response.status == HttpStatusCode.Unauthorized -> {
                    val refreshed = refreshMutex.withLock { attemptTokenRefresh() }
                    if (refreshed) {
                        val retry = httpClient.put(path) { setBody(body) }
                        if (retry.status.isSuccess()) NetworkResult.Success(retry.body())
                        else { onSessionExpired(); NetworkResult.Error("Session expired", 401) }
                    } else {
                        onSessionExpired()
                        NetworkResult.Error("Session expired", 401)
                    }
                }
                else -> NetworkResult.Error(response.bodyAsText(), response.status.value)
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }

    suspend inline fun <reified T, reified B> patch(path: String, body: B): NetworkResult<T> {
        return try {
            val response = httpClient.patch(path) { setBody(body) }
            when {
                response.status.isSuccess() -> NetworkResult.Success(response.body())
                response.status == HttpStatusCode.Unauthorized -> {
                    val refreshed = refreshMutex.withLock { attemptTokenRefresh() }
                    if (refreshed) {
                        val retry = httpClient.patch(path) { setBody(body) }
                        if (retry.status.isSuccess()) NetworkResult.Success(retry.body())
                        else { onSessionExpired(); NetworkResult.Error("Session expired", 401) }
                    } else {
                        onSessionExpired()
                        NetworkResult.Error("Session expired", 401)
                    }
                }
                else -> NetworkResult.Error(response.bodyAsText(), response.status.value)
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }

    suspend inline fun <reified T> delete(path: String): NetworkResult<T> {
        return try {
            val response = httpClient.delete(path)
            when {
                response.status.isSuccess() -> NetworkResult.Success(response.body())
                response.status == HttpStatusCode.Unauthorized -> {
                    val refreshed = refreshMutex.withLock { attemptTokenRefresh() }
                    if (refreshed) {
                        val retry = httpClient.delete(path)
                        if (retry.status.isSuccess()) NetworkResult.Success(retry.body())
                        else { onSessionExpired(); NetworkResult.Error("Session expired", 401) }
                    } else {
                        onSessionExpired()
                        NetworkResult.Error("Session expired", 401)
                    }
                }
                else -> NetworkResult.Error(response.bodyAsText(), response.status.value)
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }
}
