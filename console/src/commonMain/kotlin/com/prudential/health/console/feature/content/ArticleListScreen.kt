package com.prudential.health.console.feature.content

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
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
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.console.model.ArticleAdminDto
import com.prudential.health.console.model.HelpTopicAdminDto
import com.prudential.health.console.ui.components.DataTable
import com.prudential.health.console.ui.components.EmptyState
import com.prudential.health.console.ui.components.StatusChip
import com.prudential.health.console.ui.components.TableColumn
import org.koin.compose.koinInject

@Composable
fun ArticleListScreen() {
    val viewModel: ContentAdminViewModel = koinInject()
    val state by viewModel.state.collectAsState()

    var selectedTab by remember { mutableIntStateOf(0) }
    val snackbarHostState = remember { SnackbarHostState() }
    var pendingDeleteArticle by remember { mutableStateOf<ArticleAdminDto?>(null) }
    var pendingDeleteTopic by remember { mutableStateOf<HelpTopicAdminDto?>(null) }

    LaunchedEffect(state.successMessage) {
        state.successMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessage()
        }
    }

    LaunchedEffect(state.error) {
        state.error?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessage()
        }
    }

    Scaffold(
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState) { data ->
                Snackbar(snackbarData = data)
            }
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 24.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    text = "Content",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { viewModel.showNewArticleEditor() }) {
                        Text("New Article")
                    }
                    OutlinedButton(onClick = { viewModel.showNewHelpTopicEditor() }) {
                        Text("New Help Topic")
                    }
                    Button(onClick = { viewModel.showNotificationDialog() }) {
                        Text("Send Notification")
                    }
                }
            }

            // Tabs
            TabRow(selectedTabIndex = selectedTab) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Articles") },
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Help Topics") },
                )
            }

            // Content
            when {
                state.isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator(modifier = Modifier.size(48.dp))
                    }
                }

                selectedTab == 0 -> {
                    if (state.articles.isEmpty()) {
                        EmptyState(message = "No articles yet. Create one to get started.")
                    } else {
                        ArticlesTable(
                            articles = state.articles,
                            onEdit = { viewModel.selectArticleForEdit(it) },
                            onDelete = { pendingDeleteArticle = it },
                            onTogglePublished = { viewModel.toggleArticlePublished(it) },
                        )
                    }
                }

                else -> {
                    if (state.helpTopics.isEmpty()) {
                        EmptyState(message = "No help topics yet. Create one to get started.")
                    } else {
                        HelpTopicsTable(
                            topics = state.helpTopics,
                            onEdit = { viewModel.selectHelpTopicForEdit(it) },
                            onDelete = { pendingDeleteTopic = it },
                        )
                    }
                }
            }
        }
    }

    // Article editor dialog
    if (state.showArticleEditor) {
        ArticleEditorDialog(
            article = state.selectedArticle,
            onDismiss = { viewModel.dismissEditor() },
            onSave = { title, description, imageUrl, category, isPublished ->
                viewModel.saveArticle(title, description, imageUrl, category, isPublished)
            },
        )
    }

    // Help topic editor dialog
    if (state.showHelpTopicEditor) {
        HelpTopicEditorDialog(
            topic = state.selectedHelpTopic,
            onDismiss = { viewModel.dismissEditor() },
            onSave = { question, answer, order ->
                viewModel.saveHelpTopic(question, answer, order)
            },
        )
    }

    // Notification dialog
    if (state.showNotificationDialog) {
        NotificationDialog(
            onDismiss = { viewModel.dismissEditor() },
            onSend = { title, message -> viewModel.sendNotification(title, message) },
        )
    }

    // Article delete confirmation
    pendingDeleteArticle?.let { article ->
        AlertDialog(
            onDismissRequest = { pendingDeleteArticle = null },
            title = { Text("Delete Article") },
            text = { Text("Are you sure you want to delete \"${article.title}\"? This action cannot be undone.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteArticle(article)
                        pendingDeleteArticle = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                ) { Text("Delete") }
            },
            dismissButton = {
                TextButton(onClick = { pendingDeleteArticle = null }) { Text("Cancel") }
            },
        )
    }

    // Help topic delete confirmation
    pendingDeleteTopic?.let { topic ->
        AlertDialog(
            onDismissRequest = { pendingDeleteTopic = null },
            title = { Text("Delete Help Topic") },
            text = { Text("Are you sure you want to delete this help topic? This action cannot be undone.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteHelpTopic(topic)
                        pendingDeleteTopic = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                ) { Text("Delete") }
            },
            dismissButton = {
                TextButton(onClick = { pendingDeleteTopic = null }) { Text("Cancel") }
            },
        )
    }
}

@Composable
private fun ArticlesTable(
    articles: List<ArticleAdminDto>,
    onEdit: (ArticleAdminDto) -> Unit,
    onDelete: (ArticleAdminDto) -> Unit,
    onTogglePublished: (ArticleAdminDto) -> Unit,
) {
    val publishedGreen = Color(0xFF4CAF50)
    val draftGray = MaterialTheme.colorScheme.surfaceVariant

    val columns = listOf(
        TableColumn<ArticleAdminDto>(header = "Title", weight = 3f) { article ->
            Text(
                text = article.title,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 2,
            )
        },
        TableColumn(header = "Category", weight = 1f) { article ->
            Text(
                text = article.category.ifEmpty { "—" },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        },
        TableColumn(header = "Published", weight = 0.8f) { article ->
            StatusChip(
                label = if (article.isPublished) "Published" else "Draft",
                color = if (article.isPublished) publishedGreen.copy(alpha = 0.15f) else draftGray,
            )
        },
        TableColumn(header = "Date", weight = 1f) { article ->
            Text(
                text = article.publishedDate.ifEmpty { "—" },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        },
        TableColumn(header = "Actions", weight = 1f) { article ->
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                IconButton(
                    onClick = { onEdit(article) },
                    modifier = Modifier.size(32.dp),
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit article",
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.primary,
                    )
                }
                IconButton(
                    onClick = { onDelete(article) },
                    modifier = Modifier.size(32.dp),
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete article",
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.error,
                    )
                }
            }
        },
    )

    DataTable(
        columns = columns,
        rows = articles,
        modifier = Modifier.fillMaxSize(),
        onRowClick = { onTogglePublished(it) },
    )
}

@Composable
private fun HelpTopicsTable(
    topics: List<HelpTopicAdminDto>,
    onEdit: (HelpTopicAdminDto) -> Unit,
    onDelete: (HelpTopicAdminDto) -> Unit,
) {
    val columns = listOf(
        TableColumn<HelpTopicAdminDto>(header = "#", weight = 0.4f) { topic ->
            Text(
                text = topic.order.toString(),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontWeight = FontWeight.Medium,
            )
        },
        TableColumn(header = "Question", weight = 3f) { topic ->
            Text(
                text = topic.question,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 2,
            )
        },
        TableColumn(header = "Actions", weight = 0.8f) { topic ->
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                IconButton(
                    onClick = { onEdit(topic) },
                    modifier = Modifier.size(32.dp),
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit help topic",
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.primary,
                    )
                }
                IconButton(
                    onClick = { onDelete(topic) },
                    modifier = Modifier.size(32.dp),
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete help topic",
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.error,
                    )
                }
            }
        },
    )

    DataTable(
        columns = columns,
        rows = topics,
        modifier = Modifier.fillMaxSize(),
    )
}

@Composable
private fun ArticleEditorDialog(
    article: ArticleAdminDto?,
    onDismiss: () -> Unit,
    onSave: (title: String, description: String, imageUrl: String?, category: String, isPublished: Boolean) -> Unit,
) {
    var title by remember(article) { mutableStateOf(article?.title ?: "") }
    var description by remember(article) { mutableStateOf(article?.description ?: "") }
    var imageUrl by remember(article) { mutableStateOf(article?.imageUrl ?: "") }
    var category by remember(article) { mutableStateOf(article?.category ?: "") }
    var isPublished by remember(article) { mutableStateOf(article?.isPublished ?: false) }

    val isEditing = article != null && article.id != 0
    val titleText = if (isEditing) "Edit Article" else "New Article"

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = titleText, style = MaterialTheme.typography.titleLarge) },
        text = {
            Column(
                modifier = Modifier
                    .widthIn(min = 480.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 6,
                )
                OutlinedTextField(
                    value = imageUrl,
                    onValueChange = { imageUrl = it },
                    label = { Text("Image URL (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                OutlinedTextField(
                    value = category,
                    onValueChange = { category = it },
                    label = { Text("Category") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Checkbox(
                        checked = isPublished,
                        onCheckedChange = { isPublished = it },
                    )
                    Text(
                        text = "Published",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(
                        title,
                        description,
                        imageUrl.trim().takeIf { it.isNotEmpty() },
                        category,
                        isPublished,
                    )
                },
                enabled = title.isNotBlank() && description.isNotBlank(),
            ) {
                Text(if (isEditing) "Update" else "Create")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
    )
}

@Composable
private fun HelpTopicEditorDialog(
    topic: HelpTopicAdminDto?,
    onDismiss: () -> Unit,
    onSave: (question: String, answer: String, order: Int) -> Unit,
) {
    var question by remember(topic) { mutableStateOf(topic?.question ?: "") }
    var answer by remember(topic) { mutableStateOf(topic?.answer ?: "") }
    var orderText by remember(topic) { mutableStateOf(topic?.order?.toString() ?: "0") }

    val isEditing = topic != null && topic.id != 0
    val titleText = if (isEditing) "Edit Help Topic" else "New Help Topic"

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = titleText, style = MaterialTheme.typography.titleLarge) },
        text = {
            Column(
                modifier = Modifier
                    .widthIn(min = 480.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                OutlinedTextField(
                    value = question,
                    onValueChange = { question = it },
                    label = { Text("Question") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                OutlinedTextField(
                    value = answer,
                    onValueChange = { answer = it },
                    label = { Text("Answer") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 8,
                )
                OutlinedTextField(
                    value = orderText,
                    onValueChange = { orderText = it.filter { c -> c.isDigit() } },
                    label = { Text("Display Order") },
                    modifier = Modifier.width(160.dp),
                    singleLine = true,
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(question, answer, orderText.toIntOrNull() ?: 0)
                },
                enabled = question.isNotBlank() && answer.isNotBlank(),
            ) {
                Text(if (isEditing) "Update" else "Create")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
    )
}

@Composable
private fun NotificationDialog(
    onDismiss: () -> Unit,
    onSend: (title: String, message: String) -> Unit,
) {
    var title by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = "Send Notification", style = MaterialTheme.typography.titleLarge) },
        text = {
            Column(
                modifier = Modifier
                    .widthIn(min = 400.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    text = "This notification will be sent to all registered users.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                HorizontalDivider()
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                OutlinedTextField(
                    value = message,
                    onValueChange = { message = it },
                    label = { Text("Message") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 5,
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSend(title, message) },
                enabled = title.isNotBlank() && message.isNotBlank(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                ),
            ) {
                Text("Send to All")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
    )
}
