package com.prudential.health.console.feature.reports

import com.prudential.health.console.network.AdminApiEndpoints
import com.prudential.health.core.network.ApiClient
import com.prudential.health.core.network.NetworkResult

class ReportsRepository(private val apiClient: ApiClient) {
    suspend fun exportReport(type: String, from: String, to: String, format: String = "csv"): NetworkResult<String> {
        return apiClient.get<String>(
            "${AdminApiEndpoints.Reports.EXPORT}?type=$type&from=$from&to=$to&format=$format"
        )
    }
}
