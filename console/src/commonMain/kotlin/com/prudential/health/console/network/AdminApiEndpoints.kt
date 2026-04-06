package com.prudential.health.console.network

object AdminApiEndpoints {
    object Auth {
        const val LOGIN = "admin/auth/login"
        const val ME = "admin/auth/me"
    }
    object Analytics {
        const val OVERVIEW = "admin/analytics/overview"
        const val STEP_TRENDS = "admin/analytics/step-trends"
        const val PLATFORMS = "admin/analytics/platforms"
        const val CONSENT_STATS = "admin/analytics/consent-stats"
        const val CALCULATOR_USAGE = "admin/analytics/calculator-usage"
        const val TOP_USERS = "admin/analytics/top-users"
    }
    object Users {
        const val LIST = "admin/users"
        fun detail(id: Int) = "admin/users/$id"
    }
    object Policies {
        const val LIST = "admin/policies"
    }
    object Content {
        const val ARTICLES = "admin/content/articles"
        fun article(id: Int) = "admin/content/articles/$id"
        fun publishArticle(id: Int) = "admin/content/articles/$id/publish"
        const val HELP_TOPICS = "admin/content/help-topics"
        fun helpTopic(id: Int) = "admin/content/help-topics/$id"
    }
    object Notifications {
        const val SEND = "admin/notifications/send"
    }
    object Reports {
        const val EXPORT = "admin/reports/export"
    }
    object AdminUsers {
        const val LIST = "admin/admin-users"
        fun detail(id: Int) = "admin/admin-users/$id"
    }
    object AuditLog {
        const val LIST = "admin/audit-log"
    }
}
