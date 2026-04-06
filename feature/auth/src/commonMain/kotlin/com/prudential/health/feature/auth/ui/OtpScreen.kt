package com.prudential.health.feature.auth.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.prudential.health.core.ui.components.PruPrimaryButton
import com.prudential.health.core.ui.theme.PruColors
import com.prudential.health.core.util.FormatUtils
import com.prudential.health.feature.auth.viewmodel.AuthViewModel

@Composable
fun OtpScreen(
    viewModel: AuthViewModel,
    onVerified: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val uiState by viewModel.uiState.collectAsState()
    val maskedPhone = "******" + uiState.phone.takeLast(4)

    // State-driven navigation: only navigate after async verification succeeds
    LaunchedEffect(uiState.isOtpVerified) {
        if (uiState.isOtpVerified) {
            viewModel.consumeOtpVerifiedEvent()
            onVerified()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PruColors.White),
    ) {
        // Hero section with branded illustration
        AuthHeroSection(modifier = Modifier.weight(1f))

        // OTP form
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
        ) {
            Text(
                text = "Enter OTP",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Please enter OTP sent on $maskedPhone",
                style = MaterialTheme.typography.bodyMedium,
                color = PruColors.Gray600,
            )
            Spacer(modifier = Modifier.height(24.dp))

            OtpInputField(
                otp = uiState.otp,
                onOtpChange = viewModel::onOtpChanged,
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Timer and Resend
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Timer",
                    tint = PruColors.Gray500,
                    modifier = Modifier.size(18.dp),
                )
                Spacer(modifier = Modifier.width(4.dp))
                val minutes = uiState.otpTimerSeconds / 60
                val seconds = uiState.otpTimerSeconds % 60
                Text(
                    text = "${FormatUtils.padZero(minutes)}:${FormatUtils.padZero(seconds)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = PruColors.Gray600,
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(text = "|", color = PruColors.Gray400)
                Spacer(modifier = Modifier.width(12.dp))
                TextButton(
                    onClick = viewModel::resendOtp,
                    enabled = uiState.otpTimerSeconds == 0,
                ) {
                    Text(
                        text = "Resend OTP",
                        color = if (uiState.otpTimerSeconds == 0) PruColors.Red else PruColors.Gray400,
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Resend",
                        tint = if (uiState.otpTimerSeconds == 0) PruColors.Red else PruColors.Gray400,
                        modifier = Modifier.size(16.dp),
                    )
                }
            }

            uiState.error?.let { error ->
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = error,
                    style = MaterialTheme.typography.bodySmall,
                    color = PruColors.Red,
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            PruPrimaryButton(
                text = "Submit",
                onClick = { viewModel.verifyOtp() },
                enabled = uiState.otp.length == 6 && !uiState.isLoading,
            )
        }
    }
}

@Composable
private fun OtpInputField(
    otp: String,
    onOtpChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    BasicTextField(
        value = otp,
        onValueChange = { value ->
            if (value.length <= 6 && value.all { it.isDigit() }) {
                onOtpChange(value)
            }
        },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        modifier = modifier,
        decorationBox = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                repeat(6) { index ->
                    val char = otp.getOrNull(index)
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .border(
                                width = 1.dp,
                                color = if (char != null) PruColors.Red else PruColors.Gray300,
                                shape = RoundedCornerShape(8.dp),
                            )
                            .background(PruColors.White, RoundedCornerShape(8.dp)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = char?.toString() ?: "",
                            style = MaterialTheme.typography.headlineSmall,
                            textAlign = TextAlign.Center,
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                }
            }
        },
    )
}
