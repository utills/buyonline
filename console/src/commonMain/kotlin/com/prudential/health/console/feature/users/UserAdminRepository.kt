package com.prudential.health.console.feature.users

import com.prudential.health.console.model.PaginatedResponse
import com.prudential.health.console.model.PolicyAdminDto
import com.prudential.health.console.model.UserAdminDto
import com.prudential.health.console.model.UserDetailAdminDto
import com.prudential.health.console.network.AdminApiEndpoints
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.NetworkResult
import io.ktor.http.encodeURLQueryComponent

class UserAdminRepository(private val apiClient: ApiClient) {

    suspend fun getUsers(
        q: String = "",
        page: Int = 1,
        pageSize: Int = 50,
    ): NetworkResult<PaginatedResponse<UserAdminDto>> =
        apiClient.get("${AdminApiEndpoints.Users.LIST}?q=${q.encodeURLQueryComponent()}&page=$page&pageSize=$pageSize")

    suspend fun getUserDetail(id: Int): NetworkResult<UserDetailAdminDto> =
        apiClient.get(AdminApiEndpoints.Users.detail(id))

    suspend fun getPolicies(
        page: Int = 1,
        pageSize: Int = 50,
    ): NetworkResult<PaginatedResponse<PolicyAdminDto>> =
        apiClient.get("${AdminApiEndpoints.Policies.LIST}?page=$page&pageSize=$pageSize")
}
