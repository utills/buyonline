package com.prudential.health.core.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.prudential.health.core.ui.theme.PruColors

@Composable
fun PruCard(
    modifier: Modifier = Modifier,
    elevation: Dp = 1.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    if (onClick != null) {
        Card(
            onClick = onClick,
            modifier = modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = PruColors.White,
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = elevation),
            border = BorderStroke(1.dp, PruColors.Gray200),
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                content = content,
            )
        }
    } else {
        Card(
            modifier = modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = PruColors.White,
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = elevation),
            border = BorderStroke(1.dp, PruColors.Gray200),
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                content = content,
            )
        }
    }
}
