package com.prudential.health.server.routes

import com.prudential.health.server.model.ApiError
import com.prudential.health.server.model.HeartScoreInputDto
import com.prudential.health.server.model.QDiabetesInputDto
import com.prudential.health.server.service.CalculatorService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

private fun validateRange(value: Number?, name: String, min: Number, max: Number): String? {
    if (value == null) return null
    val v = value.toDouble()
    if (v < min.toDouble() || v > max.toDouble()) return "$name must be between $min and $max"
    return null
}

fun Route.calculatorRoutes(calculatorService: CalculatorService) {
    route("/v1/calculator") {

        get("/history") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@get
            }
            val history = calculatorService.getCalculatorHistory(userId)
            call.respond(history)
        }

        post("/heart-score") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@post
            }
            val input = call.receive<HeartScoreInputDto>()

            val error = validateRange(input.age, "age", 18, 120)
                ?: validateRange(input.heightCm, "heightCm", 50, 300)
                ?: validateRange(input.weightKg, "weightKg", 10, 500)
                ?: validateRange(input.systolicBP, "systolicBP", 60, 300)
                ?: validateRange(input.cholesterolHdlRatio, "cholesterolHdlRatio", 0.1, 50)
            if (error != null) {
                call.respond(HttpStatusCode.BadRequest, ApiError("validation_error", error))
                return@post
            }

            val result = calculatorService.calculateHeartScore(userId, input)
            call.respond(result)
        }

        post("/bmi") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@post
            }
            val input = call.receive<HeartScoreInputDto>()

            val error = validateRange(input.heightCm, "heightCm", 50, 300)
                ?: validateRange(input.weightKg, "weightKg", 10, 500)
            if (error != null) {
                call.respond(HttpStatusCode.BadRequest, ApiError("validation_error", error))
                return@post
            }
            if (input.heightCm == null || input.heightCm == 0.0) {
                call.respond(HttpStatusCode.BadRequest, ApiError("validation_error", "heightCm must be > 0"))
                return@post
            }
            if (input.weightKg == null || input.weightKg == 0.0) {
                call.respond(HttpStatusCode.BadRequest, ApiError("validation_error", "weightKg must be > 0"))
                return@post
            }

            val heightM = input.heightCm / 100.0
            val bmi = input.weightKg / (heightM * heightM)
            call.respond(mapOf("bmi" to Math.round(bmi * 100.0) / 100.0))
        }

        post("/qdiabetes") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@post
            }
            val input = call.receive<QDiabetesInputDto>()
            val age = input.age.toDoubleOrNull()
            val bmi = input.bmi.toDoubleOrNull()
            val error = if (age == null || age < 25 || age > 84) "age must be between 25 and 84"
                else if (bmi == null || bmi < 10 || bmi > 60) "bmi must be a valid number between 10 and 60"
                else null
            if (error != null) {
                call.respond(HttpStatusCode.BadRequest, ApiError("validation_error", error))
                return@post
            }
            val result = calculatorService.calculateQDiabetes(userId, input)
            call.respond(result)
        }

        post("/bmr") {
            val userId = call.getUserId() ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("unauthorized", "Invalid session"))
                return@post
            }
            val input = call.receive<HeartScoreInputDto>()

            val error = validateRange(input.age, "age", 15, 120)
                ?: validateRange(input.heightCm, "heightCm", 50, 300)
                ?: validateRange(input.weightKg, "weightKg", 10, 500)
            if (error != null) {
                call.respond(HttpStatusCode.BadRequest, ApiError("validation_error", error))
                return@post
            }
            if (input.gender !in listOf("male", "female")) {
                call.respond(HttpStatusCode.BadRequest, ApiError("validation_error", "gender must be 'male' or 'female'"))
                return@post
            }

            val weight = input.weightKg ?: 70.0
            val height = input.heightCm ?: 170.0
            val age = input.age ?: 30
            // Mifflin-St Jeor Equation
            val bmr = if (input.gender == "male") {
                88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
            } else {
                447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
            }
            call.respond(mapOf("bmr" to Math.round(bmr * 10.0) / 10.0))
        }
    }
}
