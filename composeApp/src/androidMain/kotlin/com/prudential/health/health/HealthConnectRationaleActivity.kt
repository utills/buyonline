package com.prudential.health.health

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prudential.health.R

/**
 * Required by Google Play for apps that use Health Connect.
 *
 * Google Play will deep-link to this activity from the app's store listing when users
 * tap "Learn more" next to the health permissions declaration. It must be exported and
 * respond to the [ACTION_SHOW_PERMISSIONS_RATIONALE] intent.
 *
 * Reference: https://developer.android.com/health-and-fitness/guides/health-connect/publish
 */
class HealthConnectRationaleActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    RationaleScreen(
                        onContinue = { setResult(RESULT_OK); finish() },
                        onCancel = { setResult(RESULT_CANCELED); finish() },
                    )
                }
            }
        }
    }

    companion object {
        const val ACTION_SHOW_PERMISSIONS_RATIONALE =
            "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE"
    }
}

@Composable
private fun RationaleScreen(
    onContinue: () -> Unit,
    onCancel: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = stringResource(R.string.health_rationale_title),
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface,
        )

        Text(
            text = stringResource(R.string.health_rationale_body),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.weight(1f))

        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = onContinue,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(stringResource(R.string.health_rationale_button))
            }
            TextButton(
                onClick = onCancel,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(stringResource(R.string.health_rationale_cancel))
            }
        }
    }
}
