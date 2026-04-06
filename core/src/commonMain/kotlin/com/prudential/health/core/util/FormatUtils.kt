package com.prudential.health.core.util

import kotlin.math.roundToInt

object FormatUtils {
    fun formatSteps(steps: Int): String {
        return when {
            steps >= 1_000_000 -> "${roundToOneDecimal(steps / 1_000_000.0)}M"
            steps >= 1_000 -> formatWithCommas(steps)
            else -> steps.toString()
        }
    }

    fun formatDistance(km: Double): String {
        return "${roundToOneDecimal(km)}km"
    }

    fun formatActiveTime(minutes: Int): String {
        val hours = minutes / 60
        val mins = minutes % 60
        return when {
            hours > 0 -> "${hours}h ${mins}m"
            else -> "${mins}m"
        }
    }

    /** Indian number format: 20,00,000 */
    fun formatCurrency(amount: Double): String {
        val intAmount = amount.roundToInt()
        val str = intAmount.toString()
        val len = str.length

        if (len <= 3) return "₹ $str"

        // Last 3 digits are always a single group; remaining digits group in pairs from the right
        val lastThree = str.substring(len - 3)
        val remaining = str.substring(0, len - 3)

        val groups = mutableListOf<String>()
        var i = remaining.length
        while (i > 0) {
            val start = (i - 2).coerceAtLeast(0)
            groups.add(0, remaining.substring(start, i))
            i = start
        }

        return "₹ " + groups.joinToString(",") + "," + lastThree
    }

    fun formatPercent(value: Double, decimals: Int = 1): String {
        val factor = pow10(decimals)
        val rounded = (value * factor).roundToInt() / factor.toDouble()
        return if (rounded == rounded.toLong().toDouble()) {
            "${rounded.toLong()}%"
        } else {
            "$rounded%"
        }
    }

    fun padZero(value: Int): String = if (value < 10) "0$value" else "$value"

    fun formatDecimal(value: Double, decimals: Int = 2): String {
        val factor = pow10(decimals)
        val rounded = (value * factor).roundToInt() / factor.toDouble()
        // Build decimal string without String.format
        val intPart = rounded.toLong()
        val fracPart = ((rounded - intPart) * factor).roundToInt()
        return if (fracPart == 0) {
            "$intPart.${"0".repeat(decimals)}"
        } else {
            val fracStr = fracPart.toString().padStart(decimals, '0')
            "$intPart.$fracStr"
        }
    }

    private fun formatWithCommas(value: Int): String {
        val str = value.toString()
        val result = StringBuilder()
        var count = 0
        for (i in str.lastIndex downTo 0) {
            if (count > 0 && count % 3 == 0) result.insert(0, ',')
            result.insert(0, str[i])
            count++
        }
        return result.toString()
    }

    private fun roundToOneDecimal(value: Double): String {
        val rounded = (value * 10).roundToInt() / 10.0
        return if (rounded == rounded.toLong().toDouble()) {
            rounded.toLong().toString()
        } else {
            rounded.toString()
        }
    }

    private fun pow10(n: Int): Int {
        var result = 1
        repeat(n) { result *= 10 }
        return result
    }
}

fun String.urlEncode(): String = buildString {
    for (char in this@urlEncode) {
        when {
            char.isLetterOrDigit() || char in "-._~" -> append(char)
            else -> {
                char.toString().encodeToByteArray().forEach { b ->
                    append('%')
                    append(b.toInt().and(0xff).toString(16).uppercase().padStart(2, '0'))
                }
            }
        }
    }
}
