package com.prudential.health.server.database

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.kotlin.datetime.CurrentDateTime
import org.jetbrains.exposed.sql.kotlin.datetime.date
import org.jetbrains.exposed.sql.kotlin.datetime.datetime

object UsersTable : IntIdTable("users") {
    val name = varchar("name", 255)
    val phone = varchar("phone", 20).uniqueIndex()
    val email = varchar("email", 255).nullable()
    val profileImageUrl = text("profile_image_url").nullable()
    val joinedDate = date("joined_date").nullable()
    val isProposer = bool("is_proposer").default(false)
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")
}

object PoliciesTable : IntIdTable("policies") {
    val policyNumber = varchar("policy_number", 100).uniqueIndex()
    val planName = varchar("plan_name", 255)
    val policyHolderName = varchar("policy_holder_name", 255)
    val sumInsured = decimal("sum_insured", precision = 15, scale = 2)
    val annualPremium = decimal("annual_premium", precision = 15, scale = 2)
    val startDate = date("start_date")
    val renewalDate = date("renewal_date")
    val isAutoDebitActive = bool("is_auto_debit_active").default(false)
    val status = varchar("status", 50).default("active")
    val createdAt = datetime("created_at")
}

object PolicyMembersTable : IntIdTable("policy_members") {
    val policyId = reference("policy_id", PoliciesTable, onDelete = ReferenceOption.CASCADE)
    val userId = reference("user_id", UsersTable, onDelete = ReferenceOption.CASCADE)
    val relationship = varchar("relationship", 100).nullable()
    val isProposer = bool("is_proposer").default(false)
    val joinedDate = date("joined_date").nullable()
    val policyIdx = index("idx_policy_members_policy", false, policyId)
    val userIdx = index("idx_policy_members_user", false, userId)

    init {
        uniqueIndex("uq_policy_members_policy_user", policyId, userId)
    }
}

object OtpTable : IntIdTable("otps") {
    val phone = varchar("phone", 20)
    val otp = varchar("otp", 10)
    val expiresAt = datetime("expires_at")
    val isUsed = bool("is_used").default(false)
    val createdAt = datetime("created_at").defaultExpression(CurrentDateTime)

    init {
        // Composite index on (phone, isUsed) for fast OTP lookup and rate-limit queries
        index("idx_otp_phone_is_used", false, phone, isUsed)
    }
}

object SessionsTable : IntIdTable("sessions") {
    val userId = reference("user_id", UsersTable, onDelete = ReferenceOption.CASCADE)
    val accessToken = text("access_token").uniqueIndex()
    val refreshToken = text("refresh_token")
    val expiresAt = long("expires_at")
    val deviceId = varchar("device_id", 255).nullable()
    val isActive = bool("is_active").default(true)
    val createdAt = datetime("created_at")
    val sessionUserIdx = index("idx_sessions_user", false, userId)
    val sessionActiveIdx = index("idx_sessions_active", false, isActive)
    val sessionExpiresIdx = index("idx_sessions_expires_at", false, expiresAt)
}

object StepRecordsTable : IntIdTable("step_records") {
    val userId = reference("user_id", UsersTable, onDelete = ReferenceOption.CASCADE)
    val date = date("date")
    val steps = integer("steps").default(0)
    val distanceKm = double("distance_km").default(0.0)
    val activeMinutes = integer("active_minutes").default(0)
    val isHealthyDay = bool("is_healthy_day").default(false)
    val createdAt = datetime("created_at")
    val stepUserIdx = index("idx_steps_user", false, userId)

    init {
        uniqueIndex("uq_step_records_user_date", userId, date)
    }
}

object HealthConnectionsTable : IntIdTable("health_connections") {
    val userId = reference("user_id", UsersTable, onDelete = ReferenceOption.CASCADE)
    val platform = varchar("platform", 50) // google_fit, apple_health
    val isConnected = bool("is_connected").default(true)
    val connectedAt = datetime("connected_at")
    val connUserIdx = index("idx_health_conn_user", false, userId)
    val connUserConnectedIdx = index("idx_health_conn_user_connected", false, userId, isConnected)
}

object ArticlesTable : IntIdTable("articles") {
    val title = varchar("title", 500)
    val description = text("description")
    val imageUrl = text("image_url").nullable()
    val category = varchar("category", 100).default("")
    val publishedDate = date("published_date")
    val isPublished = bool("is_published").default(true)
    val articlePublishedIdx = index("idx_articles_published", false, isPublished)
}

object HelpTopicsTable : IntIdTable("help_topics") {
    val question = text("question")
    val answer = text("answer")
    val sortOrder = integer("sort_order").default(0)
    val isActive = bool("is_active").default(true)
    val helpTopicActiveIdx = index("idx_help_topics_active", false, isActive)
}

object CalculatorResultsTable : IntIdTable("calculator_results") {
    val userId = reference("user_id", UsersTable, onDelete = ReferenceOption.CASCADE)
    val calculatorType = varchar("calculator_type", 50) // heart_score, qdiabetes, bmi, bmr
    val inputJson = text("input_json")
    val resultJson = text("result_json")
    val score = varchar("score", 50).nullable()
    val createdAt = datetime("created_at")
    val calcUserIdx = index("idx_calc_results_user", false, userId)
}

object NotificationsTable : IntIdTable("notifications") {
    val userId = reference("user_id", UsersTable, onDelete = ReferenceOption.CASCADE)
    val title = varchar("title", 500)
    val message = text("message")
    val type = varchar("type", 50).default("general")
    val isRead = bool("is_read").default(false)
    val timestamp = datetime("timestamp")
    val createdAt = datetime("created_at")
    val notifUserIdx = index("idx_notifications_user", false, userId)
    val notifUserTimestampIdx = index("idx_notifications_user_timestamp", false, userId, timestamp)
}

object UserConsentsTable : IntIdTable("user_consents") {
    val userId = reference("user_id", UsersTable, onDelete = ReferenceOption.CASCADE)
    val consentType = varchar("consent_type", 100)
    val isAccepted = bool("is_accepted").default(false)
    val acceptedAt = datetime("accepted_at").nullable()
    val consentUserIdx = index("idx_consents_user", false, userId)

    init {
        uniqueIndex("uq_user_consents_user_type", userId, consentType)
    }
}

object AuditLogTable : IntIdTable("audit_log") {
    val userId = integer("user_id").nullable()
    val action = varchar("action", 100) // e.g., "otp_sent", "otp_verified", "login", "logout", "consent_recorded"
    val detail = text("detail").default("")
    val ipAddress = varchar("ip_address", 50).default("")
    val timestamp = datetime("timestamp").defaultExpression(CurrentDateTime)
    val createdAt = datetime("created_at")
    val auditUserIdx = index("idx_audit_user", false, userId)
    val auditTimeIdx = index("idx_audit_time", false, timestamp)
}

object AdminUsersTable : IntIdTable("admin_users") {
    val email        = varchar("email", 255).uniqueIndex()
    val passwordHash = varchar("password_hash", 255)
    val name         = varchar("name", 100)
    val role         = varchar("role", 50).default("viewer") // viewer | editor | superadmin
    val isActive     = bool("is_active").default(true)
    val createdAt    = datetime("created_at").defaultExpression(CurrentDateTime)
    val lastLoginAt  = datetime("last_login_at").nullable()
    val adminActiveIdx = index("idx_admin_users_active", false, isActive)
}
