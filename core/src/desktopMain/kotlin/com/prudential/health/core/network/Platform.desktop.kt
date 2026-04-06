package com.prudential.health.core.network

actual fun getBaseUrl(): String =
    System.getProperty("api.baseUrl") ?: "http://localhost:8080/v1/"
