package com.prudential.health.server.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.server.config.*
import java.util.*

class AdminJwtConfig(config: ApplicationConfig) {
    private val secret = config.propertyOrNull("jwt.adminSecret")?.getString()
        ?: config.property("jwt.secret").getString().also {
            System.err.println("WARNING: jwt.adminSecret not configured. Set JWT_ADMIN_SECRET env var in production.")
        }
    private val issuer = config.property("jwt.issuer").getString()
    private val audience = "admin-console"
    val realm = "PruHealth Admin Console"
    private val accessExpiryMs = 8 * 60 * 60 * 1000L  // 8 hours
    private val refreshExpiryMs = 30 * 24 * 60 * 60 * 1000L // 30 days

    private val algorithm = Algorithm.HMAC256(secret)

    val verifier: JWTVerifier = JWT.require(algorithm)
        .withAudience(audience)
        .withIssuer(issuer)
        .withClaim("type", "admin")
        .build()

    fun generateAccessToken(adminId: Int, email: String, role: String): Pair<String, Long> {
        val expiresAt = System.currentTimeMillis() + accessExpiryMs
        val token = JWT.create()
            .withAudience(audience)
            .withIssuer(issuer)
            .withClaim("adminId", adminId)
            .withClaim("email", email)
            .withClaim("role", role)
            .withClaim("type", "admin")
            .withExpiresAt(Date(expiresAt))
            .sign(algorithm)
        return token to expiresAt
    }

    fun generateRefreshToken(adminId: Int): String {
        return JWT.create()
            .withAudience(audience)
            .withIssuer(issuer)
            .withClaim("adminId", adminId)
            .withClaim("type", "admin")
            .withClaim("tokenType", "refresh")
            .withExpiresAt(Date(System.currentTimeMillis() + refreshExpiryMs))
            .sign(algorithm)
    }
}
