package com.prudential.health.console.feature.users

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.console.model.ConsentStatusDto
import com.prudential.health.console.model.StepHistoryEntry
import com.prudential.health.console.model.UserDetailAdminDto
import com.prudential.health.console.ui.components.StatusChip
import org.koin.compose.koinInject

@Composable
fun UserDetailPanel(userId: Int) {
    val detailVm: UserDetailViewModel = koinInject()
    val state by detailVm.state.collectAsState()

    LaunchedEffect(userId) {
        detailVm.loadUser(userId)
    }

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
                modifier = Modifier.padding(24.dp),
            )
        }

        state.detail != null -> UserDetailContent(detail = state.detail!!)
    }
}

@Composable
private fun UserDetailContent(detail: UserDetailAdminDto) {
    val user = detail.user
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // User header
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                text = user.name,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = user.phone + if (user.email != null) "  ·  ${user.email}" else "",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                text = "Joined ${user.joinedDate}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        HorizontalDivider()

        // Info chips row
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (user.policyNumber != null) {
                StatusChip(
                    label = "Policy: ${user.policyNumber}",
                    color = MaterialTheme.colorScheme.secondaryContainer,
                )
            }
            if (user.connectedPlatform != null) {
                StatusChip(
                    label = user.connectedPlatform,
                    color = MaterialTheme.colorScheme.tertiaryContainer,
                )
            }
            StatusChip(
                label = "${detail.activeSessions} session${if (detail.activeSessions != 1) "s" else ""}",
                color = if (detail.activeSessions > 0)
                    MaterialTheme.colorScheme.primaryContainer
                else
                    MaterialTheme.colorScheme.surfaceVariant,
            )
        }

        HorizontalDivider()

        // Consent table
        SectionTitle(title = "Consents")
        ConsentTable(consents = detail.consents)

        HorizontalDivider()

        // Step history (last 10 entries)
        SectionTitle(title = "Recent Step History")
        StepHistoryList(entries = detail.stepHistory.take(10))

        Spacer(modifier = Modifier.height(8.dp))
    }
}

@Composable
private fun SectionTitle(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.onSurface,
    )
}

@Composable
private fun ConsentTable(consents: List<ConsentStatusDto>) {
    if (consents.isEmpty()) {
        Text(
            text = "No consent records",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        return
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
    ) {
        Text(
            text = "Type",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.weight(2f),
        )
        Text(
            text = "Accepted",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.weight(1f),
        )
        Text(
            text = "Date",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.weight(2f),
        )
    }

    HorizontalDivider()

    consents.forEach { consent ->
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = consent.consentType,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.weight(2f),
            )
            Box(modifier = Modifier.weight(1f)) {
                StatusChip(
                    label = if (consent.isAccepted) "Yes" else "No",
                    color = if (consent.isAccepted)
                        Color(0xFF4CAF50).copy(alpha = 0.2f)
                    else
                        MaterialTheme.colorScheme.errorContainer,
                )
            }
            Text(
                text = consent.acceptedAt ?: "—",
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.weight(2f),
            )
        }
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
    }
}

@Composable
private fun StepHistoryList(entries: List<StepHistoryEntry>) {
    if (entries.isEmpty()) {
        Text(
            text = "No step history",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        return
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
    ) {
        Text(
            text = "Date",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.weight(2f),
        )
        Text(
            text = "Steps",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.weight(1.5f),
        )
        Text(
            text = "Healthy Day",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.weight(1.5f),
        )
    }

    HorizontalDivider()

    entries.forEach { entry ->
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = entry.date,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.weight(2f),
            )
            Text(
                text = "%,d".format(entry.steps),
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.weight(1.5f),
            )
            Box(modifier = Modifier.weight(1.5f)) {
                StatusChip(
                    label = if (entry.isHealthyDay) "Yes" else "No",
                    color = if (entry.isHealthyDay)
                        Color(0xFF4CAF50).copy(alpha = 0.2f)
                    else
                        MaterialTheme.colorScheme.surfaceVariant,
                )
            }
        }
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
    }
}
