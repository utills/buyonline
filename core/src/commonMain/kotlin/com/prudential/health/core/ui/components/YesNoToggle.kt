package com.prudential.health.core.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.prudential.health.core.ui.theme.PruColors

@Composable
fun YesNoToggle(
    value: Boolean?,
    onValueChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.Start,
    ) {
        FilterChip(
            selected = value == true,
            onClick = { onValueChange(true) },
            label = { Text("Yes") },
            shape = RoundedCornerShape(20.dp),
            border = BorderStroke(1.dp, PruColors.Gray300),
            colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = PruColors.Gray100,
                selectedLabelColor = PruColors.Black,
            ),
        )
        Spacer(modifier = Modifier.width(8.dp))
        FilterChip(
            selected = value == false,
            onClick = { onValueChange(false) },
            label = {
                Row {
                    if (value == false) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = null,
                            tint = PruColors.Red,
                            modifier = Modifier.size(16.dp),
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                    }
                    Text("No")
                }
            },
            shape = RoundedCornerShape(20.dp),
            border = BorderStroke(1.dp, PruColors.Gray300),
            colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = PruColors.Gray100,
                selectedLabelColor = PruColors.Black,
            ),
        )
    }
}
