package com.prudential.health.health

import android.content.Context
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.StepsRecord

object HealthPermissionHelper {

    val REQUIRED_PERMISSIONS = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(DistanceRecord::class),
        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
    )

    fun createPermissionLauncher(
        activity: ComponentActivity,
        onResult: (granted: Boolean) -> Unit,
    ): ActivityResultLauncher<Set<String>> {
        val contract = PermissionController.createRequestPermissionResultContract()
        return activity.registerForActivityResult(contract) { granted ->
            onResult(granted.containsAll(REQUIRED_PERMISSIONS))
        }
    }

    suspend fun hasPermissions(context: Context): Boolean {
        val client = runCatching { HealthConnectClient.getOrCreate(context) }.getOrNull()
            ?: return false
        return runCatching {
            client.permissionController.getGrantedPermissions()
                .containsAll(REQUIRED_PERMISSIONS)
        }.getOrDefault(false)
    }
}
