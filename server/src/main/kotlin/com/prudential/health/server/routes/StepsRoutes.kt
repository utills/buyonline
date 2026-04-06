package com.prudential.health.server.routes

import com.prudential.health.server.model.ApiError
import com.prudential.health.server.model.ApiSuccess
import com.prudential.health.server.model.ConnectPlatformRequest
import com.prudential.health.server.model.StepSyncRequest
import com.prudential.health.server.service.StepsService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.datetime.LocalDate

private val validPlatforms = setOf("google_fit", "apple_health")
private val validPeriods = setOf("weekly", "monthly", "yearly")
private val datePattern = Regex("""^\d{4}-\d{2}-\d{2}$""")

fun Route.stepsRoutes(stepsService: StepsService) {
    route("/v1/steps") {

        get("/today") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val data = stepsService.getTodaySteps(userId)
            call.respond(data)
        }

        get("/summary") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val period = call.request.queryParameters["period"] ?: "weekly"
            if (period !in validPeriods) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_period", "Period must be one of: ${validPeriods.joinToString()}"))
                return@get
            }
            val summary = stepsService.getSummary(userId, period)
            call.respond(summary)
        }

        get("/connection") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val platform = stepsService.getConnectedPlatform(userId)
            call.respond(mapOf("platform" to (platform ?: "none")))
        }

        post("/connect") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@post
            }
            val request = call.receive<ConnectPlatformRequest>()
            if (request.platform !in validPlatforms) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_platform", "Platform must be google_fit or apple_health"))
                return@post
            }
            stepsService.connectPlatform(userId, request.platform)
            call.respond(ApiSuccess(message = "Connected to ${request.platform}"))
        }

        post("/sync") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@post
            }
            val request = call.receive<StepSyncRequest>()
            if (request.entries.size > 365) {
                call.respond(HttpStatusCode.BadRequest, ApiError("too_many_entries", "Max 365 entries per sync"))
                return@post
            }

            for ((index, entry) in request.entries.withIndex()) {
                if (!datePattern.matches(entry.date)) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_date", "Entry[$index]: date must match YYYY-MM-DD"))
                    return@post
                }
                try {
                    LocalDate.parse(entry.date)
                } catch (_: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_date", "Entry[$index]: date '${entry.date}' is not a valid calendar date"))
                    return@post
                }
                if (entry.steps < 0 || entry.steps > 200_000) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_steps", "Entry[$index]: steps must be 0-200000"))
                    return@post
                }
                if (entry.distanceKm < 0 || entry.distanceKm > 500.0) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_distance", "Entry[$index]: distanceKm must be 0-500"))
                    return@post
                }
                if (entry.activeMinutes < 0 || entry.activeMinutes > 1440) {
                    call.respond(HttpStatusCode.BadRequest, ApiError("invalid_active_minutes", "Entry[$index]: activeMinutes must be 0-1440"))
                    return@post
                }
            }

            val result = stepsService.syncSteps(userId, request)
            call.respond(result)
        }

        post("/disconnect") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@post
            }
            stepsService.disconnectPlatform(userId)
            call.respond(ApiSuccess(message = "Disconnected"))
        }

        get("/milestones") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val milestones = stepsService.getHealthJourneyMilestones(userId)
            call.respond(milestones)
        }
    }
}

fun RoutingCall.getUserId(): Int? {
    return principal<JWTPrincipal>()
        ?.payload?.getClaim("userId")?.asInt()
}
