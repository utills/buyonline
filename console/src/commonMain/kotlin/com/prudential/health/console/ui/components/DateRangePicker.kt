package com.prudential.health.console.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun DateRangePicker(
    startDate: String,
    endDate: String,
    onStartDateChange: (String) -> Unit,
    onEndDateChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        OutlinedTextField(
            value = startDate,
            onValueChange = onStartDateChange,
            modifier = Modifier.weight(1f),
            label = {
                Text(
                    text = "Start Date",
                    style = MaterialTheme.typography.labelSmall,
                )
            },
            placeholder = {
                Text(
                    text = "YYYY-MM-DD",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                )
            },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.CalendarMonth,
                    contentDescription = "Start date",
                    modifier = Modifier.size(18.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            },
            singleLine = true,
            textStyle = MaterialTheme.typography.bodyMedium,
            shape = MaterialTheme.shapes.small,
        )

        OutlinedTextField(
            value = endDate,
            onValueChange = onEndDateChange,
            modifier = Modifier.weight(1f),
            label = {
                Text(
                    text = "End Date",
                    style = MaterialTheme.typography.labelSmall,
                )
            },
            placeholder = {
                Text(
                    text = "YYYY-MM-DD",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                )
            },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.CalendarMonth,
                    contentDescription = "End date",
                    modifier = Modifier.size(18.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            },
            singleLine = true,
            textStyle = MaterialTheme.typography.bodyMedium,
            shape = MaterialTheme.shapes.small,
        )
    }
}
