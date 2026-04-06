package com.prudential.health.console.feature.users

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.console.model.UserAdminDto
import com.prudential.health.console.ui.components.ConsoleSearchBar
import com.prudential.health.console.ui.components.DataTable
import com.prudential.health.console.ui.components.EmptyState
import com.prudential.health.console.ui.components.TableColumn
import org.koin.compose.koinInject

@Composable
fun UserListScreen() {
    val vm: UserListViewModel = koinInject()
    val state by vm.state.collectAsState()

    Row(modifier = Modifier.fillMaxSize()) {
        // LEFT panel — master list (55% width)
        Box(modifier = Modifier.weight(0.55f).fillMaxHeight()) {
            Column(modifier = Modifier.fillMaxSize()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Column {
                        Text(
                            text = "Users",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.SemiBold,
                        )
                        Text(
                            text = "Showing ${state.users.size} of ${state.total} users",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    IconButton(onClick = vm::refresh) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }

                ConsoleSearchBar(
                    query = state.searchQuery,
                    onQueryChange = vm::onSearchChanged,
                    placeholder = "Search by name, phone, or policy…",
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

                    else -> {
                        val selectedId = state.selectedUserId
                        DataTable(
                            columns = buildUserColumns(selectedId),
                            rows = state.users,
                            modifier = Modifier.fillMaxSize(),
                            onRowClick = { user -> vm.onUserSelected(user.id) },
                        )
                    }
                }
            }
        }

        VerticalDivider()

        // RIGHT panel — detail (remaining 45%)
        Box(modifier = Modifier.weight(0.45f).fillMaxHeight()) {
            if (state.selectedUserId != null) {
                UserDetailPanel(userId = state.selectedUserId!!)
            } else {
                EmptyState(message = "Select a user to view details")
            }
        }
    }
}

@Composable
private fun buildUserColumns(selectedId: Int?): List<TableColumn<UserAdminDto>> = listOf(
    TableColumn(header = "Name", weight = 2f) { user ->
        val isSelected = selectedId == user.id
        Box(
            modifier = if (isSelected) {
                Modifier.background(MaterialTheme.colorScheme.primaryContainer)
                    .padding(horizontal = 4.dp, vertical = 2.dp)
            } else Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
        ) {
            Text(
                text = user.name,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                maxLines = 1,
            )
        }
    },
    TableColumn(header = "Phone", weight = 1.5f) { user ->
        Text(
            text = user.phone,
            style = MaterialTheme.typography.bodySmall,
            maxLines = 1,
        )
    },
    TableColumn(header = "Policy #", weight = 1.5f) { user ->
        Text(
            text = user.policyNumber ?: "—",
            style = MaterialTheme.typography.bodySmall,
            maxLines = 1,
        )
    },
    TableColumn(header = "Steps 30d", weight = 1f) { user ->
        Text(
            text = "%,d".format(user.totalStepsLast30Days),
            style = MaterialTheme.typography.bodySmall,
        )
    },
    TableColumn(header = "Healthy Days", weight = 0.8f) { user ->
        Text(
            text = user.healthyDaysLast30Days.toString(),
            style = MaterialTheme.typography.bodySmall,
        )
    },
    TableColumn(header = "Last Active", weight = 1f) { user ->
        Text(
            text = user.lastActiveDate ?: "—",
            style = MaterialTheme.typography.bodySmall,
            maxLines = 1,
        )
    },
)
