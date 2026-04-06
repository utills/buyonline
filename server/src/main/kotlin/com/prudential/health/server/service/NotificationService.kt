package com.prudential.health.server.service

import com.prudential.health.server.database.DatabaseFactory.dbQuery
import com.prudential.health.server.database.NotificationsTable
import com.prudential.health.server.model.NotificationDto
import com.prudential.health.server.model.PaginatedResponse
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.selectAll

class NotificationService {

    suspend fun getNotifications(userId: Int, limit: Int, offset: Int): PaginatedResponse<NotificationDto> = dbQuery {
        val baseQuery = NotificationsTable.selectAll()
            .where { NotificationsTable.userId eq userId }
        val total = baseQuery.count()
        val items = NotificationsTable.selectAll()
            .where { NotificationsTable.userId eq userId }
            .orderBy(NotificationsTable.createdAt, SortOrder.DESC)
            .limit(limit).offset(offset.toLong())
            .map { row ->
                NotificationDto(
                    id = row[NotificationsTable.id].value.toString(),
                    title = row[NotificationsTable.title],
                    message = row[NotificationsTable.message],
                    type = row[NotificationsTable.type],
                    timestamp = row[NotificationsTable.timestamp].toString(),
                    isRead = row[NotificationsTable.isRead],
                )
            }
        PaginatedResponse(items = items, total = total, limit = limit, offset = offset)
    }
}
