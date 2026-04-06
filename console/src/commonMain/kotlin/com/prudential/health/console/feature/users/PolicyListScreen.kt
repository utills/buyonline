package com.prudential.health.console.feature.users

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.console.model.PolicyAdminDto
import com.prudential.health.console.ui.components.ConsoleSearchBar
import com.prudential.health.console.ui.components.DataTable
import com.prudential.health.console.ui.components.StatusChip
import com.prudential.health.console.ui.components.TableColumn
import org.koin.compose.koinInject

// ── Screen ───────────────────────────────────────────────────────────────────

@Composable
fun PolicyListScreen() {
    val vm: PolicyListViewModel = koinInject()
    val state by vm.state.collectAsState()

    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                text = "Policies",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold,
            )
        }

        ConsoleSearchBar(
            query = state.searchQuery,
            onQueryChange = vm::onSearchChanged,
            placeholder = "Search by policy number, plan, or holder…",
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 12.dp),
        )

        when {
            state.isLoading -> Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator()
            }

            state.error != null -> Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = state.error.orEmpty(),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error,
                )
            }

            else -> DataTable(
                columns = policyTableColumns(),
                rows = state.filteredPolicies,
                modifier = Modifier.fillMaxSize(),
            )
        }
    }
}

private fun policyTableColumns(): List<TableColumn<PolicyAdminDto>> = listOf(
    TableColumn(header = "Policy #", weight = 1.5f) { policy ->
        Text(
            text = policy.policyNumber,
            style = MaterialTheme.typography.bodySmall,
            maxLines = 1,
        )
    },
    TableColumn(header = "Plan Name", weight = 2f) { policy ->
        Text(
            text = policy.planName,
            style = MaterialTheme.typography.bodySmall,
            maxLines = 1,
        )
    },
    TableColumn(header = "Holder", weight = 1.5f) { policy ->
        Text(
            text = policy.policyHolder,
            style = MaterialTheme.typography.bodySmall,
            maxLines = 1,
        )
    },
    TableColumn(header = "Status", weight = 1f) { policy ->
        StatusChip(
            label = policy.status,
            color = policyStatusColor(policy.status),
        )
    },
    TableColumn(header = "Sum Insured", weight = 1f) { policy ->
        Text(
            text = "%.0f".format(policy.sumInsured),
            style = MaterialTheme.typography.bodySmall,
        )
    },
    TableColumn(header = "Renewal Date", weight = 1f) { policy ->
        Text(
            text = policy.renewalDate,
            style = MaterialTheme.typography.bodySmall,
            maxLines = 1,
        )
    },
    TableColumn(header = "Members", weight = 0.8f) { policy ->
        Text(
            text = policy.memberCount.toString(),
            style = MaterialTheme.typography.bodySmall,
        )
    },
)

@Composable
private fun policyStatusColor(status: String): Color = when (status.lowercase()) {
    "active" -> Color(0xFF4CAF50).copy(alpha = 0.2f)
    "expired" -> MaterialTheme.colorScheme.errorContainer
    "pending" -> Color(0xFFFF9800).copy(alpha = 0.2f)
    else -> MaterialTheme.colorScheme.surfaceVariant
}
