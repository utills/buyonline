package com.prudential.health.server.routes

import com.prudential.health.server.auth.JwtConfig
import com.prudential.health.server.model.*
import com.prudential.health.server.service.AuditService
import com.prudential.health.server.service.OtpService
import com.prudential.health.server.service.SessionService
import com.prudential.health.server.service.UserService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

private val PHONE_REGEX = Regex("^\\d{10}$")
private val OTP_REGEX = Regex("^\\d{6}$")

fun Route.authRoutes(
    otpService: OtpService,
    userService: UserService,
    jwtConfig: JwtConfig,
    sessionService: SessionService,
    auditService: AuditService,
) {
    route("/v1/auth") {

        post("/otp/send") {
            val request = try {
                call.receive<SendOtpRequest>()
            } catch (_: Exception) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Invalid request body"))
                return@post
            }
            val phone = request.phone.trim()
            if (!phone.matches(PHONE_REGEX)) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_phone", "Phone must be 10 digits"))
                return@post
            }
            if (otpService.isRateLimited(phone)) {
                call.respond(HttpStatusCode.TooManyRequests, ApiError("rate_limited", "Too many OTP requests. Please try again later."))
                return@post
            }
            val otp = otpService.generateOtp(phone)
            application.log.info("OTP sent to phone ending in ${phone.takeLast(4)}")

            try {
                auditService.log(null, "otp_sent", "phone=${phone.takeLast(4)}", call.request.local.remoteHost)
            } catch (e: Exception) {
                application.log.warn("Audit log failed for otp_sent: ${e.message}")
            }

            val maskedPhone = "****${phone.takeLast(4)}"
            call.respond(SendOtpResponse(otpSent = true, message = "OTP sent to $maskedPhone"))
        }

        post("/otp/verify") {
            val request = try {
                call.receive<VerifyOtpRequest>()
            } catch (_: Exception) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_body", "Invalid request body"))
                return@post
            }
            val phone = request.phone.trim()
            if (!phone.matches(PHONE_REGEX)) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_phone", "Phone must be 10 digits"))
                return@post
            }
            val otp = request.otp.trim()
            if (!otp.matches(OTP_REGEX)) {
                call.respond(HttpStatusCode.BadRequest, ApiError("invalid_otp", "OTP must be 6 digits"))
                return@post
            }
            if (otpService.isVerifyRateLimited(phone)) {
                call.respond(HttpStatusCode.TooManyRequests, ApiError("rate_limited", "Too many failed attempts. Please try again in 15 minutes."))
                return@post
            }

            val isValid = otpService.verifyOtp(phone, otp)

            if (!isValid) {
                otpService.recordFailedVerify(phone)
                call.respond(HttpStatusCode.Unauthorized, ApiError("invalid_otp", "Invalid or expired OTP"))
                return@post
            }
            otpService.clearVerifyAttempts(phone)

            // Find user by phone, or auto-register if new (race-safe via unique index)
            val user = userService.findOrCreateUser(phone)
            val userId = user.id.toIntOrNull()
            if (userId == null) {
                call.respond(HttpStatusCode.InternalServerError, ApiError("internal_error", "Invalid user ID"))
                return@post
            }

            val (accessToken, expiresAt) = jwtConfig.generateToken(userId, phone)
            val refreshToken = jwtConfig.generateRefreshToken(userId, phone)

            sessionService.createSession(
                userId = userId,
                accessToken = accessToken,
                refreshToken = refreshToken,
                expiresAt = expiresAt,
            )

            try {
                auditService.log(userId, "otp_verified", "", call.request.local.remoteHost)
            } catch (e: Exception) {
                application.log.warn("Audit log failed for otp_verified: ${e.message}")
            }

            call.respond(
                VerifyOtpResponse(
                    accessToken = accessToken,
                    refreshToken = refreshToken,
                    expiresAt = expiresAt,
                ),
            )
        }

        get("/policies") {
            val phone = call.request.queryParameters["phone"]
            if (phone.isNullOrBlank()) {
                call.respond(HttpStatusCode.BadRequest, ApiError("missing_phone", "Phone number is required"))
                return@get
            }
            val policies = userService.getPoliciesForPhone(phone.trim())
            call.respond(policies)
        }

        get("/members") {
            val policyNumber = call.request.queryParameters["policy"]?.trim().orEmpty()
            if (policyNumber.isBlank()) {
                call.respond(HttpStatusCode.BadRequest, ApiError("missing_policy", "Policy number required"))
                return@get
            }
            val members = userService.getMembersForPolicy(policyNumber)
            call.respond(members)
        }

        post("/token/refresh") {
            val body = try {
                call.receive<Map<String, String>>()
            } catch (_: Exception) {
                call.respond(HttpStatusCode.BadRequest, ApiError("bad_request", "refreshToken required"))
                return@post
            }
            val refreshTokenValue = body["refreshToken"]
            if (refreshTokenValue.isNullOrEmpty()) {
                call.respond(HttpStatusCode.BadRequest, ApiError("bad_request", "refreshToken required"))
                return@post
            }
            try {
                val decoded = jwtConfig.refreshVerifier.verify(refreshTokenValue)
                val userId = decoded.getClaim("userId").asInt()
                val phone = decoded.getClaim("phone")?.asString() ?: ""
                if (userId != null) {
                    // Invalidate old session
                    val oldAccessToken = call.request.headers["Authorization"]?.removePrefix("Bearer ")
                    if (!oldAccessToken.isNullOrBlank()) {
                        sessionService.invalidateSession(oldAccessToken)
                    }

                    val (newAccessToken, expiresAt) = jwtConfig.generateToken(userId, phone)
                    val newRefreshToken = jwtConfig.generateRefreshToken(userId, phone)

                    sessionService.createSession(
                        userId = userId,
                        accessToken = newAccessToken,
                        refreshToken = newRefreshToken,
                        expiresAt = expiresAt,
                    )

                    try {
                        auditService.log(userId, "token_refreshed", "", call.request.local.remoteHost)
                    } catch (e: Exception) {
                        application.log.warn("Audit log failed for token_refreshed: ${e.message}")
                    }

                    call.respond(VerifyOtpResponse(newAccessToken, newRefreshToken, expiresAt))
                } else {
                    call.respond(HttpStatusCode.Unauthorized, ApiError("invalid_token", "Invalid refresh token"))
                }
            } catch (_: Exception) {
                call.respond(HttpStatusCode.Unauthorized, ApiError("expired_token", "Refresh token expired"))
            }
        }

        post("/logout") {
            val accessToken = call.request.headers["Authorization"]?.removePrefix("Bearer ")
            if (!accessToken.isNullOrBlank()) {
                sessionService.invalidateSession(accessToken)
            }

            try {
                auditService.log(null, "logout", "", call.request.local.remoteHost)
            } catch (e: Exception) {
                application.log.warn("Audit log failed for logout: ${e.message}")
            }

            call.respond(ApiSuccess(message = "Logged out successfully"))
        }
    }
}
