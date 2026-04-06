package com.prudential.health.core.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

object PruColors {
    val Red = Color(0xFFED1C24)
    val RedDark = Color(0xFFC41019)
    val RedLight = Color(0xFFFDE8E9)
    val RedSurface = Color(0xFFFFF5F5)

    val White = Color(0xFFFFFFFF)
    val Black = Color(0xFF1A1A1A)
    val Gray50 = Color(0xFFFAFAFA)
    val Gray100 = Color(0xFFF5F5F5)
    val Gray200 = Color(0xFFEEEEEE)
    val Gray300 = Color(0xFFE0E0E0)
    val Gray400 = Color(0xFFBDBDBD)
    val Gray500 = Color(0xFF9E9E9E)
    val Gray600 = Color(0xFF757575)
    val Gray700 = Color(0xFF616161)
    val Gray800 = Color(0xFF424242)
    val Gray900 = Color(0xFF212121)

    val GreenSuccess = Color(0xFF4CAF50)
    val GreenLight = Color(0xFFE8F5E9)
    val YellowWarning = Color(0xFFFFC107)
    val YellowLight = Color(0xFFFFF8E1)
    val OrangeAccent = Color(0xFFFF9800)

    val PinkGradientStart = Color(0xFFFCE4EC)
    val PinkGradientEnd = Color(0xFFFFF0F0)

    val ChartGreen = Color(0xFF4CAF50)
    val ChartOrange = Color(0xFFFF9800)
    val ChartBar = Color(0xFFFFB74D)
    val ChartBarHighlight = Color(0xFFFF9800)
}

private val PruLightColorScheme = lightColorScheme(
    primary = PruColors.Red,
    onPrimary = PruColors.White,
    primaryContainer = PruColors.RedLight,
    onPrimaryContainer = PruColors.RedDark,
    secondary = PruColors.Gray700,
    onSecondary = PruColors.White,
    secondaryContainer = PruColors.Gray100,
    onSecondaryContainer = PruColors.Gray900,
    surface = PruColors.White,
    onSurface = PruColors.Black,
    surfaceVariant = PruColors.Gray50,
    onSurfaceVariant = PruColors.Gray600,
    background = PruColors.White,
    onBackground = PruColors.Black,
    error = PruColors.Red,
    onError = PruColors.White,
    outline = PruColors.Gray300,
    outlineVariant = PruColors.Gray200,
)

private val PruDarkColorScheme = darkColorScheme(
    primary = Color(0xFFFF6B6B),
    onPrimary = Color.White,
    primaryContainer = Color(0xFF8B0000),
    onPrimaryContainer = Color(0xFFFFDAD6),
    background = Color(0xFF1A1A1A),
    onBackground = Color(0xFFE8E8E8),
    surface = Color(0xFF2A2A2A),
    onSurface = Color(0xFFE8E8E8),
    surfaceVariant = Color(0xFF3A3A3A),
    onSurfaceVariant = Color(0xFFCCCCCC),
    outline = Color(0xFF666666),
    error = Color(0xFFCF6679),
    onError = Color.White,
)

@Composable
fun PruHealthTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) PruDarkColorScheme else PruLightColorScheme,
        typography = PruTypography,
        content = content,
    )
}
