package com.prudential.health.server.service

import com.prudential.health.server.database.*
import com.prudential.health.server.database.DatabaseFactory.dbQuery
import com.prudential.health.server.model.*
import kotlinx.datetime.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.lessEq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.like
import org.mindrot.jbcrypt.BCrypt
import java.util.concurrent.ConcurrentHashMap

class AdminService {

    // ---- Account lockout ----
    private val failedLoginAttempts = ConcurrentHashMap<String, Pair<Int, Instant>>()
    private val maxLoginAttempts = 5
    private val lockoutSeconds = 30 * 60

    // ---- Auth ----

    suspend fun login(email: String, password: String): Pair<Int, String>? {
        // Check lockout before hitting the database
        val now = Clock.System.now()
        val lockoutEntry = failedLoginAttempts[email]
        if (lockoutEntry != null) {
            val (count, windowStart) = lockoutEntry
            val secondsElapsed = (now - windowStart).inWholeSeconds
            if (count >= maxLoginAttempts && secondsElapsed < lockoutSeconds) {
                return null
            }
            // Window expired — clear stale entry
            if (secondsElapsed >= lockoutSeconds) {
                failedLoginAttempts.remove(email)
            }
        }

        return dbQuery {
            val row = AdminUsersTable
                .selectAll()
                .where { (AdminUsersTable.email eq email) and (AdminUsersTable.isActive eq true) }
                .singleOrNull() ?: run {
                    recordFailedAttempt(email, now)
                    return@dbQuery null
                }

            if (!BCrypt.checkpw(password, row[AdminUsersTable.passwordHash])) {
                recordFailedAttempt(email, now)
                return@dbQuery null
            }

            val adminId = row[AdminUsersTable.id].value
            val role = row[AdminUsersTable.role]

            AdminUsersTable.update({ AdminUsersTable.id eq adminId }) {
                it[lastLoginAt] = Clock.System.now().toLocalDateTime(TimeZone.UTC)
            }

            // Clear failed attempts on successful login
            failedLoginAttempts.remove(email)

            adminId to role
        }
    }

    private fun recordFailedAttempt(email: String, now: Instant) {
        failedLoginAttempts.compute(email) { _, existing ->
            if (existing == null) {
                1 to now
            } else {
                val (count, windowStart) = existing
                val secondsElapsed = (now - windowStart).inWholeSeconds
                if (secondsElapsed >= lockoutSeconds) {
                    // Window expired — start a new window
                    1 to now
                } else {
                    (count + 1) to windowStart
                }
            }
        }
    }

    suspend fun getAdminById(adminId: Int): AdminUserListDto? = dbQuery {
        AdminUsersTable
            .selectAll()
            .where { AdminUsersTable.id eq adminId }
            .singleOrNull()
            ?.let { row ->
                AdminUserListDto(
                    id = row[AdminUsersTable.id].value,
                    email = row[AdminUsersTable.email],
                    name = row[AdminUsersTable.name],
                    role = row[AdminUsersTable.role],
                    isActive = row[AdminUsersTable.isActive],
                    createdAt = row[AdminUsersTable.createdAt].toString(),
                    lastLoginAt = row[AdminUsersTable.lastLoginAt]?.toString(),
                )
            }
    }

    // ---- Overview KPIs ----

    suspend fun getOverviewKpis(): OverviewKpiDto = dbQuery {
        val today = Clock.System.now().toLocalDateTime(TimeZone.UTC).date
        val monthStart = LocalDate(today.year, today.month, 1)
        val lastMonthStart = monthStart.minus(1, DateTimeUnit.MONTH)

        val totalUsers = UsersTable.selectAll().count().toInt()

        val activeUsersToday = StepRecordsTable
            .selectAll()
            .where { StepRecordsTable.date eq today }
            .count().toInt()

        val stepsTodayRows = StepRecordsTable
            .select(StepRecordsTable.steps)
            .where { StepRecordsTable.date eq today }
            .toList()
        val avgStepsToday = if (stepsTodayRows.isEmpty()) 0
        else stepsTodayRows.sumOf { it[StepRecordsTable.steps] } / stepsTodayRows.size

        val healthyDaysThisMonth = StepRecordsTable
            .selectAll()
            .where {
                (StepRecordsTable.date greaterEq monthStart) and
                (StepRecordsTable.date lessEq today) and
                (StepRecordsTable.isHealthyDay eq true)
            }.count().toInt()

        val usersThisMonth = UsersTable
            .selectAll()
            .where { UsersTable.createdAt greaterEq monthStart.atStartOfDayIn(TimeZone.UTC).toLocalDateTime(TimeZone.UTC) }
            .count().toInt()
        val usersLastMonth = UsersTable
            .selectAll()
            .where {
                (UsersTable.createdAt greaterEq lastMonthStart.atStartOfDayIn(TimeZone.UTC).toLocalDateTime(TimeZone.UTC)) and
                (UsersTable.createdAt lessEq monthStart.atStartOfDayIn(TimeZone.UTC).toLocalDateTime(TimeZone.UTC))
            }
            .count().toInt()
        val userGrowthPercent = if (usersLastMonth == 0) 0.0
        else ((usersThisMonth - usersLastMonth).toDouble() / usersLastMonth * 100)

        val weekStart = today.minus(7, DateTimeUnit.DAY)
        val prevWeekStart = weekStart.minus(7, DateTimeUnit.DAY)
        val avgThisWeek = StepRecordsTable
            .select(StepRecordsTable.steps)
            .where { (StepRecordsTable.date greaterEq weekStart) and (StepRecordsTable.date lessEq today) }
            .map { it[StepRecordsTable.steps] }.average()
        val avgLastWeek = StepRecordsTable
            .select(StepRecordsTable.steps)
            .where { (StepRecordsTable.date greaterEq prevWeekStart) and (StepRecordsTable.date lessEq weekStart) }
            .map { it[StepRecordsTable.steps] }.average()
        val stepsChangePercent = if (avgLastWeek == 0.0 || avgLastWeek.isNaN()) 0.0
        else ((avgThisWeek - avgLastWeek) / avgLastWeek * 100)

        OverviewKpiDto(
            totalUsers = totalUsers,
            activeUsersToday = activeUsersToday,
            avgStepsToday = avgStepsToday,
            totalHealthyDaysThisMonth = healthyDaysThisMonth,
            userGrowthPercent = (userGrowthPercent * 10).toInt() / 10.0,
            stepsChangePercent = (stepsChangePercent * 10).toInt() / 10.0,
        )
    }

    // ---- Step Trends ----

    suspend fun getStepTrends(from: LocalDate, to: LocalDate): List<StepTrendEntry> = dbQuery {
        val totalStepsExpr = StepRecordsTable.steps.sum()
        val activeUsersExpr = StepRecordsTable.userId.countDistinct()
        val rowCountExpr = StepRecordsTable.steps.count()
        val healthyCountExpr = Sum(
            Case().When(StepRecordsTable.isHealthyDay eq true, intLiteral(1)).Else(intLiteral(0)),
            IntegerColumnType(),
        )

        StepRecordsTable
            .select(StepRecordsTable.date, totalStepsExpr, activeUsersExpr, rowCountExpr, healthyCountExpr)
            .where { (StepRecordsTable.date greaterEq from) and (StepRecordsTable.date lessEq to) }
            .groupBy(StepRecordsTable.date)
            .orderBy(StepRecordsTable.date to SortOrder.ASC)
            .map { row ->
                val total = row[totalStepsExpr]?.toLong() ?: 0L
                val active = row[activeUsersExpr]
                StepTrendEntry(
                    date = row[StepRecordsTable.date].toString(),
                    totalSteps = total,
                    avgSteps = if (active == 0L) 0 else (total / active).toInt(),
                    activeUsers = active.toInt(),
                    healthyDayCount = row[healthyCountExpr] ?: 0,
                )
            }
    }

    // ---- Platform Breakdown ----

    suspend fun getPlatformBreakdown(): List<PlatformCountDto> = dbQuery {
        val rows = HealthConnectionsTable
            .selectAll()
            .where { HealthConnectionsTable.isConnected eq true }
            .toList()
        val total = rows.size.toDouble().coerceAtLeast(1.0)
        rows
            .groupBy { it[HealthConnectionsTable.platform] }
            .map { (platform, entries) ->
                PlatformCountDto(
                    platform = platform,
                    count = entries.size,
                    percent = (entries.size / total * 100 * 10).toInt() / 10.0,
                )
            }
            .sortedByDescending { it.count }
    }

    // ---- Consent Stats ----

    suspend fun getConsentStats(): List<ConsentStatDto> = dbQuery {
        val totalUsers = UsersTable.selectAll().count().toInt().coerceAtLeast(1)
        UserConsentsTable
            .selectAll()
            .toList()
            .groupBy { it[UserConsentsTable.consentType] }
            .map { (type, rows) ->
                val accepted = rows.count { it[UserConsentsTable.isAccepted] }
                ConsentStatDto(
                    consentType = type,
                    acceptedCount = accepted,
                    totalUsers = totalUsers,
                    complianceRate = (accepted.toDouble() / totalUsers * 100 * 10).toInt() / 10.0,
                )
            }
    }

    // ---- Calculator Usage ----

    suspend fun getCalculatorUsage(): List<CalculatorUsageDto> = dbQuery {
        CalculatorResultsTable
            .selectAll()
            .toList()
            .groupBy { it[CalculatorResultsTable.calculatorType] }
            .map { (type, rows) ->
                val scores = rows.mapNotNull { it[CalculatorResultsTable.score]?.toDoubleOrNull() }
                CalculatorUsageDto(
                    calculatorType = type,
                    usageCount = rows.size,
                    avgScore = if (scores.isEmpty()) 0.0 else (scores.average() * 10).toInt() / 10.0,
                )
            }
            .sortedByDescending { it.usageCount }
    }

    // ---- Top Users ----

    suspend fun getTopUsers(limit: Int, from: LocalDate, to: LocalDate): List<TopUserEntry> = dbQuery {
        val totalStepsExpr = StepRecordsTable.steps.sum()
        val healthyDaysExpr = Sum(
            Case().When(StepRecordsTable.isHealthyDay eq true, intLiteral(1)).Else(intLiteral(0)),
            IntegerColumnType(),
        )

        val aggregated = StepRecordsTable
            .select(StepRecordsTable.userId, totalStepsExpr, healthyDaysExpr)
            .where { (StepRecordsTable.date greaterEq from) and (StepRecordsTable.date lessEq to) }
            .groupBy(StepRecordsTable.userId)
            .orderBy(totalStepsExpr to SortOrder.DESC)
            .limit(limit)
            .associate { row ->
                row[StepRecordsTable.userId].value to Pair(
                    row[totalStepsExpr]?.toLong() ?: 0L,
                    row[healthyDaysExpr] ?: 0,
                )
            }

        if (aggregated.isEmpty()) return@dbQuery emptyList()

        val userIds = aggregated.keys.toList()

        val users = UsersTable
            .selectAll()
            .where { UsersTable.id inList userIds }
            .associateBy { it[UsersTable.id].value }

        val policyByUser = PolicyMembersTable
            .join(PoliciesTable, JoinType.LEFT, PolicyMembersTable.policyId, PoliciesTable.id)
            .selectAll()
            .where { PolicyMembersTable.userId inList userIds }
            .associate { it[PolicyMembersTable.userId].value to it.getOrNull(PoliciesTable.policyNumber) }

        aggregated.entries.mapNotNull { (userId, stepData) ->
            val user = users[userId] ?: return@mapNotNull null
            TopUserEntry(
                id = userId,
                name = user[UsersTable.name],
                phone = user[UsersTable.phone],
                totalSteps = stepData.first,
                healthyDays = stepData.second,
                policyNumber = policyByUser[userId],
            )
        }
    }

    // ---- Users ----

    suspend fun searchUsers(q: String, page: Int, pageSize: Int): Pair<List<UserAdminDto>, Long> = dbQuery {
        val baseQuery = if (q.isNotBlank()) {
            val pattern = "%${q.lowercase()}%"
            UsersTable.selectAll().where {
                (UsersTable.name.lowerCase() like pattern) or
                (UsersTable.phone like pattern)
            }
        } else {
            UsersTable.selectAll()
        }

        val total = baseQuery.count()
        val offset = ((page - 1) * pageSize).toLong()
        val userRows = baseQuery.orderBy(UsersTable.createdAt, SortOrder.DESC)
            .limit(pageSize, offset)
            .toList()

        val userIds = userRows.map { it[UsersTable.id].value }

        val policyByUser = if (userIds.isNotEmpty()) {
            PolicyMembersTable
                .join(PoliciesTable, JoinType.LEFT, PolicyMembersTable.policyId, PoliciesTable.id)
                .selectAll()
                .where { PolicyMembersTable.userId inList userIds }
                .associate { it[PolicyMembersTable.userId].value to Pair(it[PoliciesTable.policyNumber], it[PoliciesTable.status]) }
        } else emptyMap()

        val platformByUser = if (userIds.isNotEmpty()) {
            HealthConnectionsTable
                .selectAll()
                .where { (HealthConnectionsTable.userId inList userIds) and (HealthConnectionsTable.isConnected eq true) }
                .associate { it[HealthConnectionsTable.userId].value to it[HealthConnectionsTable.platform] }
        } else emptyMap()

        val thirtyDaysAgo = Clock.System.now().toLocalDateTime(TimeZone.UTC).date.minus(30, DateTimeUnit.DAY)
        val stepsByUser = if (userIds.isNotEmpty()) {
            StepRecordsTable
                .selectAll()
                .where {
                    (StepRecordsTable.userId inList userIds) and
                    (StepRecordsTable.date greaterEq thirtyDaysAgo)
                }
                .toList()
                .groupBy { it[StepRecordsTable.userId].value }
        } else emptyMap()

        val lastActiveByUser = if (userIds.isNotEmpty()) {
            StepRecordsTable
                .select(StepRecordsTable.userId, StepRecordsTable.date)
                .where { StepRecordsTable.userId inList userIds }
                .orderBy(StepRecordsTable.date, SortOrder.DESC)
                .toList()
                .groupBy { it[StepRecordsTable.userId].value }
                .mapValues { (_, rows) -> rows.firstOrNull()?.get(StepRecordsTable.date)?.toString() }
        } else emptyMap()

        val users = userRows.map { row ->
            val uid = row[UsersTable.id].value
            val steps = stepsByUser[uid] ?: emptyList()
            val policy = policyByUser[uid]
            UserAdminDto(
                id = uid,
                name = row[UsersTable.name],
                phone = row[UsersTable.phone],
                email = row[UsersTable.email],
                joinedDate = row[UsersTable.joinedDate]?.toString() ?: "",
                policyNumber = policy?.first,
                policyStatus = policy?.second,
                totalStepsLast30Days = steps.sumOf { it[StepRecordsTable.steps].toLong() },
                healthyDaysLast30Days = steps.count { it[StepRecordsTable.isHealthyDay] },
                connectedPlatform = platformByUser[uid],
                lastActiveDate = lastActiveByUser[uid],
            )
        }

        users to total
    }

    suspend fun getUserDetail(id: Int): UserDetailAdminDto? = dbQuery {
        val userRow = UsersTable.selectAll().where { UsersTable.id eq id }.singleOrNull()
            ?: return@dbQuery null

        val policyRow = PolicyMembersTable
            .join(PoliciesTable, JoinType.LEFT, PolicyMembersTable.policyId, PoliciesTable.id)
            .selectAll()
            .where { PolicyMembersTable.userId eq id }
            .firstOrNull()

        val platformRow = HealthConnectionsTable
            .selectAll()
            .where { (HealthConnectionsTable.userId eq id) and (HealthConnectionsTable.isConnected eq true) }
            .firstOrNull()

        val thirtyDaysAgo = Clock.System.now().toLocalDateTime(TimeZone.UTC).date.minus(30, DateTimeUnit.DAY)
        val stepRows = StepRecordsTable
            .selectAll()
            .where { (StepRecordsTable.userId eq id) and (StepRecordsTable.date greaterEq thirtyDaysAgo) }
            .orderBy(StepRecordsTable.date, SortOrder.DESC)
            .toList()

        val consentRows = UserConsentsTable
            .selectAll()
            .where { UserConsentsTable.userId eq id }
            .toList()

        val activeSessions = SessionsTable
            .selectAll()
            .where { (SessionsTable.userId eq id) and (SessionsTable.isActive eq true) }
            .count().toInt()

        val user = UserAdminDto(
            id = id,
            name = userRow[UsersTable.name],
            phone = userRow[UsersTable.phone],
            email = userRow[UsersTable.email],
            joinedDate = userRow[UsersTable.joinedDate]?.toString() ?: "",
            policyNumber = policyRow?.get(PoliciesTable.policyNumber),
            policyStatus = policyRow?.get(PoliciesTable.status),
            totalStepsLast30Days = stepRows.sumOf { it[StepRecordsTable.steps].toLong() },
            healthyDaysLast30Days = stepRows.count { it[StepRecordsTable.isHealthyDay] },
            connectedPlatform = platformRow?.get(HealthConnectionsTable.platform),
            lastActiveDate = stepRows.firstOrNull()?.get(StepRecordsTable.date)?.toString(),
        )

        UserDetailAdminDto(
            user = user,
            stepHistory = stepRows.map { row ->
                StepHistoryEntry(
                    date = row[StepRecordsTable.date].toString(),
                    steps = row[StepRecordsTable.steps],
                    isHealthyDay = row[StepRecordsTable.isHealthyDay],
                )
            },
            consents = consentRows.map { row ->
                ConsentStatusDto(
                    consentType = row[UserConsentsTable.consentType],
                    isAccepted = row[UserConsentsTable.isAccepted],
                    acceptedAt = row[UserConsentsTable.acceptedAt]?.toString(),
                )
            },
            activeSessions = activeSessions,
        )
    }

    // ---- Policies ----

    suspend fun getPolicies(q: String, page: Int, pageSize: Int): Pair<List<PolicyAdminDto>, Long> = dbQuery {
        val baseQuery = if (q.isNotBlank()) {
            val pattern = "%${q.lowercase()}%"
            PoliciesTable.selectAll().where {
                (PoliciesTable.policyNumber.lowerCase() like pattern) or
                (PoliciesTable.policyHolderName.lowerCase() like pattern)
            }
        } else {
            PoliciesTable.selectAll()
        }
        val total = baseQuery.count()
        val offset = ((page - 1) * pageSize).toLong()
        val rows = baseQuery.orderBy(PoliciesTable.id, SortOrder.DESC).limit(pageSize, offset).toList()

        val policyIds = rows.map { it[PoliciesTable.id].value }
        val memberCounts = if (policyIds.isNotEmpty()) {
            PolicyMembersTable
                .selectAll()
                .where { PolicyMembersTable.policyId inList policyIds }
                .toList()
                .groupBy { it[PolicyMembersTable.policyId].value }
                .mapValues { it.value.size }
        } else emptyMap()

        val policies = rows.map { row ->
            val pid = row[PoliciesTable.id].value
            PolicyAdminDto(
                id = pid,
                policyNumber = row[PoliciesTable.policyNumber],
                planName = row[PoliciesTable.planName],
                policyHolder = row[PoliciesTable.policyHolderName],
                status = row[PoliciesTable.status],
                sumInsured = row[PoliciesTable.sumInsured].toDouble(),
                annualPremium = row[PoliciesTable.annualPremium].toDouble(),
                renewalDate = row[PoliciesTable.renewalDate].toString(),
                memberCount = memberCounts[pid] ?: 0,
            )
        }
        policies to total
    }

    // ---- Content ----

    suspend fun getAllArticles(): List<ArticleAdminDto> = dbQuery {
        ArticlesTable
            .selectAll()
            .orderBy(ArticlesTable.id, SortOrder.DESC)
            .map { row ->
                ArticleAdminDto(
                    id = row[ArticlesTable.id].value,
                    title = row[ArticlesTable.title],
                    description = row[ArticlesTable.description],
                    imageUrl = row[ArticlesTable.imageUrl],
                    category = row[ArticlesTable.category],
                    publishedDate = row[ArticlesTable.publishedDate].toString(),
                    isPublished = row[ArticlesTable.isPublished],
                )
            }
    }

    suspend fun createArticle(req: CreateArticleRequest): Int = dbQuery {
        val pubDate = try {
            LocalDate.parse(req.publishedDate.ifBlank { "2026-01-01" })
        } catch (e: Exception) {
            Clock.System.now().toLocalDateTime(TimeZone.UTC).date
        }
        ArticlesTable.insert {
            it[title] = req.title
            it[description] = req.description
            it[imageUrl] = req.imageUrl
            it[category] = req.category
            it[publishedDate] = pubDate
            it[isPublished] = req.isPublished
        } get ArticlesTable.id
    }.value

    suspend fun updateArticle(id: Int, req: CreateArticleRequest): Boolean = dbQuery {
        val pubDate = try {
            LocalDate.parse(req.publishedDate.ifBlank { "2026-01-01" })
        } catch (e: Exception) {
            Clock.System.now().toLocalDateTime(TimeZone.UTC).date
        }
        val updated = ArticlesTable.update({ ArticlesTable.id eq id }) {
            it[title] = req.title
            it[description] = req.description
            it[imageUrl] = req.imageUrl
            it[category] = req.category
            it[publishedDate] = pubDate
            it[isPublished] = req.isPublished
        }
        updated > 0
    }

    suspend fun setArticlePublished(id: Int, isPublished: Boolean): Boolean = dbQuery {
        val updated = ArticlesTable.update({ ArticlesTable.id eq id }) {
            it[ArticlesTable.isPublished] = isPublished
        }
        updated > 0
    }

    suspend fun deleteArticle(id: Int): Boolean = dbQuery {
        val deleted = ArticlesTable.deleteWhere { ArticlesTable.id eq id }
        deleted > 0
    }

    suspend fun getAllHelpTopics(): List<HelpTopicAdminDto> = dbQuery {
        HelpTopicsTable
            .selectAll()
            .orderBy(HelpTopicsTable.sortOrder, SortOrder.ASC)
            .map { row ->
                HelpTopicAdminDto(
                    id = row[HelpTopicsTable.id].value,
                    question = row[HelpTopicsTable.question],
                    answer = row[HelpTopicsTable.answer],
                    order = row[HelpTopicsTable.sortOrder],
                    isActive = row[HelpTopicsTable.isActive],
                )
            }
    }

    suspend fun createHelpTopic(req: CreateHelpTopicRequest): Int = dbQuery {
        HelpTopicsTable.insert {
            it[question] = req.question
            it[answer] = req.answer
            it[sortOrder] = req.sortOrder
            it[isActive] = req.isActive
        } get HelpTopicsTable.id
    }.value

    suspend fun updateHelpTopic(id: Int, req: CreateHelpTopicRequest): Boolean = dbQuery {
        val updated = HelpTopicsTable.update({ HelpTopicsTable.id eq id }) {
            it[question] = req.question
            it[answer] = req.answer
            it[sortOrder] = req.sortOrder
            it[isActive] = req.isActive
        }
        updated > 0
    }

    suspend fun deleteHelpTopic(id: Int): Boolean = dbQuery {
        val deleted = HelpTopicsTable.deleteWhere { HelpTopicsTable.id eq id }
        deleted > 0
    }

    // ---- Notifications ----

    suspend fun sendNotification(req: SendNotificationRequest): Int = dbQuery {
        val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        val userIds = if (req.userIds != null && req.userIds.isNotEmpty()) {
            req.userIds
        } else {
            UsersTable.select(UsersTable.id).map { it[UsersTable.id].value }
        }
        NotificationsTable.batchInsert(userIds) { uid ->
            this[NotificationsTable.userId] = uid
            this[NotificationsTable.title] = req.title
            this[NotificationsTable.message] = req.message
            this[NotificationsTable.type] = req.type
            this[NotificationsTable.isRead] = false
            this[NotificationsTable.timestamp] = now
            this[NotificationsTable.createdAt] = now
        }
        userIds.size
    }

    // ---- Admin Users ----

    suspend fun listAdminUsers(): List<AdminUserListDto> = dbQuery {
        AdminUsersTable
            .selectAll()
            .orderBy(AdminUsersTable.createdAt, SortOrder.DESC)
            .map { row ->
                AdminUserListDto(
                    id = row[AdminUsersTable.id].value,
                    email = row[AdminUsersTable.email],
                    name = row[AdminUsersTable.name],
                    role = row[AdminUsersTable.role],
                    isActive = row[AdminUsersTable.isActive],
                    createdAt = row[AdminUsersTable.createdAt].toString(),
                    lastLoginAt = row[AdminUsersTable.lastLoginAt]?.toString(),
                )
            }
    }

    suspend fun createAdminUser(req: CreateAdminUserRequest): Int = dbQuery {
        val hash = BCrypt.hashpw(req.temporaryPassword, BCrypt.gensalt(12))
        AdminUsersTable.insert {
            it[email] = req.email
            it[passwordHash] = hash
            it[name] = req.name
            it[role] = req.role
            it[isActive] = true
        } get AdminUsersTable.id
    }.value

    suspend fun updateAdminUser(id: Int, req: UpdateAdminUserRequest): Boolean = dbQuery {
        val updated = AdminUsersTable.update({ AdminUsersTable.id eq id }) {
            req.role?.let { r -> it[role] = r }
            req.isActive?.let { a -> it[isActive] = a }
        }
        updated > 0
    }

    // ---- Audit Log ----

    suspend fun getAuditLog(page: Int, pageSize: Int, action: String?): Pair<List<AuditLogEntryDto>, Long> = dbQuery {
        val baseQuery = if (!action.isNullOrBlank()) {
            val pattern = "%${action.lowercase()}%"
            AuditLogTable.selectAll().where { AuditLogTable.action.lowerCase() like pattern }
        } else {
            AuditLogTable.selectAll()
        }
        val total = baseQuery.count()
        val offset = ((page - 1) * pageSize).toLong()
        val rows = baseQuery.orderBy(AuditLogTable.timestamp, SortOrder.DESC).limit(pageSize, offset).toList()
        val entries = rows.map { row ->
            AuditLogEntryDto(
                id = row[AuditLogTable.id].value,
                action = row[AuditLogTable.action],
                detail = row[AuditLogTable.detail],
                ipAddress = row[AuditLogTable.ipAddress],
                timestamp = row[AuditLogTable.timestamp].toString(),
                adminId = null, // AuditLog tracks user actions; admin actions use separate logging
            )
        }
        entries to total
    }
}
