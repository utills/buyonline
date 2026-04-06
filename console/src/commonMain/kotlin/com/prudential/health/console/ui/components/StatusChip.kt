package com.prudential.health.console.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun StatusChip(
    label: String,
    color: Color = MaterialTheme.colorScheme.primaryContainer,
) {
    val contentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .background(
                color = color,
                shape = RoundedCornerShape(50),
            )
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = contentColor,
        )
    }
}
