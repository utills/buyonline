package com.prudential.health.server.routes

import com.prudential.health.server.model.ApiError
import com.prudential.health.server.model.ApiSuccess
import com.prudential.health.server.model.RecordConsentRequest
import com.prudential.health.server.model.UpdateProfileRequest
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import com.prudential.health.server.service.ConsentService
import com.prudential.health.server.service.NotificationService
import com.prudential.health.server.service.SessionService
import com.prudential.health.server.service.UserService
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

@Serializable
private data class UpdateSettingsRequest(val notificationsEnabled: Boolean? = null)

fun Route.profileRoutes(
    userService: UserService,
    notificationService: NotificationService,
    consentService: ConsentService,
    sessionService: SessionService,
) {
    route("/v1/profile") {

        get("/me") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val user = userService.findById(userId)
            if (user != null) {
                call.respond(user)
            } else {
                call.respond(HttpStatusCode.NotFound, ApiError("not_found", "User not found"))
            }
        }

        get("/policy") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val user = userService.findById(userId)
            if (user == null) {
                call.respond(HttpStatusCode.NotFound, ApiError("not_found", "User not found"))
                return@get
            }
            val policies = userService.getPoliciesForPhone(user.phone)
            val policy = policies.firstOrNull()
            if (policy == null) {
                call.respond(HttpStatusCode.NotFound, ApiError("not_found", "No policy found"))
                return@get
            }
            call.respond(policy)
        }

        get("/notifications") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val limit = (call.request.queryParameters["limit"]?.toIntOrNull() ?: 20).coerceIn(1, 100)
            val offset = (call.request.queryParameters["offset"]?.toIntOrNull() ?: 0).coerceIn(0, 10_000)
            val result = notificationService.getNotifications(userId, limit, offset)
            call.respond(result.items)
        }

        post("/update") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@post
            }
            val request = call.receive<UpdateProfileRequest>()
            if (request.name != null && (request.name.isBlank() || request.name.length > 255)) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_name", "Name must be 1–255 characters"))
                return@post
            }
            if (request.email != null && !Regex("""^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$""").matches(request.email)) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_email", "Invalid email address"))
                return@post
            }
            val updated = userService.updateUser(userId, request.name, request.email)
            if (updated) {
                call.respond(ApiSuccess(message = "Profile updated"))
            } else {
                call.respond(HttpStatusCode.NotFound, ApiError("not_found", "User not found"))
            }
        }

        get("/settings") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val user = userService.findById(userId) ?: run {
                call.respond(HttpStatusCode.NotFound, ApiError("not_found", "User not found"))
                return@get
            }
            call.respond(buildJsonObject {
                put("notificationsEnabled", true)
                put("userId", user.id)
                put("phone", user.phone)
                put("appVersion", "1.0.0")
                put("buildNumber", "1")
                put("developer", "Prudential Corporation Asia")
                put("termsUrl", "https://www.prudential.com.sg/terms")
                put("privacyPolicyUrl", "https://www.prudential.com.sg/privacy")
            })
        }

        post("/settings") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@post
            }
            userService.findById(userId) ?: run {
                call.respond(HttpStatusCode.NotFound, ApiError("not_found", "User not found"))
                return@post
            }
            call.receive<UpdateSettingsRequest>()
            call.respond(ApiSuccess(message = "Settings updated"))
        }

        // ---- Consent routes ----

        get("/consents") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val consents = consentService.getUserConsents(userId)
            call.respond(consents)
        }

        post("/consent") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@post
            }
            val request = call.receive<RecordConsentRequest>()
            val consentType = request.consentType.trim().lowercase()
            if (consentType.isBlank()) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_consent_type", "consentType must not be blank"))
                return@post
            }
            val allowedConsentTypes = setOf("data_processing", "health_data_sharing", "terms_of_service", "marketing", "notifications")
            if (consentType !in allowedConsentTypes) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_consent_type", "Unknown consent type: $consentType"))
                return@post
            }
            consentService.recordConsent(userId, consentType, request.isAccepted)
            val hasAll = consentService.hasRequiredConsents(userId)
            call.respond(buildJsonObject {
                put("success", true)
                put("message", "Consent recorded")
                put("hasAllRequiredConsents", hasAll)
            })
        }

        get("/sessions") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val sessions = sessionService.listActiveSessions(userId)
            call.respond(sessions)
        }
    }
}
