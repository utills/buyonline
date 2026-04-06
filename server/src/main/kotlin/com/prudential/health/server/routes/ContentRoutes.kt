package com.prudential.health.server.routes

import com.prudential.health.server.service.ContentService
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.contentRoutes(contentService: ContentService) {
    route("/v1/content") {

        get("/articles") {
            val limit = (call.request.queryParameters["limit"]?.toIntOrNull() ?: 20).coerceIn(1, 100)
            val offset = (call.request.queryParameters["offset"]?.toIntOrNull() ?: 0).coerceAtLeast(0)
            val result = contentService.getArticles(limit, offset)
            call.respond(result)
        }

        get("/help-topics") {
            val limit = (call.request.queryParameters["limit"]?.toIntOrNull() ?: 50).coerceIn(1, 100)
            val offset = (call.request.queryParameters["offset"]?.toIntOrNull() ?: 0).coerceAtLeast(0)
            val result = contentService.getHelpTopics(limit, offset)
            call.respond(result)
        }
    }
}
