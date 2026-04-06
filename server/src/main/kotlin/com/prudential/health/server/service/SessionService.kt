package com.prudential.health.server.service

import com.prudential.health.server.database.DatabaseFactory.dbQuery
import com.prudential.health.server.database.SessionsTable
import com.prudential.health.server.model.SessionDto
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update

class SessionService {

    suspend fun createSession(
        userId: Int,
        accessToken: String,
        refreshToken: String,
        expiresAt: Long,
        deviceId: String? = null,
    ) {
        dbQuery {
            SessionsTable.insert {
                it[SessionsTable.userId] = userId
                it[SessionsTable.accessToken] = accessToken
                it[SessionsTable.refreshToken] = refreshToken
                it[SessionsTable.expiresAt] = expiresAt
                it[SessionsTable.deviceId] = deviceId
                it[SessionsTable.isActive] = true
                it[SessionsTable.createdAt] = Clock.System.now().toLocalDateTime(TimeZone.UTC)
            }
        }
    }

    suspend fun invalidateSession(accessToken: String) {
        dbQuery {
            SessionsTable.update({ SessionsTable.accessToken eq accessToken }) {
                it[isActive] = false
            }
        }
    }

    suspend fun invalidateAllUserSessions(userId: Int) {
        dbQuery {
            SessionsTable.update({
                (SessionsTable.userId eq userId) and (SessionsTable.isActive eq true)
            }) {
                it[isActive] = false
            }
        }
    }

    suspend fun isSessionActive(accessToken: String): Boolean {
        return dbQuery {
            SessionsTable.selectAll().where {
                (SessionsTable.accessToken eq accessToken) and (SessionsTable.isActive eq true)
            }.count() > 0
        }
    }

    suspend fun listActiveSessions(userId: Int): List<SessionDto> {
        return dbQuery {
            SessionsTable.selectAll().where {
                (SessionsTable.userId eq userId) and (SessionsTable.isActive eq true)
            }.map { row ->
                SessionDto(
                    id = row[SessionsTable.id].value.toString(),
                    deviceId = row[SessionsTable.deviceId],
                    createdAt = row[SessionsTable.createdAt].toString(),
                    expiresAt = row[SessionsTable.expiresAt],
                )
            }
        }
    }
}
