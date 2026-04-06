package com.prudential.health.console

import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowPlacement
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import com.prudential.health.console.di.consoleModule
import org.koin.core.context.startKoin
import java.awt.Dimension

fun main() {
    startKoin {
        modules(consoleModule)
    }

    application {
        val windowState = rememberWindowState(
            placement = WindowPlacement.Maximized,
            size = DpSize(1400.dp, 900.dp),
        )
        Window(
            onCloseRequest = ::exitApplication,
            title = "PruHealth Console",
            state = windowState,
        ) {
            window.minimumSize = Dimension(1200, 800)
            ConsoleApp()
        }
    }
}
