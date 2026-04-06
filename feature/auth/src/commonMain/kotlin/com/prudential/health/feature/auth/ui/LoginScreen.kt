package com.prudential.health.feature.auth.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.components.PruTextField
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.feature.auth.viewmodel.AuthViewModel

@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onOtpSent: () -> Unit,
    onTermsClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val uiState by viewModel.uiState.collectAsState()

    // State-driven navigation: navigate only after OTP is actually sent
    LaunchedEffect(uiState.otpSent) {
        if (uiState.otpSent) {
            viewModel.consumeOtpSentEvent()
            onOtpSent()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White),
    ) {
        // Hero section with branded illustration
        AuthHeroSection(modifier = Modifier.weight(1f))

        // Login form
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
        ) {
            Text(
                text = "Login",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Enter your registered number to login",
                style = MaterialTheme.typography.bodyMedium,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(20.dp))

            PruTextField(
                value = uiState.phone,
                onValueChange = viewModel::onPhoneChanged,
                label = "",
                placeholder = "Enter mobile number",
                keyboardType = KeyboardType.Phone,
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(
                    checked = uiState.isTermsAccepted,
                    onCheckedChange = viewModel::onTermsAccepted,
                    colors = CheckboxDefaults.colors(
                        checkedColor = PruColors.Red,
                        checkmarkColor = PruColors.White,
                    ),
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = buildAnnotatedString {
                        append("I agree to the ")
                        withStyle(SpanStyle(color = PruColors.Red, fontWeight = FontWeight.Medium)) {
                            append("Terms and Conditions")
                        }
                    },
                    style = MaterialTheme.typography.bodyMedium,
                )
            }

            uiState.error?.let { error ->
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = error,
                    style = MaterialTheme.typography.bodySmall,
                    color = PruColors.Red,
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            PruPrimaryButton(
                text = if (uiState.isLoading) "Sending..." else "Get OTP",
                onClick = { viewModel.sendOtp() },
                enabled = uiState.phone.length == 10 && uiState.isTermsAccepted && !uiState.isLoading,
            )
        }
    }
}
