package com.prudential.health.server

import com.prudential.health.server.auth.AdminJwtConfig
import com.prudential.health.server.auth.JwtConfig
import com.prudential.health.server.service.AdminService
import com.prudential.health.server.database.DatabaseFactory
import com.prudential.health.server.model.ApiError
import com.prudential.health.server.routes.*
import com.prudential.health.server.service.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.callid.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.plugins.ratelimit.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import kotlin.time.Duration.Companion.seconds

fun main(args: Array<String>) = EngineMain.main(args)

fun Application.module() {
    // Database
    DatabaseFactory.init(environment.config)

    // JWT
    val jwtConfig = JwtConfig(environment.config)
    val adminJwtConfig = AdminJwtConfig(environment.config)
    val adminService = AdminService()

    // Services
    val otpService = OtpService()
    val userService = UserService()
    val stepsService = StepsService()
    val contentService = ContentService()
    val calculatorService = CalculatorService()
    val notificationService = NotificationService()
    val sessionService = SessionService()
    val consentService = ConsentService()
    val auditService = AuditService()

    // Plugins
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
            isLenient = true
            prettyPrint = true
            encodeDefaults = true
        })
    }

    // Reject requests larger than 1 MB
    intercept(io.ktor.server.application.ApplicationCallPipeline.Plugins) {
        val contentLength = call.request.headers[HttpHeaders.ContentLength]?.toLongOrNull()
        if (contentLength != null && contentLength > 1_048_576) {
            call.respond(HttpStatusCode.PayloadTooLarge, ApiError("payload_too_large", "Request body exceeds 1 MB limit"))
            finish()
        }
    }

    install(CORS) {
        // Development hosts
        allowHost("localhost:8080")
        allowHost("10.0.2.2:8080")
        allowHost("127.0.0.1:8080")
        // Production: add via environment variable
        System.getenv("CORS_ALLOWED_HOSTS")?.split(",")?.forEach { host ->
            allowHost(host.trim())
        }
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Options)
    }

    install(DefaultHeaders) {
        header("X-Content-Type-Options", "nosniff")
        header("X-Frame-Options", "DENY")
        header("X-XSS-Protection", "1; mode=block")
        header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
        header("Referrer-Policy", "no-referrer")
    }

    install(CallLogging) {
        callIdMdc("request-id")
    }

    install(CallId) {
        header(HttpHeaders.XRequestId)
        generate { java.util.UUID.randomUUID().toString() }
        verify { it.isNotEmpty() }
    }

    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.application.environment.log.error("Unhandled error [${call.request.local.uri}]", cause)
            call.respond(
                HttpStatusCode.InternalServerError,
                ApiError("internal_error", "An unexpected error occurred"),
            )
        }
    }

    install(Authentication) {
        jwt("auth-jwt") {
            realm = jwtConfig.realm
            verifier(jwtConfig.verifier)
            validate { credential ->
                val userId = credential.payload.getClaim("userId").asInt()
                if (userId != null) {
                    val token = request.headers["Authorization"]?.removePrefix("Bearer ")
                    if (token != null && sessionService.isSessionActive(token)) {
                        JWTPrincipal(credential.payload)
                    } else {
                        null
                    }
                } else null
            }
            challenge { _, _ ->
                call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiError("unauthorized", "Token is invalid or expired"),
                )
            }
        }
        jwt("admin-jwt") {
            realm = adminJwtConfig.realm
            verifier(adminJwtConfig.verifier)
            validate { credential ->
                val adminId = credential.payload.getClaim("adminId").asInt()
                val type = credential.payload.getClaim("type").asString()
                if (adminId != null && type == "admin") {
                    // Verify the admin still exists and is active in the database.
                    // This ensures deactivated admins cannot use stale tokens.
                    val admin = adminService.getAdminById(adminId)
                    if (admin != null && admin.isActive) JWTPrincipal(credential.payload) else null
                } else null
            }
            challenge { _, _ ->
                call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiError("unauthorized", "Admin token required"),
                )
            }
        }
    }

    install(RateLimit) {
        register(RateLimitName("auth")) {
            rateLimiter(limit = 5, refillPeriod = 60.seconds)
            requestKey { call -> call.request.local.remoteHost }
        }
        register(RateLimitName("api")) {
            rateLimiter(limit = 60, refillPeriod = 60.seconds)
            requestKey { call ->
                call.principal<JWTPrincipal>()?.payload?.getClaim("userId")?.asInt()?.toString()
                    ?: call.request.local.remoteHost
            }
        }
        register(RateLimitName("admin")) {
            rateLimiter(limit = 200, refillPeriod = 60.seconds)
            requestKey { call ->
                call.principal<JWTPrincipal>()?.payload?.getClaim("adminId")?.asInt()?.toString()
                    ?: call.request.local.remoteHost
            }
        }
    }

    // Routes
    routing {
        // Health check (no rate limit)
        get("/health") {
            call.respond(mapOf("status" to "UP"))
        }

        // Public routes (auth rate limit)
        rateLimit(RateLimitName("auth")) {
            authRoutes(otpService, userService, jwtConfig, sessionService, auditService)
            contentRoutes(contentService)
        }

        // Protected routes (JWT required, API rate limit)
        rateLimit(RateLimitName("api")) {
            authenticate("auth-jwt") {
                stepsRoutes(stepsService)
                calculatorRoutes(calculatorService)
                profileRoutes(userService, notificationService, consentService, sessionService)
            }
        }

        rateLimit(RateLimitName("admin")) {
            adminRoutes(adminService, adminJwtConfig, auditService)
        }
    }

    environment.log.info("Pru Health Step Tracker API started on port ${environment.config.property("ktor.deployment.port").getString()}")
}
