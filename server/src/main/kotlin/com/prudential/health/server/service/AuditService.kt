package com.prudential.health.server.service

import com.prudential.health.server.database.AuditLogTable
import com.prudential.health.server.database.DatabaseFactory.dbQuery
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.insert

class AuditService {

    suspend fun log(userId: Int?, action: String, detail: String = "", ipAddress: String = "") {
        dbQuery {
            val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)
            AuditLogTable.insert {
                it[AuditLogTable.userId] = userId
                it[AuditLogTable.action] = action
                it[AuditLogTable.detail] = detail
                it[AuditLogTable.ipAddress] = ipAddress
                it[AuditLogTable.timestamp] = now
                it[AuditLogTable.createdAt] = now
            }
        }
    }
}
