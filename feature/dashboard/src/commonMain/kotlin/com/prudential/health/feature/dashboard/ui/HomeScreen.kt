package com.prudential.health.feature.dashboard.ui

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.prudential.health.core.sync.SyncStatus
import com.prudential.health.core.ui.components.ConsentCheckbox
import com.prudential.health.core.ui.components.PruBottomSheet
import com.prudential.health.core.ui.components.PruLoadingIndicator
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.feature.dashboard.ui.components.ConnectHealthCard
import com.prudential.health.feature.dashboard.ui.components.HealthJourneySection
import com.prudential.health.feature.dashboard.ui.components.StepSummaryChart
import com.prudential.health.feature.dashboard.ui.components.StepsTodayCard
import com.prudential.health.feature.dashboard.viewmodel.DashboardViewModel
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: DashboardViewModel,
    modifier: Modifier = Modifier,
) {
    val uiState by viewModel.uiState.collectAsState()

    if (uiState.isLoading) {
        PruLoadingIndicator()
        return
    }

    PullToRefreshBox(
        isRefreshing = uiState.isLoading,
        onRefresh = { viewModel.loadDashboard() },
        modifier = modifier.fillMaxSize(),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(PruColors.White)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
        ) {
            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = buildAnnotatedString {
                    append("Hello ")
                    withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
                        append("${uiState.userName.ifEmpty { "User" }}!")
                    }
                },
                style = MaterialTheme.typography.headlineLarge,
            )

            // Sync status banner
            SyncStatusBanner(
                status = uiState.syncStatus,
                pendingCount = uiState.pendingSyncCount,
                onSyncTap = { viewModel.syncNow() },
            )

            if (uiState.isConnected) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Keep going, every step counts!",
                    style = MaterialTheme.typography.bodyMedium,
                    color = PruColors.Gray600,
                )
                Spacer(modifier = Modifier.height(16.dp))

                StepsTodayCard(stepData = uiState.stepData)
                Spacer(modifier = Modifier.height(24.dp))

                StepSummaryChart(
                    weeklySummary = uiState.weeklySummary,
                    monthlySummary = uiState.monthlySummary,
                    yearlySummary = uiState.yearlySummary,
                    selectedPeriod = uiState.selectedPeriod,
                    onPeriodSelected = viewModel::onPeriodSelected,
                )
                Spacer(modifier = Modifier.height(24.dp))

                HealthJourneySection(
                    milestones = uiState.milestones,
                    totalHealthyDays = uiState.stepData.totalHealthyDays,
                )
            } else {
                Spacer(modifier = Modifier.height(16.dp))

                ConnectHealthCard(
                    onConnectGoogleFit = viewModel::requestConnectPlatform,
                    onConnectAppleHealth = viewModel::requestConnectPlatform,
                )
                Spacer(modifier = Modifier.height(24.dp))

                AboutUsSection()
            }

            uiState.error?.let { error ->
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = error,
                    style = MaterialTheme.typography.bodySmall,
                    color = PruColors.Red,
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }

    if (uiState.showConsentSheet) {
        HealthConsentSheet(
            onProceed = viewModel::confirmConnect,
            onDismiss = viewModel::dismissConsent,
        )
    }
}

@Composable
private fun SyncStatusBanner(
    status: SyncStatus,
    pendingCount: Int,
    onSyncTap: () -> Unit,
) {
    // Auto-hide the success banner after 3 seconds.
    var showSuccess by remember(status) { mutableStateOf(status == SyncStatus.SUCCESS) }
    LaunchedEffect(status) {
        if (status == SyncStatus.SUCCESS) {
            delay(3_000)
            showSuccess = false
        }
    }

    val bgColor: Color
    val label: String
    when {
        status == SyncStatus.SYNCING -> {
            bgColor = Color(0xFFE3F2FD)
            label = "Syncing steps…"
        }
        status == SyncStatus.PENDING -> {
            bgColor = Color(0xFFFFF3E0)
            label = if (pendingCount > 0) "$pendingCount day(s) pending sync. Tap to sync." else "Step data pending sync. Tap to sync."
        }
        status == SyncStatus.ERROR -> {
            bgColor = Color(0xFFFFEBEE)
            label = "Sync failed. Tap to retry."
        }
        showSuccess -> {
            bgColor = Color(0xFFE8F5E9)
            label = "Steps synced successfully."
        }
        else -> return  // IDLE — show nothing
    }

    Spacer(modifier = Modifier.height(8.dp))
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(bgColor, RoundedCornerShape(8.dp))
            .clickable(
                enabled = status == SyncStatus.PENDING || status == SyncStatus.ERROR,
                onClick = onSyncTap,
            )
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        when (status) {
            SyncStatus.SYNCING -> CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
            SyncStatus.PENDING -> Icon(imageVector = Icons.Default.CloudUpload, contentDescription = null, modifier = Modifier.size(16.dp))
            SyncStatus.ERROR -> Icon(imageVector = Icons.Default.CloudOff, contentDescription = null, modifier = Modifier.size(16.dp))
            else -> Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(16.dp))
        }
        Text(text = label, style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun HealthConsentSheet(
    onProceed: () -> Unit,
    onDismiss: () -> Unit,
) {
    var isChecked by remember { mutableStateOf(false) }

    PruBottomSheet(title = "User Consent", onDismiss = onDismiss) {
        ConsentCheckbox(
            text = "I consent to <XYZ Portal> collecting and using my health and activity data from Google Fit/Apple Health solely to provide wellness and insurance-related services, as described in our Privacy Policy. I understand that Google/Apple independently process this data as per their respective privacy policies.",
            checked = isChecked,
            onCheckedChange = { isChecked = it },
        )
        Spacer(modifier = Modifier.height(16.dp))
        PruPrimaryButton(
            text = "Proceed",
            onClick = onProceed,
            enabled = isChecked,
        )
    }
}

@Composable
private fun AboutUsSection() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(
            text = buildAnnotatedString {
                append("About ")
                withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
                    append("Us")
                }
            },
            style = MaterialTheme.typography.headlineLarge,
        )
        Text(
            text = "Prudential Health India is built as a modern, greenfield venture with no legacy systems, it aims to deliver a seamless, intuitive, and deeply customer-centric health insurance experience.",
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )
        Text(
            text = "The company draws on Prudential's 175+ year global heritage in protection and financial services and HCL's strengths in technology, healthcare, and large-scale digital solutions. Together, they aim to reimagine how Indians access and experience health insurance through simple, accessible, and future-ready solutions.",
            style = MaterialTheme.typography.bodySmall,
            color = PruColors.Gray700,
            modifier = Modifier
                .background(PruColors.Gray50)
                .padding(16.dp),
        )
        Text(
            text = "Prudential Health India also supports the national vision of \"Insurance for All by 2047\", focusing on making healthcare more accessible, affordable, preventive, and inclusive.",
            style = MaterialTheme.typography.bodySmall,
            color = PruColors.Gray700,
            modifier = Modifier
                .background(PruColors.Gray50)
                .padding(16.dp),
        )
    }
}
