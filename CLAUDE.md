# StepTracker - Pru Health App

## Project Overview
Kotlin Multiplatform (Compose Multiplatform) step tracking app for Prudential Health Insurance.
Users track daily steps, earn "healthy days" toward premium discounts, and access health calculators.

## Architecture
- **Clean Architecture + MVVM** with Repository pattern
- **Koin DI** for dependency injection
- **StateFlow** for reactive state management
- **Type-safe navigation** with kotlinx-serialization routes

## Module Structure
```
core/           → Shared models, networking (Ktor client), DI, theme, UI components
feature/auth/   → Login, OTP, policy/member selection, consent flow
feature/dashboard/ → Home screen, step tracking, charts, health journey milestones
feature/content/   → Blogs, articles, help topics FAQ
feature/calculator/→ Heart Score, QDiabetes, BMI, BMR calculators
feature/profile/   → Profile, settings, notifications
composeApp/     → Main app, navigation, platform entry points
server/         → Ktor server, Exposed ORM, H2/PostgreSQL, JWT auth
```

## How to Run

### Backend
```bash
DEV_OTP=142075 ./gradlew :server:run
```
Server starts at http://localhost:8080. H2 database auto-creates in `./data/`.
Omit `DEV_OTP` in production — the passkey bypass is only active when the env var is set.

### Android
```bash
./gradlew :composeApp:installDebug
```

### Test Login
- Phone: `9876893933`
- OTP: `142075` (universal dev passkey — only active when server started with `DEV_OTP=142075 ./gradlew :server:run`)
- Policy: `100098768933`

### Whitelisted Test Numbers (always verify with OTP `123456`, no SMS sent)
- `9031570222` — static OTP `123456`
- `9455068676` — static OTP `123456`
- Add more via `WHITELISTED_PHONES=num1,num2` env var; change static OTP via `WHITELIST_OTP`

### Admin Console
- URL: run `./gradlew :console:run`
- Email: `admin@prudential.com`
- Password: `admin123`

## Key Conventions
- Feature modules follow: `model/ → repository/ → viewmodel/ → ui/ → di/`
- ViewModels shared across sub-screens are hoisted in `AppNavGraph`
- Per-screen ViewModels use `koinViewModel()` in composable scope
- All network calls go through `ApiClient` which handles token refresh + 401 auto-retry
- Session data persisted via `PersistentStorage` (SharedPreferences/NSUserDefaults)
- Server endpoints under `/v1/` prefix, JWT required for protected routes

## Database
- Dev: H2 in PostgreSQL compatibility mode (`./data/steptracker`)
- Prod: PostgreSQL / Cloud SQL (swap driver in `application.conf`)
- ORM: JetBrains Exposed, 12 SQL tables, seed data on first run

## Build Requirements
- JDK 17 (set in gradle.properties)
- Android SDK (compileSdk 35, minSdk 26)
- Gradle 8.11.1 (wrapper included)
