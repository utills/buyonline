package com.prudential.health.server.routes

import com.prudential.health.server.auth.AdminJwtConfig
import com.prudential.health.server.model.*
import com.prudential.health.server.service.AdminService
import com.prudential.health.server.service.AuditService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.datetime.*

private fun RoutingCall.getAdminId(): Int? =
    principal<JWTPrincipal>()?.payload?.getClaim("adminId")?.asInt()

/**
 * Returns an error message if the image URL is potentially dangerous (SSRF), or null if valid.
 * Allows null (no image) and requires HTTPS. Blocks private/loopback addresses.
 */
private val privateHostPattern = Regex(
    """^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|::1)$""",
    RegexOption.IGNORE_CASE,
)

private fun validateImageUrl(url: String?): String? {
    if (url == null) return null
    if (!url.startsWith("https://")) return "imageUrl must use HTTPS"
    val host = try {
        java.net.URI(url).host ?: return "imageUrl has no host"
    } catch (_: Exception) {
        return "imageUrl is not a valid URL"
    }
    if (privateHostPattern.matches(host)) return "imageUrl must not point to a private or loopback address"
    return null
}

private fun RoutingCall.getAdminRole(): String =
    principal<JWTPrincipal>()?.payload?.getClaim("role")?.asString() ?: "viewer"

private fun RoutingCall.requireRole(vararg allowed: String): Boolean {
    val role = getAdminRole()
    return role in allowed
}

fun Route.adminRoutes(adminService: AdminService, adminJwtConfig: AdminJwtConfig, auditService: AuditService) {

    route("/v1/admin") {

        // ---- Auth (public) ----
        post("/auth/login") {
            val req = try {
                call.receive<AdminLoginRequest>()
            } catch (_: Exception) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Invalid request body"))
                return@post
            }
            if (req.email.isBlank() || req.password.isBlank()) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_input", "Email and password required"))
                return@post
            }
            val result = adminService.login(req.email, req.password)
            if (result == null) {
                // Audit every failed login attempt for forensic / compliance purposes
                try {
                    auditService.log(null, "admin_login_failed", "email=${req.email.takeLast(4).padStart(req.email.length, '*')}", call.request.local.remoteHost)
                } catch (_: Exception) { /* best-effort */ }
                call.respond(HttpStatusCode.Unauthorized, ApiError("invalid_credentials", "Invalid email or password"))
                return@post
            }
            val (adminId, role) = result
            val adminUser = adminService.getAdminById(adminId)
            val (accessToken, expiresAt) = adminJwtConfig.generateAccessToken(adminId, req.email, role)
            val refreshToken = adminJwtConfig.generateRefreshToken(adminId)
            call.respond(AdminLoginResponse(
                accessToken = accessToken,
                refreshToken = refreshToken,
                expiresAt = expiresAt,
                adminId = adminId,
                name = adminUser?.name ?: "",
                role = role,
            ))
        }

        // ---- Protected admin routes ----
        authenticate("admin-jwt") {

            get("/auth/me") {
                val adminId = call.getAdminId() ?: run {
                    call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid token"))
                    return@get
                }
                val admin = adminService.getAdminById(adminId)
                if (admin == null) {
                    call.respond(HttpStatusCode.NotFound, ApiError("not_found", "Admin not found"))
                } else {
                    call.respond(admin)
                }
            }

            // ---- Analytics ----
            get("/analytics/overview") {
                call.respond(adminService.getOverviewKpis())
            }

            get("/analytics/step-trends") {
                val today = Clock.System.now().toLocalDateTime(TimeZone.UTC).date
                val from = try {
                    call.parameters["from"]?.let { LocalDate.parse(it) } ?: LocalDate.parse("2026-01-01")
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid 'from' date")); return@get
                }
                val to = try {
                    call.parameters["to"]?.let { LocalDate.parse(it) } ?: today
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid 'to' date")); return@get
                }
                call.respond(adminService.getStepTrends(from, to))
            }

            get("/analytics/platforms") {
                call.respond(adminService.getPlatformBreakdown())
            }

            get("/analytics/consent-stats") {
                call.respond(adminService.getConsentStats())
            }

            get("/analytics/calculator-usage") {
                call.respond(adminService.getCalculatorUsage())
            }

            get("/analytics/top-users") {
                val today = Clock.System.now().toLocalDateTime(TimeZone.UTC).date
                val limit = (call.parameters["limit"]?.toIntOrNull() ?: 10).coerceIn(1, 100)
                val from = try {
                    call.parameters["from"]?.let { LocalDate.parse(it) } ?: today.minus(30, DateTimeUnit.DAY)
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid 'from' date")); return@get
                }
                val to = try {
                    call.parameters["to"]?.let { LocalDate.parse(it) } ?: today
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid 'to' date")); return@get
                }
                call.respond(adminService.getTopUsers(limit, from, to))
            }

            // ---- Users ----
            get("/users") {
                val q = call.parameters["q"] ?: ""
                if (q.length > 200) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_query", "Search query must be at most 200 characters"))
                    return@get
                }
                val page = (call.parameters["page"]?.toIntOrNull() ?: 1).coerceAtLeast(1)
                val pageSize = (call.parameters["pageSize"]?.toIntOrNull() ?: 50).coerceIn(1, 100)
                val (users, total) = adminService.searchUsers(q, page, pageSize)
                call.respond(PaginatedResponse(items = users, total = total, limit = pageSize, offset = (page - 1) * pageSize))
            }

            get("/users/{id}") {
                val id = call.parameters["id"]?.toIntOrNull() ?: run {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_id", "Invalid user ID"))
                    return@get
                }
                val detail = adminService.getUserDetail(id)
                if (detail == null) {
                    call.respond(HttpStatusCode.NotFound, ApiError("not_found", "User not found"))
                } else {
                    call.respond(detail)
                }
            }

            // ---- Policies ----
            get("/policies") {
                val q = call.parameters["q"] ?: ""
                if (q.length > 200) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_query", "Search query must be at most 200 characters"))
                    return@get
                }
                val page = (call.parameters["page"]?.toIntOrNull() ?: 1).coerceAtLeast(1)
                val pageSize = (call.parameters["pageSize"]?.toIntOrNull() ?: 50).coerceIn(1, 100)
                val (policies, total) = adminService.getPolicies(q, page, pageSize)
                call.respond(PaginatedResponse(items = policies, total = total, limit = pageSize, offset = (page - 1) * pageSize))
            }

            // ---- Content ----
            get("/content/articles") {
                call.respond(adminService.getAllArticles())
            }

            post("/content/articles") {
                if (!call.requireRole("editor", "superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Insufficient permissions"))
                    return@post
                }
                val req = try {
                    call.receive<CreateArticleRequest>()
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Invalid request body"))
                    return@post
                }
                if (req.title.isBlank() || req.title.length > 500) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_title", "Title must be 1–500 characters"))
                    return@post
                }
                if (req.description.length > 10_000) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_description", "Description must be at most 10000 characters"))
                    return@post
                }
                validateImageUrl(req.imageUrl)?.let { err ->
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_image_url", err))
                    return@post
                }
                val id = adminService.createArticle(req)
                call.respond(HttpStatusCode.Created, ApiSuccess(message = "Article created with id $id"))
                val adminId = call.getAdminId()
                try {
                    auditService.log(adminId, "article_created", "id=$id", call.request.local.remoteHost)
                } catch (e: Exception) {
                    call.application.environment.log.warn("Audit log failed for article_created: ${e.message}")
                }
            }

            put("/content/articles/{id}") {
                if (!call.requireRole("editor", "superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Insufficient permissions"))
                    return@put
                }
                val id = call.parameters["id"]?.toIntOrNull() ?: run {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_id", "Invalid article ID"))
                    return@put
                }
                val req = try {
                    call.receive<CreateArticleRequest>()
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Invalid request body"))
                    return@put
                }
                if (req.title.isBlank() || req.title.length > 500) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_title", "Title must be 1–500 characters"))
                    return@put
                }
                if (req.description.length > 10_000) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_description", "Description must be at most 10000 characters"))
                    return@put
                }
                validateImageUrl(req.imageUrl)?.let { err ->
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_image_url", err))
                    return@put
                }
                val success = adminService.updateArticle(id, req)
                if (success) {
                    call.respond(ApiSuccess())
                    val adminId = call.getAdminId()
                    try {
                        auditService.log(adminId, "article_updated", "id=$id", call.request.local.remoteHost)
                    } catch (e: Exception) {
                        call.application.environment.log.warn("Audit log failed for article_updated: ${e.message}")
                    }
                } else {
                    call.respond(HttpStatusCode.NotFound, ApiError("not_found", "Article not found"))
                }
            }

            patch("/content/articles/{id}/publish") {
                if (!call.requireRole("editor", "superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Insufficient permissions"))
                    return@patch
                }
                val id = call.parameters["id"]?.toIntOrNull() ?: run {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_id", "Invalid article ID"))
                    return@patch
                }
                val req = try {
                    call.receive<SetPublishedRequest>()
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Expected {\"isPublished\": true|false}"))
                    return@patch
                }
                val success = adminService.setArticlePublished(id, req.isPublished)
                if (success) {
                    call.respond(ApiSuccess())
                    val adminId = call.getAdminId()
                    try {
                        val action = if (req.isPublished) "article_published" else "article_unpublished"
                        auditService.log(adminId, action, "id=$id", call.request.local.remoteHost)
                    } catch (e: Exception) {
                        call.application.environment.log.warn("Audit log failed for article_publish_set: ${e.message}")
                    }
                } else {
                    call.respond(HttpStatusCode.NotFound, ApiError("not_found", "Article not found"))
                }
            }

            delete("/content/articles/{id}") {
                if (!call.requireRole("editor", "superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Insufficient permissions"))
                    return@delete
                }
                val id = call.parameters["id"]?.toIntOrNull() ?: run {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_id", "Invalid article ID"))
                    return@delete
                }
                val success = adminService.deleteArticle(id)
                if (success) {
                    val adminId = call.getAdminId()
                    try {
                        auditService.log(adminId, "article_deleted", "id=$id", call.request.local.remoteHost)
                    } catch (e: Exception) {
                        call.application.environment.log.warn("Audit log failed for article_deleted: ${e.message}")
                    }
                    call.respond(HttpStatusCode.NoContent)
                } else {
                    call.respond(HttpStatusCode.NotFound, ApiError("not_found", "Article not found"))
                }
            }

            get("/content/help-topics") {
                call.respond(adminService.getAllHelpTopics())
            }

            post("/content/help-topics") {
                if (!call.requireRole("editor", "superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Insufficient permissions"))
                    return@post
                }
                val req = try {
                    call.receive<CreateHelpTopicRequest>()
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Invalid request body"))
                    return@post
                }
                if (req.question.isBlank() || req.question.length > 500) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_question", "Question must be 1–500 characters"))
                    return@post
                }
                if (req.answer.isBlank() || req.answer.length > 10_000) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_answer", "Answer must be 1–10000 characters"))
                    return@post
                }
                val id = adminService.createHelpTopic(req)
                call.respond(HttpStatusCode.Created, ApiSuccess(message = "Help topic created with id $id"))
                val adminId = call.getAdminId()
                try {
                    auditService.log(adminId, "help_topic_created", "id=$id", call.request.local.remoteHost)
                } catch (e: Exception) {
                    call.application.environment.log.warn("Audit log failed for help_topic_created: ${e.message}")
                }
            }

            put("/content/help-topics/{id}") {
                if (!call.requireRole("editor", "superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Insufficient permissions"))
                    return@put
                }
                val id = call.parameters["id"]?.toIntOrNull() ?: run {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_id", "Invalid help topic ID"))
                    return@put
                }
                val req = try {
                    call.receive<CreateHelpTopicRequest>()
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Invalid request body"))
                    return@put
                }
                if (req.question.isBlank() || req.question.length > 500) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_question", "Question must be 1–500 characters"))
                    return@put
                }
                if (req.answer.isBlank() || req.answer.length > 10_000) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_answer", "Answer must be 1–10000 characters"))
                    return@put
                }
                val success = adminService.updateHelpTopic(id, req)
                if (success) {
                    call.respond(ApiSuccess())
                    val adminId = call.getAdminId()
                    try {
                        auditService.log(adminId, "help_topic_updated", "id=$id", call.request.local.remoteHost)
                    } catch (e: Exception) {
                        call.application.environment.log.warn("Audit log failed for help_topic_updated: ${e.message}")
                    }
                } else {
                    call.respond(HttpStatusCode.NotFound, ApiError("not_found", "Help topic not found"))
                }
            }

            delete("/content/help-topics/{id}") {
                if (!call.requireRole("editor", "superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Insufficient permissions"))
                    return@delete
                }
                val id = call.parameters["id"]?.toIntOrNull() ?: run {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_id", "Invalid help topic ID"))
                    return@delete
                }
                val success = adminService.deleteHelpTopic(id)
                if (success) {
                    val adminId = call.getAdminId()
                    try {
                        auditService.log(adminId, "help_topic_deleted", "id=$id", call.request.local.remoteHost)
                    } catch (e: Exception) {
                        call.application.environment.log.warn("Audit log failed for help_topic_deleted: ${e.message}")
                    }
                    call.respond(HttpStatusCode.NoContent)
                } else {
                    call.respond(HttpStatusCode.NotFound, ApiError("not_found", "Help topic not found"))
                }
            }

            // ---- Notifications ----
            post("/notifications/send") {
                if (!call.requireRole("editor", "superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Insufficient permissions"))
                    return@post
                }
                val req = try {
                    call.receive<SendNotificationRequest>()
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Invalid request body"))
                    return@post
                }
                if (req.title.isBlank() || req.title.length > 500) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_title", "Title must be 1–500 characters"))
                    return@post
                }
                if (req.message.isBlank() || req.message.length > 5_000) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_message", "Message must be 1–5000 characters"))
                    return@post
                }
                val count = adminService.sendNotification(req)
                call.respond(ApiSuccess(message = "Sent to $count users"))
                val adminId = call.getAdminId()
                try {
                    auditService.log(adminId, "notification_sent", "recipients=$count", call.request.local.remoteHost)
                } catch (e: Exception) {
                    call.application.environment.log.warn("Audit log failed for notification_sent: ${e.message}")
                }
            }

            // ---- Admin Users ----
            get("/admin-users") {
                if (!call.requireRole("superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Superadmin required"))
                    return@get
                }
                call.respond(adminService.listAdminUsers())
            }

            post("/admin-users") {
                if (!call.requireRole("superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Superadmin required"))
                    return@post
                }
                val req = try {
                    call.receive<CreateAdminUserRequest>()
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Invalid request body"))
                    return@post
                }
                val validRoles = setOf("viewer", "editor", "superadmin")
                if (req.role !in validRoles) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_role", "Role must be one of: viewer, editor, superadmin"))
                    return@post
                }
                val id = adminService.createAdminUser(req)
                call.respond(HttpStatusCode.Created, ApiSuccess(message = "Admin user created with id $id"))
                val adminId = call.getAdminId()
                try {
                    auditService.log(adminId, "admin_user_created", "id=$id", call.request.local.remoteHost)
                } catch (e: Exception) {
                    call.application.environment.log.warn("Audit log failed for admin_user_created: ${e.message}")
                }
            }

            put("/admin-users/{id}") {
                if (!call.requireRole("superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Superadmin required"))
                    return@put
                }
                val id = call.parameters["id"]?.toIntOrNull() ?: run {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_id", "Invalid admin user ID"))
                    return@put
                }
                val req = try {
                    call.receive<UpdateAdminUserRequest>()
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Invalid request body"))
                    return@put
                }
                val validRoles = setOf("viewer", "editor", "superadmin")
                if (req.role != null && req.role !in validRoles) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_role", "Role must be one of: viewer, editor, superadmin"))
                    return@put
                }
                val success = adminService.updateAdminUser(id, req)
                if (success) {
                    call.respond(ApiSuccess())
                    val adminId = call.getAdminId()
                    try {
                        auditService.log(adminId, "admin_user_updated", "id=$id", call.request.local.remoteHost)
                    } catch (e: Exception) {
                        call.application.environment.log.warn("Audit log failed for admin_user_updated: ${e.message}")
                    }
                } else {
                    call.respond(HttpStatusCode.NotFound, ApiError("not_found", "Admin user not found"))
                }
            }

            // ---- Audit Log ----
            get("/audit-log") {
                if (!call.requireRole("superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Superadmin required"))
                    return@get
                }
                val page = (call.parameters["page"]?.toIntOrNull() ?: 1).coerceAtLeast(1)
                val pageSize = (call.parameters["pageSize"]?.toIntOrNull() ?: 50).coerceIn(1, 100)
                val action = call.parameters["action"]
                val (entries, total) = adminService.getAuditLog(page, pageSize, action)
                call.respond(PaginatedResponse(items = entries, total = total, limit = pageSize, offset = (page - 1) * pageSize))
            }

            // ---- Reports ----
            get("/reports/export") {
                if (!call.requireRole("editor", "superadmin")) {
                    call.respond(HttpStatusCode.Forbidden, ApiError("forbidden", "Insufficient permissions"))
                    return@get
                }
                val type = call.parameters["type"] ?: "user_activity"
                val from = call.parameters["from"] ?: "2026-01-01"
                val to = call.parameters["to"] ?: kotlinx.datetime.Clock.System.now()
                    .toLocalDateTime(kotlinx.datetime.TimeZone.UTC).date.toString()

                call.response.header(
                    HttpHeaders.ContentDisposition,
                    "attachment; filename=\"$type-$from-$to.csv\""
                )

                fun String.csvEscape(): String {
    val sanitized = replace("\"", "\"\"").replace("\n", " ").replace("\r", "")
    // Prefix cells that start with formula-injection characters to prevent spreadsheet execution
    val safe = if (sanitized.firstOrNull() in listOf('=', '+', '-', '@', '|', '\t')) "\t$sanitized" else sanitized
    return "\"$safe\""
}

                // Generate simple CSV
                val sb = StringBuilder()
                when (type) {
                    "user_activity" -> {
                        sb.appendLine("id,name,phone,steps_30d,healthy_days_30d,platform")
                        val (users, _) = adminService.searchUsers("", 1, 5000)
                        users.forEach { u ->
                            sb.appendLine("${u.id},${u.name.csvEscape()},${u.phone},${u.totalStepsLast30Days},${u.healthyDaysLast30Days},${(u.connectedPlatform ?: "none").csvEscape()}")
                        }
                    }
                    else -> sb.appendLine("type,count").appendLine("${type.csvEscape()},0")
                }

                call.respondText(sb.toString(), ContentType.Text.CSV)
            }
        }
    }
}
