package com.prudential.health.feature.content.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.prudential.health.core.model.Article
import com.prudential.health.core.model.HelpTopic
import coil3.compose.AsyncImage
import com.prudential.health.core.ui.components.PruCard
import com.prudential.health.core.ui.components.PruErrorState
import com.prudential.health.core.ui.components.PruLoadingIndicator
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.feature.content.model.ContentTab
import com.prudential.health.feature.content.viewmodel.ContentViewModel

@Composable
fun BlogsScreen(
    viewModel: ContentViewModel,
    modifier: Modifier = Modifier,
) {
    val uiState by viewModel.uiState.collectAsState()

    if (uiState.isLoading && uiState.articles.isEmpty() && uiState.helpTopics.isEmpty()) {
        PruLoadingIndicator()
        return
    }

    if (uiState.error != null && uiState.articles.isEmpty()) {
        PruErrorState(
            message = uiState.error ?: "Failed to load content",
            onRetry = { viewModel.loadContent() },
        )
        return
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .padding(horizontal = 16.dp),
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = buildAnnotatedString {
                append("Blogs and ")
                withStyle(SpanStyle(color = PruColors.Red, fontWeight = FontWeight.Bold)) {
                    append("Resources!")
                }
            },
            style = MaterialTheme.typography.headlineLarge,
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Expert articles, wellness tips, chronic care insights, and plan guides",
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Tabs
        val tabs = ContentTab.entries
        val selectedIndex = tabs.indexOf(uiState.selectedTab)

        TabRow(
            selectedTabIndex = selectedIndex,
            containerColor = Color.Transparent,
            contentColor = PruColors.Black,
            indicator = { tabPositions ->
                if (selectedIndex < tabPositions.size) {
                    TabRowDefaults.SecondaryIndicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[selectedIndex]),
                        color = PruColors.Red,
                    )
                }
            },
            divider = {},
        ) {
            tabs.forEachIndexed { index, tab ->
                Tab(
                    selected = index == selectedIndex,
                    onClick = { viewModel.onTabSelected(tab) },
                    text = {
                        Text(
                            text = when (tab) {
                                ContentTab.ARTICLES -> "Blogs and articles"
                                ContentTab.HELP_TOPICS -> "Help topics"
                            },
                            fontWeight = if (index == selectedIndex) FontWeight.Bold else FontWeight.Normal,
                        )
                    },
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        val filteredArticles = if (uiState.searchQuery.isBlank()) {
            uiState.articles
        } else {
            uiState.articles.filter { article ->
                article.title.contains(uiState.searchQuery, ignoreCase = true) ||
                    article.description.contains(uiState.searchQuery, ignoreCase = true)
            }
        }

        when (uiState.selectedTab) {
            ContentTab.ARTICLES -> ArticlesList(
                articles = filteredArticles,
                searchQuery = uiState.searchQuery,
                isLoading = uiState.isLoading,
                onArticleClick = { article -> viewModel.onArticleSelected(article) },
            )
            ContentTab.HELP_TOPICS -> HelpTopicsList(
                topics = uiState.helpTopics,
                searchQuery = uiState.searchQuery,
                onSearchQueryChanged = viewModel::onSearchQueryChanged,
                expandedTopicId = uiState.expandedTopicId,
                onTopicToggled = viewModel::onTopicToggled,
            )
        }
    }
}

@Composable
private fun ArticlesList(
    articles: List<Article>,
    searchQuery: String = "",
    isLoading: Boolean = false,
    onArticleClick: (Article) -> Unit = {},
) {
    if (articles.isEmpty() && !isLoading) {
        Box(
            modifier = Modifier.fillMaxWidth().padding(32.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                if (searchQuery.isNotBlank()) "No articles match your search" else "No articles available",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        return
    }
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        items(articles) { article ->
            ArticleCard(article = article, onClick = { onArticleClick(article) })
        }
        item { Spacer(modifier = Modifier.height(80.dp)) }
    }
}

@Composable
private fun ArticleCard(
    article: Article,
    onClick: () -> Unit = {},
    modifier: Modifier = Modifier,
) {
    PruCard(onClick = onClick, modifier = modifier) {
        // Image area
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(160.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(PruColors.Gray100),
            contentAlignment = Alignment.Center,
        ) {
            if (!article.imageUrl.isNullOrEmpty()) {
                AsyncImage(
                    model = article.imageUrl,
                    contentDescription = article.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                )
            } else {
                // Gradient placeholder with category icon
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            brush = androidx.compose.ui.graphics.Brush.verticalGradient(
                                colors = listOf(PruColors.PinkGradientStart, PruColors.PinkGradientEnd),
                            ),
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = article.category.ifEmpty { "Health" },
                        style = MaterialTheme.typography.headlineSmall,
                        color = PruColors.Red.copy(alpha = 0.4f),
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Category chip + date
        if (article.category.isNotEmpty() || article.publishedDate.isNotEmpty()) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (article.category.isNotEmpty()) {
                    Text(
                        text = article.category,
                        style = MaterialTheme.typography.labelSmall,
                        color = PruColors.Red,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier
                            .background(PruColors.RedLight, RoundedCornerShape(4.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp),
                    )
                }
                if (article.publishedDate.isNotEmpty()) {
                    Text(
                        text = article.publishedDate,
                        style = MaterialTheme.typography.labelSmall,
                        color = PruColors.Gray500,
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Title
        Text(
            text = article.title,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            maxLines = 2,
        )

        // Description
        if (article.description.isNotEmpty()) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = article.description,
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Gray600,
                maxLines = 2,
            )
        }
    }
}

@Composable
private fun HelpTopicsList(
    topics: List<HelpTopic>,
    searchQuery: String,
    onSearchQueryChanged: (String) -> Unit,
    expandedTopicId: String?,
    onTopicToggled: (String) -> Unit,
) {
    Column {
        // Search bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchQueryChanged,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Search") },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search",
                    tint = PruColors.Gray500,
                )
            },
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = PruColors.Red,
                unfocusedBorderColor = PruColors.Gray300,
            ),
        )

        Spacer(modifier = Modifier.height(16.dp))

        val filteredTopics = if (searchQuery.isBlank()) {
            topics
        } else {
            topics.filter {
                it.question.contains(searchQuery, ignoreCase = true) ||
                    it.answer.contains(searchQuery, ignoreCase = true)
            }
        }

        LazyColumn {
            items(filteredTopics) { topic ->
                FaqItem(
                    topic = topic,
                    isExpanded = expandedTopicId == topic.id,
                    onClick = { onTopicToggled(topic.id) },
                )
            }
            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}

@Composable
private fun FaqItem(
    topic: HelpTopic,
    isExpanded: Boolean,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = topic.question,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f),
            )
            Icon(
                imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                contentDescription = if (isExpanded) "Collapse" else "Expand",
                tint = PruColors.Gray600,
            )
        }

        AnimatedVisibility(visible = isExpanded) {
            Text(
                text = topic.answer,
                style = MaterialTheme.typography.bodyMedium,
                color = PruColors.Gray600,
                modifier = Modifier.padding(top = 8.dp),
            )
        }

        HorizontalDivider(
            modifier = Modifier.padding(top = 12.dp),
            color = PruColors.Gray200,
        )
    }
}
