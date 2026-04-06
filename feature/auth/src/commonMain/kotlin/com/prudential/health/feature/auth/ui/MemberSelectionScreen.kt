package com.prudential.health.feature.auth.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
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
import androidx.compose.ui.unit.dp
import com.prudential.health.core.model.PolicyMember
import com.prudential.health.core.ui.components.ConsentCheckbox
import com.prudential.health.core.ui.components.PruBottomSheet
import com.prudential.health.core.ui.components.PruCard
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.feature.auth.model.ConsentStep
import com.prudential.health.feature.auth.viewmodel.AuthViewModel

@Composable
fun MemberSelectionScreen(
    viewModel: AuthViewModel,
    onComplete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val uiState by viewModel.uiState.collectAsState()
    val members by viewModel.members.collectAsState()

    // State-driven navigation: only navigate once via LaunchedEffect
    LaunchedEffect(uiState.consentStep) {
        if (uiState.consentStep == ConsentStep.COMPLETED) {
            onComplete()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White),
    ) {
        // Hero section with branded illustration
        AuthHeroSection(modifier = Modifier.height(280.dp))

        // Member selection
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
        ) {
            Text(
                text = "Select member",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Select the member you want to login as",
                style = MaterialTheme.typography.bodyMedium,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(20.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(members) { member ->
                    MemberCard(
                        member = member,
                        onClick = { viewModel.onMemberTapped(member.id) },
                    )
                }
            }
        }
    }

    // Consent flow sheets
    when (uiState.consentStep) {
        ConsentStep.MEMBER_CONFIRM -> {
            val selectedMember = members.find { it.id == uiState.selectedMemberId }
            if (selectedMember != null) {
                MemberConfirmSheet(
                    memberName = selectedMember.name,
                    onConfirm = viewModel::onMemberConfirmed,
                    onDismiss = { viewModel.onConsentSkipped(ConsentStep.MEMBER_CONFIRM) },
                )
            }
        }
        ConsentStep.USER_CONSENT -> {
            ConsentSheet(
                title = "User Consent",
                consentText = "I consent to <XYZ Portal> collecting and using my health and activity data from Google Fit/Apple Health solely to provide wellness and insurance-related services, as described in our Privacy Policy. I understand that Google/Apple independently process this data as per their respective privacy policies.",
                onProceed = { viewModel.onConsentAccepted(ConsentStep.USER_CONSENT) },
                onDismiss = { viewModel.onConsentSkipped(ConsentStep.USER_CONSENT) },
            )
        }
        ConsentStep.LOCATION_PERMISSION -> {
            ConsentSheet(
                title = "Location permission",
                consentText = "I consent to the collection and use of my location data by <XYZ Portal> solely for providing and personalizing services, as described in the Privacy Policy.",
                onProceed = { viewModel.onConsentAccepted(ConsentStep.LOCATION_PERMISSION) },
                onDismiss = { viewModel.onConsentSkipped(ConsentStep.LOCATION_PERMISSION) },
            )
        }
        ConsentStep.NOTIFICATION_PERMISSION -> {
            NotificationConsentSheet(
                onProceed = { viewModel.onConsentAccepted(ConsentStep.NOTIFICATION_PERMISSION) },
                onDismiss = { viewModel.onConsentSkipped(ConsentStep.NOTIFICATION_PERMISSION) },
            )
        }
        else -> {}
    }
}

@Composable
private fun MemberCard(member: PolicyMember, onClick: () -> Unit) {
    PruCard(onClick = onClick) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    text = member.name,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
                if (member.isProposer) {
                    Text(
                        text = "Proposer",
                        style = MaterialTheme.typography.labelSmall,
                        color = PruColors.Gray700,
                        modifier = Modifier
                            .background(PruColors.Gray200, RoundedCornerShape(4.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp),
                    )
                }
            }
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = "Select",
                tint = PruColors.Red,
            )
        }
    }
}

@Composable
private fun MemberConfirmSheet(
    memberName: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
) {
    var isChecked by remember { mutableStateOf(false) }

    PruBottomSheet(
        title = "Are you sure you want to login as\n$memberName?",
        onDismiss = onDismiss,
    ) {
        Text(
            text = "Once you choose to log in as a member, your session will be linked to this device. You will not be able to log in as the same member from another device at the same time.",
            style = MaterialTheme.typography.bodyMedium,
            color = PruColors.Gray600,
        )
        Spacer(modifier = Modifier.height(16.dp))
        ConsentCheckbox(
            text = "I understand",
            checked = isChecked,
            onCheckedChange = { isChecked = it },
        )
        Spacer(modifier = Modifier.height(16.dp))
        PruPrimaryButton(
            text = "Proceed",
            onClick = onConfirm,
            enabled = isChecked,
        )
    }
}

@Composable
private fun ConsentSheet(
    title: String,
    consentText: String,
    onProceed: () -> Unit,
    onDismiss: () -> Unit,
) {
    var isChecked by remember { mutableStateOf(false) }

    PruBottomSheet(title = title, onDismiss = onDismiss) {
        ConsentCheckbox(
            text = consentText,
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
private fun NotificationConsentSheet(
    onProceed: () -> Unit,
    onDismiss: () -> Unit,
) {
    var isEmailChecked by remember { mutableStateOf(false) }
    var isWhatsappChecked by remember { mutableStateOf(false) }

    PruBottomSheet(title = "Notification permission", onDismiss = onDismiss) {
        ConsentCheckbox(
            title = "Email and sms",
            text = "I consent to being contacted by Prudential HCL Health Insurance Limited via my registered email address and mobile number for service-related communications in connection with <portal/service name>, as described in the Privacy Policy.",
            checked = isEmailChecked,
            onCheckedChange = { isEmailChecked = it },
        )
        Spacer(modifier = Modifier.height(12.dp))
        ConsentCheckbox(
            title = "Whatsapp",
            text = "I consent to receiving service-related communications from Prudential HCL Health Insurance Limited on WhatsApp through my registered mobile number for matters related to <portal/service name>.",
            checked = isWhatsappChecked,
            onCheckedChange = { isWhatsappChecked = it },
        )
        Spacer(modifier = Modifier.height(16.dp))
        PruPrimaryButton(
            text = "Proceed",
            onClick = onProceed,
            enabled = isEmailChecked || isWhatsappChecked,
        )
    }
}
