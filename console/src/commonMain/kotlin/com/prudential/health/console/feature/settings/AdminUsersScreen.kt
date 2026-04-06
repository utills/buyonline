package com.prudential.health.console.feature.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.prudential.health.console.model.AdminRole
import com.prudential.health.console.model.AdminUserListDto
import com.prudential.health.console.ui.components.ConsoleSearchBar
import com.prudential.health.console.ui.components.DataTable
import com.prudential.health.console.ui.components.EmptyState
import com.prudential.health.console.ui.components.StatusChip
import com.prudential.health.console.ui.components.TableColumn
import org.koin.compose.koinInject

private val ROLE_OPTIONS = listOf("viewer", "editor", "superadmin")

@Composable
fun AdminUsersScreen() {
    val viewModel: SettingsViewModel = koinInject()
    val state by viewModel.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    var selectedTabIndex by remember { mutableStateOf(0) }

    // Show snackbar for success or error
    val snackMessage = state.successMessage ?: state.error
    LaunchedEffect(snackMessage) {
        if (snackMessage != null) {
            snackbarHostState.showSnackbar(
                message = snackMessage,
                duration = SnackbarDuration.Short,
            )
            viewModel.clearMessage()
        }
    }

    // Create Admin User Dialog
    if (state.showCreateDialog) {
        CreateAdminUserDialog(
            onDismiss = viewModel::dismissCreateDialog,
            onCreate = { email, name, role, tempPassword ->
                viewModel.createAdminUser(email, name, role, tempPassword)
            },
        )
    }

    // Edit Admin User Dialog
    state.editingUser?.let { editingUser ->
        EditAdminUserDialog(
            user = editingUser,
            onDismiss = viewModel::dismissEditDialog,
            onSave = { role, isActive ->
                viewModel.updateAdminUser(editingUser.id, role, isActive)
            },
        )
    }

    Scaffold(
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState) { data ->
                Snackbar(
                    snackbarData = data,
                    containerColor = if (state.error != null)
                        MaterialTheme.colorScheme.errorContainer
                    else
                        MaterialTheme.colorScheme.primaryContainer,
                    contentColor = if (state.error != null)
                        MaterialTheme.colorScheme.onErrorContainer
                    else
                        MaterialTheme.colorScheme.onPrimaryContainer,
                )
            }
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
        ) {
            // Page header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(
                        text = "Settings",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                    Text(
                        text = "Role: ${state.currentAdminRole.name.lowercase().replaceFirstChar { it.uppercase() }}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    if (state.currentAdminRole == AdminRole.SUPERADMIN) {
                        Button(
                            onClick = viewModel::showCreateDialog,
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp),
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Add Admin User")
                        }
                    }
                    IconButton(onClick = viewModel::loadData) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

            // Tabs
            TabRow(selectedTabIndex = selectedTabIndex) {
                Tab(
                    selected = selectedTabIndex == 0,
                    onClick = { selectedTabIndex = 0 },
                    text = { Text("Admin Users") },
                )
                Tab(
                    selected = selectedTabIndex == 1,
                    onClick = { selectedTabIndex = 1 },
                    text = { Text("Audit Log") },
                )
            }

            when (selectedTabIndex) {
                0 -> AdminUsersTab(state = state, onEditUser = viewModel::startEditUser)
                1 -> AuditLogTab(state = state)
            }
        }
    }
}

@Composable
private fun AdminUsersTab(
    state: SettingsUiState,
    onEditUser: (AdminUserListDto) -> Unit,
) {
    when {
        state.isLoading -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }

        state.adminUsers.isEmpty() -> {
            EmptyState(message = "No admin users found")
        }

        else -> {
            val columns = buildAdminUserColumns(
                isSuperAdmin = state.currentAdminRole == AdminRole.SUPERADMIN,
                onEditUser = onEditUser,
            )
            DataTable(
                columns = columns,
                rows = state.adminUsers,
                modifier = Modifier.fillMaxSize(),
            )
        }
    }
}

@Composable
private fun buildAdminUserColumns(
    isSuperAdmin: Boolean,
    onEditUser: (AdminUserListDto) -> Unit,
): List<TableColumn<AdminUserListDto>> {
    val colorScheme = MaterialTheme.colorScheme
    return buildList {
        add(TableColumn(header = "Name", weight = 2f) { user ->
            Text(
                text = user.name,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 1,
            )
        })
        add(TableColumn(header = "Email", weight = 2f) { user ->
            Text(
                text = user.email,
                style = MaterialTheme.typography.bodySmall,
                color = colorScheme.onSurfaceVariant,
                maxLines = 1,
            )
        })
        add(TableColumn(header = "Role", weight = 1f) { user ->
            val chipColor = when (AdminRole.from(user.role)) {
                AdminRole.SUPERADMIN -> colorScheme.errorContainer
                AdminRole.EDITOR -> colorScheme.primaryContainer
                AdminRole.VIEWER -> colorScheme.secondaryContainer
            }
            StatusChip(
                label = user.role.replaceFirstChar { it.uppercase() },
                color = chipColor,
            )
        })
        add(TableColumn(header = "Status", weight = 0.8f) { user ->
            val chipColor = if (user.isActive)
                colorScheme.tertiaryContainer
            else
                colorScheme.surfaceVariant
            StatusChip(
                label = if (user.isActive) "Active" else "Inactive",
                color = chipColor,
            )
        })
        add(TableColumn(header = "Created", weight = 1f) { user ->
            Text(
                text = user.createdAt.take(10),
                style = MaterialTheme.typography.bodySmall,
                color = colorScheme.onSurfaceVariant,
            )
        })
        add(TableColumn(header = "Last Login", weight = 1f) { user ->
            Text(
                text = user.lastLoginAt?.take(10) ?: "—",
                style = MaterialTheme.typography.bodySmall,
                color = colorScheme.onSurfaceVariant,
            )
        })
        if (isSuperAdmin) {
            add(TableColumn(header = "Actions", weight = 0.8f) { user ->
                IconButton(
                    onClick = { onEditUser(user) },
                    modifier = Modifier.size(32.dp),
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit user",
                        modifier = Modifier.size(16.dp),
                        tint = colorScheme.primary,
                    )
                }
            })
        }
    }
}

@Composable
private fun AuditLogTab(state: SettingsUiState) {
    var auditQuery by remember { mutableStateOf("") }

    val filteredLog = remember(state.auditLog, auditQuery) {
        if (auditQuery.isBlank()) state.auditLog
        else state.auditLog.filter { entry ->
            entry.action.contains(auditQuery, ignoreCase = true)
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        ConsoleSearchBar(
            query = auditQuery,
            onQueryChange = { auditQuery = it },
            placeholder = "Filter by action keyword…",
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 12.dp),
        )

        when {
            state.isLoading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }

            filteredLog.isEmpty() -> {
                EmptyState(
                    message = if (auditQuery.isBlank()) "No audit log entries" else "No entries match \"$auditQuery\"",
                )
            }

            else -> {
                val colorScheme = MaterialTheme.colorScheme
                val auditColumns = listOf(
                    TableColumn<com.prudential.health.console.model.AuditLogEntryDto>(
                        header = "Timestamp",
                        weight = 1.5f,
                    ) { entry ->
                        Text(
                            text = entry.timestamp.take(19).replace("T", " "),
                            style = MaterialTheme.typography.bodySmall,
                            color = colorScheme.onSurfaceVariant,
                        )
                    },
                    TableColumn(header = "Action", weight = 1.5f) { entry ->
                        Text(
                            text = entry.action,
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium,
                            color = colorScheme.onSurface,
                            maxLines = 1,
                        )
                    },
                    TableColumn(header = "Detail", weight = 3f) { entry ->
                        Text(
                            text = entry.detail,
                            style = MaterialTheme.typography.bodySmall,
                            color = colorScheme.onSurfaceVariant,
                            maxLines = 2,
                        )
                    },
                    TableColumn(header = "Admin ID", weight = 0.8f) { entry ->
                        Text(
                            text = entry.adminId?.toString() ?: "—",
                            style = MaterialTheme.typography.bodySmall,
                            color = colorScheme.onSurfaceVariant,
                        )
                    },
                    TableColumn(header = "IP", weight = 1f) { entry ->
                        Text(
                            text = entry.ipAddress,
                            style = MaterialTheme.typography.bodySmall,
                            color = colorScheme.onSurfaceVariant,
                        )
                    },
                )
                DataTable(
                    columns = auditColumns,
                    rows = filteredLog,
                    modifier = Modifier.fillMaxSize(),
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CreateAdminUserDialog(
    onDismiss: () -> Unit,
    onCreate: (email: String, name: String, role: String, tempPassword: String) -> Unit,
) {
    var email by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var selectedRole by remember { mutableStateOf("viewer") }
    var tempPassword by remember { mutableStateOf("") }
    var roleDropdownExpanded by remember { mutableStateOf(false) }

    val isFormValid = email.isNotBlank() && name.isNotBlank() && tempPassword.isNotBlank()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create Admin User") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Full name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email address") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                ExposedDropdownMenuBox(
                    expanded = roleDropdownExpanded,
                    onExpandedChange = { roleDropdownExpanded = it },
                ) {
                    OutlinedTextField(
                        value = selectedRole.replaceFirstChar { it.uppercase() },
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Role") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = roleDropdownExpanded) },
                        modifier = Modifier
                            .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                            .fillMaxWidth(),
                    )
                    ExposedDropdownMenu(
                        expanded = roleDropdownExpanded,
                        onDismissRequest = { roleDropdownExpanded = false },
                    ) {
                        ROLE_OPTIONS.forEach { roleOption ->
                            DropdownMenuItem(
                                text = { Text(roleOption.replaceFirstChar { it.uppercase() }) },
                                onClick = {
                                    selectedRole = roleOption
                                    roleDropdownExpanded = false
                                },
                            )
                        }
                    }
                }
                OutlinedTextField(
                    value = tempPassword,
                    onValueChange = { tempPassword = it },
                    label = { Text("Temporary password") },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (isFormValid) {
                        onCreate(email.trim(), name.trim(), selectedRole, tempPassword)
                    }
                },
                enabled = isFormValid,
            ) {
                Text("Create")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EditAdminUserDialog(
    user: AdminUserListDto,
    onDismiss: () -> Unit,
    onSave: (role: String?, isActive: Boolean?) -> Unit,
) {
    var selectedRole by remember { mutableStateOf(user.role) }
    var isActive by remember { mutableStateOf(user.isActive) }
    var roleDropdownExpanded by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Admin User") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = "${user.name} (${user.email})",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(modifier = Modifier.height(4.dp))
                ExposedDropdownMenuBox(
                    expanded = roleDropdownExpanded,
                    onExpandedChange = { roleDropdownExpanded = it },
                ) {
                    OutlinedTextField(
                        value = selectedRole.replaceFirstChar { it.uppercase() },
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Role") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = roleDropdownExpanded) },
                        modifier = Modifier
                            .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                            .fillMaxWidth(),
                    )
                    ExposedDropdownMenu(
                        expanded = roleDropdownExpanded,
                        onDismissRequest = { roleDropdownExpanded = false },
                    ) {
                        ROLE_OPTIONS.forEach { roleOption ->
                            DropdownMenuItem(
                                text = { Text(roleOption.replaceFirstChar { it.uppercase() }) },
                                onClick = {
                                    selectedRole = roleOption
                                    roleDropdownExpanded = false
                                },
                            )
                        }
                    }
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Checkbox(
                        checked = isActive,
                        onCheckedChange = { isActive = it },
                    )
                    Text(
                        text = "Account active",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val roleChanged = selectedRole != user.role
                    val activeChanged = isActive != user.isActive
                    onSave(
                        if (roleChanged) selectedRole else null,
                        if (activeChanged) isActive else null,
                    )
                },
            ) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
    )
}
