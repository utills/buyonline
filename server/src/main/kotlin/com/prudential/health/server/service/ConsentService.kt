package com.prudential.health.server.service

import com.prudential.health.server.database.DatabaseFactory.dbQuery
import com.prudential.health.server.database.UserConsentsTable
import com.prudential.health.server.model.ConsentDto
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.upsert

class ConsentService {

    companion object {
        val REQUIRED_CONSENT_TYPES = listOf(
            "data_processing",
            "health_data_sharing",
            "terms_of_service",
        )
    }

    suspend fun recordConsent(userId: Int, consentType: String, accepted: Boolean): Unit = dbQuery {
        val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)

        UserConsentsTable.upsert(
            keys = arrayOf(UserConsentsTable.userId, UserConsentsTable.consentType),
        ) {
            it[this.userId] = userId
            it[this.consentType] = consentType
            it[isAccepted] = accepted
            it[acceptedAt] = if (accepted) now else null
        }
    }

    suspend fun getUserConsents(userId: Int): List<ConsentDto> = dbQuery {
        UserConsentsTable.selectAll()
            .where { UserConsentsTable.userId eq userId }
            .map { row ->
                ConsentDto(
                    consentType = row[UserConsentsTable.consentType],
                    isAccepted = row[UserConsentsTable.isAccepted],
                    acceptedAt = row[UserConsentsTable.acceptedAt]?.toString(),
                )
            }
    }

    suspend fun hasRequiredConsents(userId: Int): Boolean = dbQuery {
        val acceptedTypes = UserConsentsTable.selectAll()
            .where { (UserConsentsTable.userId eq userId) and (UserConsentsTable.isAccepted eq true) }
            .map { it[UserConsentsTable.consentType] }
            .toSet()

        REQUIRED_CONSENT_TYPES.all { it in acceptedTypes }
    }
}
