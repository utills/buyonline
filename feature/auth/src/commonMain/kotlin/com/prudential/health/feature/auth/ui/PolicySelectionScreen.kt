package com.prudential.health.feature.auth.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.core.ui.components.PruDropdown
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.feature.auth.viewmodel.AuthViewModel

@Composable
fun PolicySelectionScreen(
    viewModel: AuthViewModel,
    onPolicySelected: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val uiState by viewModel.uiState.collectAsState()
    val policies by viewModel.policies.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White),
    ) {
        // Hero section with branded illustration
        AuthHeroSection(modifier = Modifier.weight(1f))

        // Policy selection
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
        ) {
            Text(
                text = "Select policy",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Select the policy you want to login as",
                style = MaterialTheme.typography.bodyMedium,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(20.dp))

            if (policies.isEmpty()) {
                // Loading state
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(
                        color = PruColors.Red,
                        modifier = Modifier.size(24.dp),
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Loading policies...",
                    style = MaterialTheme.typography.bodySmall,
                    color = PruColors.Gray500,
                )
            } else {
                PruDropdown(
                    label = "Select policy number",
                    selectedValue = uiState.selectedPolicyNumber,
                    options = policies.map { it.policyNumber },
                    onValueSelected = viewModel::onPolicySelected,
                    placeholder = "Select a policy",
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            PruPrimaryButton(
                text = "Submit",
                onClick = onPolicySelected,
                enabled = uiState.selectedPolicyNumber.isNotEmpty(),
            )
        }
    }
}
