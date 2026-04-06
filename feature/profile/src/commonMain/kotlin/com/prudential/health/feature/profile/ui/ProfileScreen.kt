package com.prudential.health.feature.profile.ui

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.material3.Card
import com.prudential.health.core.model.Policy
import com.prudential.health.core.model.PolicyStatus
import com.prudential.health.core.ui.components.ConfirmationDialog
import com.prudential.health.core.ui.components.PruBottomSheet
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.core.util.FormatUtils
import com.prudential.health.feature.profile.viewmodel.ProfileViewModel

@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel,
    onSettingsClick: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.profileState.collectAsState()
    val user = state.user
    val policy = state.policy
    val isLoading = state.isLoading

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // User info
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(PruColors.Gray200),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = user?.name?.firstOrNull()?.uppercase() ?: "P",
                    style = MaterialTheme.typography.headlineMedium,
                    color = PruColors.Gray700,
                )
            }
            Column {
                Text(
                    text = user?.name?.takeIf { it.isNotBlank() } ?: if (isLoading) "Loading..." else "—",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = "Joined ${user?.joinedDate ?: ""}",
                    style = MaterialTheme.typography.bodySmall,
                    color = PruColors.Gray500,
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Policy card
        if (policy != null) {
            PolicyCard(policy = policy)
        } else if (!isLoading) {
            Card(modifier = Modifier.fillMaxWidth().padding(horizontal = 0.dp)) {
                Text(
                    text = "Policy information not available",
                    modifier = Modifier.padding(16.dp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Settings
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onSettingsClick)
                .padding(vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Settings",
                    tint = PruColors.Gray700,
                )
                Text(
                    text = "Settings",
                    style = MaterialTheme.typography.titleLarge,
                )
            }
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = "Go",
                tint = PruColors.Gray500,
            )
        }

        HorizontalDivider(color = PruColors.Gray200)

        // Logout
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { viewModel.onShowLogoutDialog(true) }
                .padding(vertical = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                imageVector = Icons.Default.Close,
                contentDescription = "Logout",
                tint = PruColors.Gray700,
            )
            Text(
                text = "Logout",
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(modifier = Modifier.weight(1f))
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = "Go",
                tint = PruColors.Gray500,
            )
        }
    }

    // Logout dialog
    if (state.showLogoutDialog) {
        ConfirmationDialog(
            title = "Are you sure you want to logout?",
            message = "Disconnecting the app will stop health data syncing, and you will no longer be able to view activity insights or access related benefits and discounts.",
            onDismiss = { viewModel.onShowLogoutDialog(false) },
            onConfirm = viewModel::logout,
        )
    }

    // Terms of use sheet
    if (state.showTermsOfUseSheet) {
        PruBottomSheet(
            title = "Terms of use",
            onDismiss = { viewModel.onShowTermsSheet(false) },
        ) {
            Text(
                text = "I hereby declare that the statements and particulars provided for the addition of proposed member are true, correct, and complete to the best of my knowledge. I understand that this information will form the basis of the insurance contract and that the addition is subject to the underwriting guidelines, medical history (if applicable) and required documents. I have been informed that the coverage will commence only upon insurer's approval and receipt of the applicable premium.",
                style = MaterialTheme.typography.bodyMedium,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(16.dp))
            PruPrimaryButton(
                text = "Done",
                onClick = { viewModel.onShowTermsSheet(false) },
            )
        }
    }
}

@Composable
private fun PolicyCard(policy: Policy) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(PruColors.White, RoundedCornerShape(16.dp))
            .padding(1.dp)
            .background(PruColors.Gray200, RoundedCornerShape(16.dp))
            .padding(1.dp)
            .background(PruColors.White, RoundedCornerShape(15.dp))
            .padding(20.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                imageVector = Icons.Default.Lock,
                contentDescription = "Policy",
                tint = PruColors.Red,
                modifier = Modifier.size(40.dp),
            )
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(
                            if (policy.status == PolicyStatus.ACTIVE) PruColors.GreenSuccess
                            else PruColors.Gray500,
                        ),
                )
                Text(
                    text = policy.status.name.lowercase().replaceFirstChar { it.uppercase() },
                    style = MaterialTheme.typography.labelMedium,
                    color = PruColors.Gray700,
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = policy.planName,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = policy.policyNumber,
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Policy holder", style = MaterialTheme.typography.bodySmall, color = PruColors.Gray500)
                Text(policy.policyHolder, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            }
            Column(modifier = Modifier.weight(1f)) {
                Text("Sum insured", style = MaterialTheme.typography.bodySmall, color = PruColors.Gray500)
                Text(FormatUtils.formatCurrency(policy.sumInsured), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Annual Premium", style = MaterialTheme.typography.bodySmall, color = PruColors.Gray500)
                Text(FormatUtils.formatCurrency(policy.annualPremium), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            }
            Column(modifier = Modifier.weight(1f)) {
                Text("Start Date", style = MaterialTheme.typography.bodySmall, color = PruColors.Gray500)
                Text(policy.startDate, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Renewal Date", style = MaterialTheme.typography.bodySmall, color = PruColors.Gray500)
                Text(policy.renewalDate, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            }
            Column(modifier = Modifier.weight(1f)) {
                Text("Auto-debit", style = MaterialTheme.typography.bodySmall, color = PruColors.Gray500)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (policy.isAutoDebitActive) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Active",
                            tint = PruColors.GreenSuccess,
                            modifier = Modifier.size(16.dp),
                        )
                        Text(
                            " Activated",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                        )
                    } else {
                        Text("Inactive", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }
    }
}
