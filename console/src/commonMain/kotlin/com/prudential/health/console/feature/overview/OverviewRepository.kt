package com.prudential.health.console.feature.overview

import com.prudential.health.console.model.OverviewKpiDto
import com.prudential.health.console.network.AdminApiEndpoints
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.NetworkResult

class OverviewRepository(private val apiClient: ApiClient) {
    suspend fun getKpis(): NetworkResult<OverviewKpiDto> =
        apiClient.get(AdminApiEndpoints.Analytics.OVERVIEW)
}
