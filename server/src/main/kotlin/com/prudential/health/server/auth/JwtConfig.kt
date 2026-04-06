package com.prudential.health.server.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.server.config.*
import java.util.*

class JwtConfig(config: ApplicationConfig) {
    val secret = config.property("jwt.secret").getString()
    val issuer = config.property("jwt.issuer").getString()
    val audience = config.property("jwt.audience").getString()
    val realm = config.property("jwt.realm").getString()
    private val expiresInMs = config.property("jwt.expiresInMs").getString().toLong()

    init {
        if (secret == "dev-only-secret-do-not-use-in-production") {
            System.err.println("WARNING: Using development JWT secret. Set JWT_SECRET env var for production!")
        }
    }

    private val algorithm = Algorithm.HMAC256(secret)

    val verifier: JWTVerifier = JWT.require(algorithm)
        .withAudience(audience)
        .withIssuer(issuer)
        .build()

    val refreshVerifier: JWTVerifier = JWT.require(algorithm)
        .withAudience(audience)
        .withIssuer(issuer)
        .withClaim("type", "refresh")
        .build()

    fun generateToken(userId: Int, phone: String): Pair<String, Long> {
        val expiresAt = System.currentTimeMillis() + expiresInMs
        val token = JWT.create()
            .withAudience(audience)
            .withIssuer(issuer)
            .withClaim("userId", userId)
            .withClaim("phone", phone)
            .withExpiresAt(Date(expiresAt))
            .sign(algorithm)
        return token to expiresAt
    }

    fun generateRefreshToken(userId: Int, phone: String = ""): String {
        return JWT.create()
            .withAudience(audience)
            .withIssuer(issuer)
            .withClaim("userId", userId)
            .withClaim("phone", phone)
            .withClaim("type", "refresh")
            .withExpiresAt(Date(System.currentTimeMillis() + expiresInMs * 7))
            .sign(algorithm)
    }
}
