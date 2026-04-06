package com.prudential.health.console.ui.components

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

data class TableColumn<T>(
    val header: String,
    val weight: Float = 1f,
    val cell: @Composable (T) -> Unit,
)

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun <T> DataTable(
    columns: List<TableColumn<T>>,
    rows: List<T>,
    modifier: Modifier = Modifier,
    onRowClick: ((T) -> Unit)? = null,
) {
    val evenRowColor = MaterialTheme.colorScheme.surface
    val oddRowColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)

    LazyColumn(modifier = modifier) {
        // Sticky header
        stickyHeader {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                columns.forEach { col ->
                    HeaderCell(weight = col.weight) {
                        Text(
                            text = col.header,
                            style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
            HorizontalDivider(
                color = MaterialTheme.colorScheme.outline,
                thickness = 1.dp,
            )
        }

        // Data rows
        itemsIndexed(rows) { index, row ->
            val rowBg = if (index % 2 == 0) evenRowColor else oddRowColor
            val rowModifier = Modifier
                .fillMaxWidth()
                .background(rowBg)
                .then(
                    if (onRowClick != null) {
                        Modifier.clickable { onRowClick(row) }
                    } else Modifier,
                )
                .padding(horizontal = 12.dp, vertical = 8.dp)

            Row(
                modifier = rowModifier,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                columns.forEach { col ->
                    Box(modifier = Modifier.weight(col.weight)) {
                        col.cell(row)
                    }
                }
            }
            HorizontalDivider(
                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f),
                thickness = 0.5.dp,
            )
        }
    }
}

@Composable
private fun RowScope.HeaderCell(weight: Float, content: @Composable () -> Unit) {
    Box(modifier = Modifier.weight(weight)) {
        content()
    }
}
