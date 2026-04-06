package com.prudential.health.server.service

import com.prudential.health.server.database.*
import com.prudential.health.server.database.DatabaseFactory.dbQuery
import com.prudential.health.server.model.*
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.inList

class UserService {

    suspend fun createUser(phone: String): UserDto = dbQuery {
        val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        val today = now.date

        val id = UsersTable.insert {
            it[UsersTable.name] = ""
            it[UsersTable.phone] = phone
            it[UsersTable.joinedDate] = today
            it[UsersTable.isProposer] = false
            it[UsersTable.createdAt] = now
            it[UsersTable.updatedAt] = now
        } get UsersTable.id

        UserDto(
            id = id.value.toString(),
            name = "",
            phone = phone,
            joinedDate = today.toString(),
            isProposer = false,
        )
    }

    suspend fun findByPhone(phone: String): UserDto? = dbQuery {
        UsersTable.selectAll().where { UsersTable.phone eq phone }
            .map { it.toUserDto() }
            .firstOrNull()
    }

    /** Find existing user by phone, or create one if not found.
     *  Handles the concurrent-creation race: if two requests race on a new phone,
     *  the unique index rejects the second INSERT and we fall back to SELECT. */
    suspend fun findOrCreateUser(phone: String): UserDto {
        findByPhone(phone)?.let { return it }
        return try {
            createUser(phone)
        } catch (_: Exception) {
            // Unique constraint violation from a concurrent request — return the winner's row
            findByPhone(phone) ?: throw IllegalStateException("Failed to find or create user for phone $phone")
        }
    }

    suspend fun findById(userId: Int): UserDto? = dbQuery {
        UsersTable.selectAll().where { UsersTable.id eq userId }
            .map { it.toUserDto() }
            .firstOrNull()
    }

    suspend fun getPoliciesForPhone(phone: String): List<PolicyDto> = dbQuery {
        // Step 1: Find user
        val user = UsersTable.selectAll().where { UsersTable.phone eq phone }.firstOrNull() ?: return@dbQuery emptyList()
        val userId = user[UsersTable.id]

        // Step 2: Get all policy IDs for user in one query
        val policyIds = PolicyMembersTable.selectAll()
            .where { PolicyMembersTable.userId eq userId }
            .map { it[PolicyMembersTable.policyId] }

        if (policyIds.isEmpty()) return@dbQuery emptyList()

        // Step 3: Get policies
        val policies = PoliciesTable.selectAll()
            .where { PoliciesTable.id inList policyIds }
            .toList()

        // Step 4: Get ALL members for ALL these policies in one query
        val allMembers = (PolicyMembersTable innerJoin UsersTable)
            .selectAll()
            .where { PolicyMembersTable.policyId inList policyIds }
            .groupBy { it[PolicyMembersTable.policyId] }

        // Step 5: Build DTOs
        policies.map { policy ->
            val policyId = policy[PoliciesTable.id]
            val members = allMembers[policyId]?.map { row ->
                PolicyMemberDto(
                    id = row[UsersTable.id].value.toString(),
                    name = row[UsersTable.name],
                    isProposer = row[PolicyMembersTable.isProposer],
                    relationship = row[PolicyMembersTable.relationship],
                    phone = row[UsersTable.phone],
                    joinedDate = row[PolicyMembersTable.joinedDate]?.toString(),
                )
            } ?: emptyList()

            PolicyDto(
                id = policy[PoliciesTable.id].value.toString(),
                policyNumber = policy[PoliciesTable.policyNumber],
                planName = policy[PoliciesTable.planName],
                policyHolder = policy[PoliciesTable.policyHolderName],
                sumInsured = policy[PoliciesTable.sumInsured].toDouble(),
                annualPremium = policy[PoliciesTable.annualPremium].toDouble(),
                startDate = policy[PoliciesTable.startDate].toString(),
                renewalDate = policy[PoliciesTable.renewalDate].toString(),
                isAutoDebitActive = policy[PoliciesTable.isAutoDebitActive],
                status = policy[PoliciesTable.status],
                members = members,
            )
        }
    }

    suspend fun getMembersForPolicy(policyNumber: String): List<PolicyMemberDto> = dbQuery {
        val policy = PoliciesTable.selectAll()
            .where { PoliciesTable.policyNumber eq policyNumber }
            .firstOrNull() ?: return@dbQuery emptyList()

        PolicyMembersTable
            .innerJoin(UsersTable, { userId }, { UsersTable.id })
            .selectAll().where { PolicyMembersTable.policyId eq policy[PoliciesTable.id] }
            .map { row ->
                PolicyMemberDto(
                    id = row[UsersTable.id].value.toString(),
                    name = row[UsersTable.name],
                    isProposer = row[PolicyMembersTable.isProposer],
                    relationship = row[PolicyMembersTable.relationship],
                    phone = row[UsersTable.phone],
                    joinedDate = row[PolicyMembersTable.joinedDate]?.toString(),
                )
            }
    }

    suspend fun updateUser(userId: Int, name: String?, email: String?): Boolean = dbQuery {
        UsersTable.update({ UsersTable.id eq userId }) {
            if (name != null) it[UsersTable.name] = name
            if (email != null) it[UsersTable.email] = email
            it[updatedAt] = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        } > 0
    }

    private fun ResultRow.toUserDto() = UserDto(
        id = this[UsersTable.id].value.toString(),
        name = this[UsersTable.name],
        phone = this[UsersTable.phone],
        email = this[UsersTable.email],
        profileImageUrl = this[UsersTable.profileImageUrl],
        joinedDate = this[UsersTable.joinedDate]?.toString() ?: "",
        isProposer = this[UsersTable.isProposer],
    )
}
