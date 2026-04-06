package com.prudential.health.server.service

import com.prudential.health.server.database.ArticlesTable
import com.prudential.health.server.database.DatabaseFactory.dbQuery
import com.prudential.health.server.database.HelpTopicsTable
import com.prudential.health.server.model.ArticleDto
import com.prudential.health.server.model.HelpTopicDto
import com.prudential.health.server.model.PaginatedResponse
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.selectAll

class ContentService {

    suspend fun getArticles(limit: Int, offset: Int): PaginatedResponse<ArticleDto> = dbQuery {
        val baseQuery = ArticlesTable.selectAll()
            .where { ArticlesTable.isPublished eq true }
        val total = baseQuery.count()
        val items = baseQuery
            .orderBy(ArticlesTable.publishedDate, SortOrder.DESC)
            .limit(limit).offset(offset.toLong())
            .map { row ->
                ArticleDto(
                    id = row[ArticlesTable.id].value.toString(),
                    title = row[ArticlesTable.title],
                    description = row[ArticlesTable.description],
                    imageUrl = row[ArticlesTable.imageUrl],
                    category = row[ArticlesTable.category],
                    publishedDate = row[ArticlesTable.publishedDate].toString(),
                )
            }
        PaginatedResponse(items = items, total = total, limit = limit, offset = offset)
    }

    suspend fun getHelpTopics(limit: Int, offset: Int): PaginatedResponse<HelpTopicDto> = dbQuery {
        val baseQuery = HelpTopicsTable.selectAll()
            .where { HelpTopicsTable.isActive eq true }
        val total = baseQuery.count()
        val items = baseQuery
            .orderBy(HelpTopicsTable.sortOrder)
            .limit(limit).offset(offset.toLong())
            .map { row ->
                HelpTopicDto(
                    id = row[HelpTopicsTable.id].value.toString(),
                    question = row[HelpTopicsTable.question],
                    answer = row[HelpTopicsTable.answer],
                    order = row[HelpTopicsTable.sortOrder],
                )
            }
        PaginatedResponse(items = items, total = total, limit = limit, offset = offset)
    }
}
