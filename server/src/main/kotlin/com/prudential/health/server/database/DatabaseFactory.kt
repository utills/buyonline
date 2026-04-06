package com.prudential.health.server.database

import org.mindrot.jbcrypt.BCrypt
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.config.*
import kotlinx.coroutines.Dispatchers
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.minus
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction

object DatabaseFactory {

    fun init(config: ApplicationConfig) {
        val driverClass = config.property("database.driver").getString()
        val jdbcUrl = config.property("database.url").getString()
        val dbUser = config.property("database.user").getString()
        val dbPassword = config.property("database.password").getString()
        val maxPoolSize = config.property("database.maxPoolSize").getString().toInt()

        val hikariConfig = HikariConfig().apply {
            driverClassName = driverClass
            this.jdbcUrl = jdbcUrl
            username = dbUser
            password = dbPassword
            maximumPoolSize = maxPoolSize
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            connectionTimeout = 10_000
            idleTimeout = 600_000
            maxLifetime = 1_800_000
            leakDetectionThreshold = 30_000
            validate()
        }

        val dataSource = HikariDataSource(hikariConfig)
        Database.connect(dataSource)

        transaction {
            SchemaUtils.create(
                UsersTable,
                PoliciesTable,
                PolicyMembersTable,
                OtpTable,
                SessionsTable,
                StepRecordsTable,
                HealthConnectionsTable,
                ArticlesTable,
                HelpTopicsTable,
                CalculatorResultsTable,
                NotificationsTable,
                UserConsentsTable,
                AuditLogTable,
                AdminUsersTable,
            )
        }

        seedData()
    }

    suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO) { block() }

    private fun seedData() {
        val env = System.getenv("APP_ENV") ?: "dev"
        if (env == "production") return

        transaction {
            // Only seed if tables are empty
            if (UsersTable.selectAll().count() > 0L) return@transaction

            val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)

            // ---- USERS ----
            val pranayId = UsersTable.insert {
                it[name] = "Pranay Shah"
                it[phone] = "9876893933"
                it[email] = "pranay@email.com"
                it[joinedDate] = LocalDate.parse("2024-09-23")
                it[isProposer] = true
                it[createdAt] = now
                it[updatedAt] = now
            } get UsersTable.id

            val adityaId = UsersTable.insert {
                it[name] = "Aditya Shah"
                it[phone] = "9876893934"
                it[joinedDate] = LocalDate.parse("2024-09-23")
                it[isProposer] = false
                it[createdAt] = now
                it[updatedAt] = now
            } get UsersTable.id

            val raghavId = UsersTable.insert {
                it[name] = "Raghav Shah"
                it[phone] = "9876893935"
                it[joinedDate] = LocalDate.parse("2024-09-23")
                it[isProposer] = false
                it[createdAt] = now
                it[updatedAt] = now
            } get UsersTable.id

            val riyaId = UsersTable.insert {
                it[name] = "Riya Shah"
                it[phone] = "9876893936"
                it[joinedDate] = LocalDate.parse("2024-09-23")
                it[isProposer] = false
                it[createdAt] = now
                it[updatedAt] = now
            } get UsersTable.id

            // ---- POLICIES ----
            val policyId = PoliciesTable.insert {
                it[policyNumber] = "100098768933"
                it[planName] = "Pru-Family Shield ++"
                it[policyHolderName] = "Pranay Shah"
                it[sumInsured] = java.math.BigDecimal("2000000.00")
                it[annualPremium] = java.math.BigDecimal("24400.00")
                it[startDate] = LocalDate.parse("2024-04-18")
                it[renewalDate] = LocalDate.parse("2026-04-14")
                it[isAutoDebitActive] = true
                it[status] = "active"
                it[createdAt] = now
            } get PoliciesTable.id

            // ---- POLICY MEMBERS ----
            PolicyMembersTable.insert {
                it[this.policyId] = policyId
                it[userId] = pranayId
                it[relationship] = "Self"
            }
            PolicyMembersTable.insert {
                it[this.policyId] = policyId
                it[userId] = adityaId
                it[relationship] = "Son"
            }
            PolicyMembersTable.insert {
                it[this.policyId] = policyId
                it[userId] = raghavId
                it[relationship] = "Son"
            }
            PolicyMembersTable.insert {
                it[this.policyId] = policyId
                it[userId] = riyaId
                it[relationship] = "Daughter"
            }

            // ---- STEP RECORDS (for Pranay - 31 days of realistic data, relative to today) ----
            val today = Clock.System.now().toLocalDateTime(TimeZone.UTC).date
            val stepOffsets = listOf(
                // day-offset, steps, isHealthy
                Pair(30, 7200), Pair(29, 11500), Pair(28, 4800), Pair(27, 10200),
                Pair(26, 13500), Pair(25, 8900), Pair(24, 6100),
                Pair(23, 10800), Pair(22, 12100), Pair(21, 9400), Pair(20, 15200),
                Pair(19, 7600), Pair(18, 11300), Pair(17, 10500),
                Pair(16, 8200), Pair(15, 13800), Pair(14, 5500), Pair(13, 10100),
                Pair(12, 14200), Pair(11, 9700), Pair(10, 11800),
                Pair(9, 6800), Pair(8, 10400), Pair(7, 8500), Pair(6, 12300),
                Pair(5, 6200), Pair(4, 11000), Pair(3, 9800),
                Pair(2, 14500), Pair(1, 12000), Pair(0, 12000),
            )
            val stepDays = stepOffsets.map { (offset, steps) ->
                Triple(today.minus(offset, DateTimeUnit.DAY), steps, steps >= 10000)
            }
            stepDays.forEach { (date, steps, healthy) ->
                StepRecordsTable.insert {
                    it[userId] = pranayId
                    it[this.date] = date
                    it[this.steps] = steps
                    it[distanceKm] = steps * 0.0008
                    it[activeMinutes] = steps / 100
                    it[isHealthyDay] = healthy
                    it[createdAt] = now
                }
            }

            // ---- ARTICLES ----
            listOf(
                "How the Right Health Insurance Plan Can Save You Lakhs in Medical Bills" to
                    "Health insurance is not just a policy — it's a financial shield. Learn how to pick the right plan that covers hospitalization, daycare procedures, and critical illness without burning a hole in your pocket.",
                "5 Simple Habits to Boost Your Heart Health Today" to
                    "Heart disease is preventable. Discover five daily habits backed by science that can dramatically reduce your risk of cardiovascular disease.",
                "Understanding Diabetes: Prevention, Management, and Insurance Coverage" to
                    "With India becoming the diabetes capital of the world, understanding prevention, management strategies, and how your insurance covers diabetes care is more important than ever.",
                "The Complete Guide to Preventive Health Checkups" to
                    "Regular health checkups can catch diseases early when they're most treatable. Here's what tests you need at every age and how your Prudential policy covers them.",
            ).forEach { (title, desc) ->
                ArticlesTable.insert {
                    it[this.title] = title
                    it[description] = desc
                    it[category] = "Health"
                    it[publishedDate] = today.minus(15, DateTimeUnit.DAY)
                    it[isPublished] = true
                }
            }

            // ---- HELP TOPICS ----
            listOf(
                "What is the daily step goal?" to
                    "The daily step goal is 10,000 steps. Completing this goal earns you one healthy day. Healthy days accumulate to unlock premium discounts on your policy.",
                "How do I connect Google Fit or Apple Health?" to
                    "Go to the Home screen and tap 'Connect with Google Fit' or 'Connect with Apple Health'. You'll need to grant permission for the app to read your step data.",
                "What are healthy days?" to
                    "A healthy day is earned when you complete your daily step goal of 10,000 steps. Accumulating healthy days unlocks premium discounts: 10% off at 125 days, 15% off at 150 days.",
                "How is my heart score calculated?" to
                    "Your heart score is calculated based on key health factors including age, gender, blood pressure, cholesterol levels, smoking status, BMI, and family history of cardiovascular disease. The score estimates your 10-year risk of having a heart attack or stroke.",
                "Can I disconnect the health app?" to
                    "Yes, go to Settings > Manage Connected Apps and tap Disconnect. Note: disconnecting will stop syncing your health data and you won't earn healthy days.",
                "How do I change my profile picture?" to
                    "Go to Settings > tap on the edit icon on your profile picture. You can upload from your device (supports PDF, JPG & PNG, max 10MB) or take a new photo.",
            ).forEachIndexed { index, (question, answer) ->
                HelpTopicsTable.insert {
                    it[this.question] = question
                    it[this.answer] = answer
                    it[sortOrder] = index
                    it[isActive] = true
                }
            }

            // ---- NOTIFICATIONS (for Pranay) ----
            listOf(
                Triple("Today's target not completed!", "You walked 8000 steps today", "target_incomplete"),
                Triple("Target completed", "You walked 12,000 steps today", "target_completed"),
                Triple("Pending connection", "Integrate Pru Health app with Google Fit or Apple Health", "pending_connection"),
            ).forEachIndexed { index, (title, message, type) ->
                NotificationsTable.insert {
                    it[userId] = pranayId
                    it[this.title] = title
                    it[this.message] = message
                    it[this.type] = type
                    it[isRead] = false
                    it[timestamp] = when (index) {
                        0 -> Clock.System.now().minus(1, DateTimeUnit.DAY, TimeZone.UTC).toLocalDateTime(TimeZone.UTC)
                        1 -> Clock.System.now().minus(3, DateTimeUnit.DAY, TimeZone.UTC).toLocalDateTime(TimeZone.UTC)
                        else -> Clock.System.now().minus(30, DateTimeUnit.DAY, TimeZone.UTC).toLocalDateTime(TimeZone.UTC)
                    }
                    it[createdAt] = now
                }
            }

            // Seed admin user if none exists
            val adminCount = AdminUsersTable.selectAll().count()
            if (adminCount == 0L) {
                val hashedPassword = org.mindrot.jbcrypt.BCrypt.hashpw(
                    System.getenv("ADMIN_SEED_PASSWORD") ?: "admin123",
                    org.mindrot.jbcrypt.BCrypt.gensalt()
                )
                AdminUsersTable.insert {
                    it[email] = System.getenv("ADMIN_SEED_EMAIL") ?: "admin@prudential.com"
                    it[passwordHash] = hashedPassword
                    it[name] = "Super Admin"
                    it[role] = "superadmin"
                    it[isActive] = true
                }
            }
        }
    }
}
