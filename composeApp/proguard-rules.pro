# ============================================================================
# ProGuard / R8 Rules for StepTracker (Pru Health)
# ============================================================================

# ---- Kotlin Serialization ----
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keepclasseswithmembers class kotlinx.serialization.json.** { kotlinx.serialization.KSerializer serializer(...); }
-keep,includedescriptorclasses class com.prudential.health.**$$serializer { *; }
-keepclassmembers class com.prudential.health.** { *** Companion; }
-keepclasseswithmembers class com.prudential.health.** { kotlinx.serialization.KSerializer serializer(...); }

# ---- Ktor ----
-keep class io.ktor.** { *; }
-dontwarn io.ktor.**

# ---- Koin ----
-keep class org.koin.** { *; }

# ---- Coil ----
-keep class coil3.** { *; }
-dontwarn coil3.**

# ---- kotlinx.datetime ----
-keep class kotlinx.datetime.** { *; }
-dontwarn kotlinx.datetime.**

# ---- General Kotlin ----
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# ---- WorkManager ----
-keep class androidx.work.** { *; }
-keep class com.prudential.health.sync.** { *; }

# ---- Keep all app model and network classes ----
-keep class com.prudential.health.core.model.** { *; }
-keep class com.prudential.health.core.network.** { *; }
-keep class com.prudential.health.core.sync.** { *; }
-keep class com.prudential.health.feature.**.model.** { *; }
