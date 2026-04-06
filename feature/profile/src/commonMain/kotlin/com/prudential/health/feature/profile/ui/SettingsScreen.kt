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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Create
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.core.model.HealthPlatform
import com.prudential.health.core.ui.components.ConfirmationDialog
import com.prudential.health.core.ui.components.PruBottomSheet
import com.prudential.health.core.ui.components.PruCard
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.feature.profile.viewmodel.ProfileViewModel
import androidx.compose.material3.Icon as M3Icon

@Composable
fun SettingsScreen(
    viewModel: ProfileViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.settingsState.collectAsState()
    val user = state.user
    var showTermsSheet by remember { mutableStateOf(false) }
    var showPrivacySheet by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Profile picture
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box {
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(PruColors.Gray200),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = user?.name?.firstOrNull()?.uppercase() ?: "P",
                        style = MaterialTheme.typography.displaySmall,
                        color = PruColors.Gray700,
                    )
                }
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(PruColors.RedLight)
                        .clickable { viewModel.onShowProfilePicSheet(true) }
                        .align(Alignment.BottomEnd),
                    contentAlignment = Alignment.Center,
                ) {
                    M3Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit",
                        tint = PruColors.Red,
                        modifier = Modifier.size(16.dp),
                    )
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = user?.name ?: "User",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "Joined ${user?.joinedDate ?: ""}",
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Gray500,
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Notifications toggle
        PruCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "Notifications",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Medium,
                )
                Switch(
                    checked = state.notificationsEnabled,
                    onCheckedChange = viewModel::onNotificationsToggled,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = PruColors.White,
                        checkedTrackColor = PruColors.Red,
                    ),
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Manage connected apps
        PruCard {
            Text(
                text = "Manage connected apps",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Medium,
            )
            Spacer(modifier = Modifier.height(12.dp))
            if (state.connectedPlatform == HealthPlatform.NONE) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column {
                        Text(
                            text = "Connect Health App",
                            style = MaterialTheme.typography.bodyLarge,
                        )
                        Text(
                            text = "Connect Health Platform",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    M3Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                    )
                }
            } else {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    M3Icon(
                        imageVector = Icons.Default.Favorite,
                        contentDescription = null,
                        tint = PruColors.Red,
                        modifier = Modifier.size(32.dp),
                    )
                    PruPrimaryButton(
                        text = "Disconnect ${
                            when (state.connectedPlatform) {
                                HealthPlatform.APPLE_HEALTH -> "Apple Health"
                                HealthPlatform.GOOGLE_FIT -> "Google Fit"
                                else -> ""
                            }
                        }",
                        onClick = { viewModel.onShowDisconnectDialog(true) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // About the app
        PruCard {
            Text(
                text = "About the app",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Medium,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Version 1.0 | Developed by xyz corporation",
                style = MaterialTheme.typography.bodySmall,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "TERMS OF USE",
                style = MaterialTheme.typography.labelLarge,
                color = PruColors.Red,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.clickable { showTermsSheet = true },
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "PRIVACY POLICY",
                style = MaterialTheme.typography.labelLarge,
                color = PruColors.Red,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.clickable { showPrivacySheet = true },
            )
        }

        Spacer(modifier = Modifier.height(32.dp))
    }

    // Profile picture sheet
    if (state.showProfilePicSheet) {
        PruBottomSheet(
            title = "Change profile picture",
            onDismiss = { viewModel.onShowProfilePicSheet(false) },
        ) {
            PruCard {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    M3Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Upload",
                        tint = PruColors.Gray500,
                    )
                    Column {
                        Text(
                            text = "Upload from device",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Medium,
                            color = PruColors.Gray500,
                        )
                        Text(
                            text = "Coming soon",
                            style = MaterialTheme.typography.bodySmall,
                            color = PruColors.Gray400,
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            PruCard {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    M3Icon(
                        imageVector = Icons.Default.Create,
                        contentDescription = "Camera",
                        tint = PruColors.Gray500,
                    )
                    Column {
                        Text(
                            text = "Take photo",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Medium,
                            color = PruColors.Gray500,
                        )
                        Text(
                            text = "Coming soon",
                            style = MaterialTheme.typography.bodySmall,
                            color = PruColors.Gray400,
                        )
                    }
                }
            }
        }
    }

    // Disconnect dialog
    if (state.showDisconnectDialog) {
        ConfirmationDialog(
            title = "Are you sure you want to disconnect the app?",
            message = "Disconnecting will stop syncing your health data.",
            onDismiss = { viewModel.onShowDisconnectDialog(false) },
            onConfirm = viewModel::disconnectPlatform,
        )
    }

    // Terms of Use sheet
    if (showTermsSheet) {
        PruBottomSheet(title = "Terms of use", onDismiss = { showTermsSheet = false }) {
            Text(
                text = "I hereby declare that the statements and particulars provided for the addition of proposed member are true, correct, and complete to the best of my knowledge. I understand that this information will form the basis of the insurance contract and that the addition is subject to the underwriting guidelines, medical history (if applicable) and required documents. I have been informed that the coverage will commence only upon insurer's approval and receipt of the applicable premium.",
                style = MaterialTheme.typography.bodyMedium,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(16.dp))
            PruPrimaryButton(text = "Done", onClick = { showTermsSheet = false })
        }
    }

    // Privacy Policy sheet
    if (showPrivacySheet) {
        PruBottomSheet(title = "Privacy Policy", onDismiss = { showPrivacySheet = false }) {
            Text(
                text = "Your privacy is important to us. Prudential HCL Health Insurance Limited collects, uses, and protects your personal data in accordance with applicable data protection laws. We collect information such as your name, contact details, health data, and device information to provide and improve our services.\n\nYour health data from Google Fit or Apple Health is used solely for step tracking, calculating healthy days, and determining premium discounts. We do not sell your personal data to third parties.\n\nYou have the right to access, correct, or delete your personal data. For any privacy-related queries, contact our Data Protection Officer at privacy@prudential.health.",
                style = MaterialTheme.typography.bodyMedium,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(16.dp))
            PruPrimaryButton(text = "Done", onClick = { showPrivacySheet = false })
        }
    }
}
