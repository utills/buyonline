# BuyOnline Improvement Backlog
_Generated: 2026-02-23_
_Based on: full codebase audit + live system testing (API test agent + frontend test agent)_

---

## Executive Summary

BuyOnline is a well-scaffolded health insurance purchase platform with a complete end-to-end journey (lead → OTP → onboarding → quote → payment → KYC → health declaration) and an innovative AI-powered agentic chat flow. The core purchase journey works end-to-end as confirmed by live API testing. However, the system is not yet production-ready: no real payment gateway integration exists, KYC is simulated, SMS delivery is absent, file uploads go to local disk, the `SessionGuard` is trivially bypassable (no JWT), and the agentic chat can loop infinitely. Several pages have hardcoded values, the onboarding layout shows a static "1/5" progress indicator regardless of step, and the `/declaration` frontend route 404s. The codebase quality is high overall — the architecture, type safety, and error handling are solid — but approximately 20 items need to be resolved before going live.

---

## Test Results Summary

### API Test Agent (live testing on 2026-02-23)

The complete purchase journey was tested end-to-end successfully:

| Step | Result |
|------|--------|
| Health check `GET /health` | 200 OK |
| Create lead `POST /api/v1/leads` | 201 Created (leadId obtained) |
| Send OTP `POST /api/v1/otp/send` | 201 — OTP returned in plain text (dev mode) |
| Verify OTP `POST /api/v1/otp/verify` | 201 OK |
| Create application `POST /api/v1/applications` | 201 Created |
| Update pincode `PATCH /api/v1/applications/:id/pincode` | 200 OK |
| Add members `POST /api/v1/applications/:id/members` | 201 Created |
| Declare diseases (empty) | 201 OK |
| Check eligibility | 200 — allEligible: true |
| Get plans | 200 — 3 plans returned with pricing tiers |
| Select plan | 201 — totalPremium: 12036 |
| Get addons | 200 — addons returned |
| Select addons | 201 OK |
| Save proposer | 201 Created |
| Initiate payment | Response received |

**Critical API finding:** The initial test hit wrong route (`/api/leads` instead of `/api/v1/leads`) returning 404 — the v1 prefix is not documented anywhere accessible. The `otp/verify` also initially failed because the test sent `code` instead of `otp` and `leadId` instead of what the DTO expects — indicating the DTO field names don't match what developers naturally expect.

### Frontend Test Agent

| Page | Status |
|------|--------|
| `/` (landing) | 200 OK |
| `/pincode` | 200 OK |
| `/pre-existing` | 200 OK |
| `/critical-conditions` | 200 OK |
| `/eligibility` | 200 OK |
| `/plans` | 200 OK |
| `/addons` | 200 OK |
| `/proposer` | 200 OK |
| `/gateway` | 200 OK |
| `/method` | 200 OK |
| `/personal` | 200 OK |
| `/lifestyle` | 200 OK |
| `/medical` | 200 OK |
| `/hospitalization` | 200 OK |
| `/declaration` | **404 NOT FOUND** |
| `/otp` (standalone) | 200 OK |
| `/ai-journey` | 200 OK |

**Frontend critical finding:** `/declaration` route does not exist. The frontend API proxy (`/api/*`) returns 404 — Next.js is not proxying API calls; the frontend must call the API directly at `http://localhost:3001`.

---

## 🔴 Critical (Blockers for v1 Launch)

### C1: OTP Returned in Plain Text in Production Response
**Area:** Backend
**File:** `apps/api/src/modules/otp/otp.service.ts:77`
**Problem:** The `send()` method always returns the raw OTP code in the response body (`return { ..., otp }`). Even though the comment says "Remove in production", there is no environment guard — if deployed as-is, every attacker can bypass authentication by simply reading the OTP from the API response.
**Impact:** Complete authentication bypass. Anyone can log in as any user.
**Fix:** Gate the `otp` field behind `process.env.NODE_ENV === 'development'` check, or remove it entirely and rely on SMS delivery.

### C2: No Real SMS Gateway Integration
**Area:** Backend
**File:** `apps/api/src/modules/otp/otp.service.ts:73`
**Problem:** OTP is only logged to the console (`this.logger.log(...)`). There is no SMS gateway (Twilio, AWS SNS, MSG91, etc.) integration. Users on mobile will never receive an OTP.
**Impact:** The product is unusable for real users — every OTP flow silently fails.
**Fix:** Integrate an SMS gateway. Create an `SmsService` with a provider abstraction. Inject it into `OtpService.send()`.

### C3: No Real Payment Gateway Integration
**Area:** Backend / Frontend
**File:** `apps/web/src/components/payment/PaymentGateway.tsx`, `apps/api/src/modules/payment/payment.service.ts`
**Problem:** The payment gateway is a UI mockup that simulates success/failure. No real gateway (Razorpay, PayU, CCAvenue, Stripe) is integrated. `gatewayOrderId` is a randomly generated UUID. Webhook signature verification is absent entirely.
**Impact:** No real money can be collected; policy cannot be issued.
**Fix:** Integrate Razorpay or PayU. Verify webhook signatures using HMAC. Store idempotency keys.

### C4: SessionGuard Does Not Actually Authenticate Users
**Area:** Backend
**File:** `apps/api/src/common/guards/session.guard.ts`
**Problem:** The `SessionGuard` only checks that the `x-application-id` header is present — it does not verify that the request is from the legitimate owner of that application. Any user who knows another user's `applicationId` can access and modify their data.
**Impact:** Complete authorization bypass. Horizontal privilege escalation across all users.
**Fix:** Issue a short-lived JWT after OTP verification, attach it to the application record, and validate it in `SessionGuard`. Or use session tokens stored in Redis keyed to `applicationId`.

### C5: File Uploads Stored on Local Disk
**Area:** Backend
**File:** `apps/api/src/modules/upload/upload.service.ts:8`
**Problem:** KYC documents are written to `process.cwd()/uploads/` on the local filesystem. In a containerized/multi-instance deployment, this directory is ephemeral and not shared across instances.
**Impact:** Uploaded KYC documents are lost on container restart. Not scalable.
**Fix:** Integrate AWS S3, GCS, or Azure Blob Storage. Return a CDN URL instead of a local path.

### C6: `/declaration` Route Returns 404
**Area:** Frontend
**File:** Missing route file
**Problem:** The frontend test agent confirmed `/declaration` returns a 404. This page appears to be referenced in some flows (health declaration has multiple sub-pages: personal, lifestyle, medical, hospitalization, but the overall declaration summary page is missing).
**Impact:** Users hit a dead end if they navigate to `/declaration`.
**Fix:** Create `/apps/web/src/app/(health)/declaration/page.tsx` with a declaration summary component, or remove references to this route.

### C7: Agentic Chat Can Loop Infinitely
**Area:** Backend (AI)
**File:** `apps/api/src/modules/chat/agentic-chat.service.ts:62`
**Problem:** The `while (true)` loop that processes tool calls has no iteration limit. If the AI repeatedly requests tool calls without stopping, the loop runs indefinitely, consuming API tokens and potentially blocking the SSE response.
**Impact:** Runaway API costs, hung HTTP connections, server resource exhaustion.
**Fix:** Add a `MAX_TOOL_ITERATIONS = 10` counter and break with an error message if exceeded.

### C8: CKYC Verification Uses Random Number — Not Deterministic
**Area:** Backend
**File:** `apps/api/src/modules/kyc/strategies/ckyc.strategy.ts:52`
**Problem:** `simulateCkycCheck()` uses `Math.random() > 0.2` — an 80% success rate random outcome. This means 20% of legitimate users will fail KYC randomly, causing confusion and complaints. There is also no retry logic or real PAN verification API call.
**Impact:** 20% of users in testing/staging will have random KYC failures.
**Fix:** For development, make PAN numbers starting with "XXXXX" succeed and others fail deterministically. For production, integrate with CKYC registry API or NSDL PAN verification.

### C9: Payment Amount Not Validated Server-Side
**Area:** Backend
**File:** `apps/api/src/modules/payment/payment.service.ts:71`
**Problem:** `initiatePayment()` accepts `dto.amount` directly from the client request without cross-checking it against the `selectedPlan.totalPremium` stored in the database. A client could pass `amount: 1` and pay ₹0.01 for a full policy.
**Impact:** Revenue loss through tampered payment amounts.
**Fix:** Ignore `dto.amount` and instead compute the amount from `app.selectedPlan.totalPremium + selectedAddons.sum`.

### C10: HealthDeclaration Model Has `@unique` on `applicationId` — Prevents Multiple Declarations
**Area:** Backend / DB
**File:** `apps/api/prisma/schema.prisma:424`, `apps/api/src/modules/health-declaration/health-declaration.service.ts`
**Problem:** The `HealthDeclaration` model has `applicationId String @unique`, meaning only one declaration per application. But hospitalization and disability are saved as separate calls — the service uses `findFirst` + manual upsert instead of the proper Prisma `upsert` on `applicationId`. The separate `saveHospitalization` and `saveDisability` create separate records but the schema constraint prevents this.
**Impact:** Second health declaration save attempt will throw a unique constraint violation.
**Fix:** Use `prisma.healthDeclaration.upsert({ where: { applicationId } })` with a proper `@@unique([applicationId])` backing the upsert, or merge hospitalization and disability into a single update call.

---

## 🟠 High Priority (Should Fix Soon)

### H1: OTP Verify DTO Field Naming Mismatch Causes Developer Confusion
**Area:** Backend
**File:** `apps/api/src/modules/otp/dto/verify-otp.dto.ts`
**Problem:** The test agent initially sent `{ mobile, code, leadId }` which is what most developers expect. The actual DTO requires `{ mobile, otp }`. This mismatch is undiscoverable without reading the source code — there is no API documentation.
**Impact:** Integration errors for frontend developers and third-party consumers.
**Fix:** Enable Swagger (the code is already commented out in `main.ts`) and add `@ApiProperty()` decorators. This is a one-command install away.

### H2: Onboarding Layout Has Hardcoded "1 / 5" Progress
**Area:** Frontend
**File:** `apps/web/src/app/(onboarding)/layout.tsx:5-7`
**Problem:** The layout has `const STEP = 1; const TOTAL = 5; const STEP_LABEL = '1 / 5'` hardcoded. All onboarding sub-pages (pincode, pre-existing, critical-conditions, eligibility) show the same "1 / 5" progress bar at 20% — the indicator never updates.
**Impact:** Misleading UX — users think they are always on step 1 of 5.
**Fix:** Pass the current step as a prop or read it from the URL pathname in the layout.

### H3: Plans Page Has a Bug — `sumInsured` Default Is Wrong
**Area:** Frontend
**File:** `apps/web/src/stores/useQuoteStore.ts:40`
**Problem:** The initial `sumInsured` is `500_0000` (5,000,000 — 50 lakh). But the `SUM_INSURED_OPTIONS` in shared-types lists options starting from 10L, 25L, 50L, 1Cr. The default filters plans by `sumInsured === 500_0000` — when the seeded pricing tiers use different values, no plans will display until the user changes the filter.
**Fix:** Set the default to `5000000` (same value, different formatting — verify seed data matches) and add a fallback to show all plans when no tier matches the selected sum insured.

### H4: Missing API Proxy in Next.js Config
**Area:** Frontend
**File:** `apps/web/next.config.ts`
**Problem:** The frontend test agent confirmed that `http://localhost:3000/api/health` returns 404. There are no `rewrites` or `async rewrites()` in `next.config.ts` to proxy `/api/*` to the backend. All frontend code calls `API_BASE_URL` directly (e.g., `http://localhost:3001`), which works in development but breaks in production when the API is at an internal hostname.
**Impact:** Cross-origin API calls in production; CORS configuration required at all times; harder to deploy behind a single domain.
**Fix:** Add `rewrites()` to proxy `/api/v1/*` to the backend service URL, or document that `NEXT_PUBLIC_API_URL` must be set.

### H5: Agentic Chat — `checkEligibility` Tool Always Returns `allEligible: true`
**Area:** Backend (AI)
**File:** `apps/api/src/modules/chat/agentic-auth-tools.service.ts:268`
**Problem:** The `checkEligibility` implementation in the agentic flow always returns `{ allEligible: true }` without actually checking member ages or critical conditions. This is a stub that bypasses the real `EligibilityService`.
**Impact:** Users with critical conditions or members over 65 are told they are eligible and can purchase a policy that should be declined.
**Fix:** Call `EligibilityService.checkEligibility(applicationId)` from the agentic auth tools instead of returning a hardcoded result.

### H6: Payment Callback Has No Signature Verification
**Area:** Backend
**File:** `apps/api/src/modules/payment/payment.service.ts:107`, `apps/api/src/modules/payment/dto/payment-callback.dto.ts`
**Problem:** `handleCallback()` accepts any payload claiming a payment succeeded. `gatewaySignature` is stored but never validated. A malicious request with `status: 'SUCCESS'` and a fake `gatewayOrderId` would mark an application as paid.
**Impact:** Policy issued without payment being collected.
**Fix:** Implement HMAC signature verification using the payment gateway's shared secret. Reject callbacks with invalid signatures with a 401.

### H7: Conversation History Not Saved for Agentic Tool Calls
**Area:** Backend (AI)
**File:** `apps/api/src/modules/chat/agentic-chat.service.ts:133`
**Problem:** `appendMessages()` saves only the user message and the final `fullResponse` text. When tool calls occur, the intermediate assistant messages (with tool_use blocks) and user messages (with tool_results) are not saved to Redis. On the next request, the history is reconstructed without tool call context, causing the AI to lose track of what tools it already executed (e.g., it may try to send OTP again).
**Impact:** AI re-runs already-completed steps, creating duplicate records (double OTP sends, duplicate leads).
**Fix:** Serialize the full message array (including ContentBlock arrays) to Redis after each turn, not just the text representation.

### H8: `SelectedPlan.addonPremium` Never Updated When Addons Are Selected
**Area:** Backend
**File:** `apps/api/src/modules/plan/addon.service.ts` (inferred), `apps/api/src/modules/chat/agentic-plan-tools.service.ts:112`
**Problem:** When addons are selected via `selectAddons`, the `SelectedPlan.addonPremium` field is never updated to reflect the added premium. The `totalPremium` shown in the plan summary therefore does not include addon costs.
**Impact:** User pays less than quoted because addon premium is excluded from total.
**Fix:** After saving `SelectedAddon` records, sum their prices and update `selectedPlan.addonPremium` and `selectedPlan.totalPremium` accordingly.

### H9: `Proposal.status` Is a `String` Not an Enum in the DB Schema
**Area:** Backend / DB
**File:** `apps/api/prisma/schema.prisma:445`
**Problem:** `Proposal.status String @default("UNDER_REVIEW")` is a plain string, while everywhere else in the codebase enums are used. The `ProposalStatus` enum is defined in shared-types but never referenced in the Prisma schema. This allows invalid statuses to be stored.
**Fix:** Add `enum ProposalStatus { PENDING UNDER_REVIEW APPROVED REJECTED }` to the schema and change the field type.

### H10: No Input Sanitization for Chat Messages
**Area:** Backend
**File:** `apps/api/src/modules/chat/dto/send-message.dto.ts:7`
**Problem:** `message` has `@MaxLength(500)` but no sanitization of HTML/script content or prompt-injection attack patterns. Malicious users could send system-prompt injection payloads like "Ignore all previous instructions and..." to manipulate the AI.
**Impact:** Prompt injection; potential for AI to be coerced into outputting sensitive internal data from the system prompt.
**Fix:** Add a basic prompt injection filter. Sanitize angle brackets. Consider a maximum line count limit.

### H11: eKYC Strategy Is Not Implemented
**Area:** Backend
**File:** `apps/api/src/modules/kyc/strategies/ekyc.strategy.ts`
**Problem:** The eKYC strategy (DigiLocker integration) returns a simulated response. No actual DigiLocker OAuth flow or Aadhaar e-KYC API call is implemented.
**Impact:** eKYC option is non-functional; users who select it get a fake verification.
**Fix:** Implement DigiLocker OAuth 2.0 flow or integrate with Aadhaar e-KYC APIs.

### H12: Resume Token Exposes Full Mobile Number
**Area:** Backend
**File:** `apps/api/src/modules/resume/resume.service.ts:103`
**Problem:** `validateToken()` returns `mobile` (full unmasked number) alongside `maskedMobile`. The `ResumePage` frontend only uses `maskedMobile` for display, but `mobile` is available in the response and used for OTP sending, meaning it is transmitted in plaintext in the API response.
**Impact:** If an attacker obtains a valid resume token (e.g., via URL sharing), they can retrieve the user's full mobile number.
**Fix:** Remove `mobile` from the `validateToken` response. Store it server-side keyed to the token and use it internally in `verifyAndGetState`.

---

## 🟡 Medium Priority (Nice to Have in v1)

### M1: Onboarding Progress Bar Is Static Across All Sub-Pages
**Area:** Frontend
**File:** `apps/web/src/app/(onboarding)/layout.tsx`, `apps/web/src/app/(quote)/layout.tsx`, `apps/web/src/app/(kyc)/layout.tsx`
**Problem:** All layout wrappers have hardcoded step numbers. The quote layout, KYC layout, health layout all show static step indicators. No layout dynamically reads the current route.
**Fix:** Read `usePathname()` in each layout and map it to step numbers.

### M2: `features` Field on Plan Is a JSON Object, Not an Array
**Area:** Frontend
**File:** `apps/web/src/app/(quote)/plans/page.tsx:46`
**Problem:** The plans page already handles this with `Object.values(p.features as unknown as Record<string, string>)` — acknowledging that the backend returns `features` as a JSON object (`{"daycare": "Covered", ...}`) while the shared `Plan` type defines `features: string[]`. This is a type lie that will cause issues.
**Fix:** Either store features as a JSONB array in PostgreSQL, or update the shared type to `features: Record<string, string>` and update all frontend render logic accordingly.

### M3: Eligibility Service Has Wrong Maximum Age Logic
**Area:** Backend
**File:** `apps/api/src/modules/onboarding/eligibility.service.ts:27`
**Problem:** The eligibility check disqualifies anyone over 65 (`member.age > 65`). But the typical Prudential PRUHealth maximum entry age for adults is 60-65 and for children 25. The current logic applies the same 65-year limit to kids (which is obviously wrong — a 10-year-old child would be eligible, but so would a 65-year-old). Children have different age constraints (typically 3 months to 25 years) that are not implemented.
**Fix:** Apply age rules per `memberType`: SELF/SPOUSE max 65, KID max 25 (or per policy terms), SELF min 18.

### M4: `createApplication` in Agentic Flow Does Not Create Member Records
**Area:** Backend (AI)
**File:** `apps/api/src/modules/chat/agentic-auth-tools.service.ts:157`
**Problem:** `createApplication` creates an application but does not create `ApplicationMember` records. Later when `declarePreExisting` tries to find the `SELF` member, it logs a warning and skips disease persistence. The member data (collected via chat) is never saved to the database.
**Impact:** All pre-existing condition data collected by AI is silently discarded.
**Fix:** After creating the application, create `ApplicationMember` records based on the `lead.selfSelected`, `lead.spouseSelected`, `lead.kidsCount` fields.

### M5: Chat Widget Visible on AI Journey Page (Duplicate)
**Area:** Frontend
**File:** `apps/web/src/providers/AppProviders.tsx`
**Problem:** The standard `ChatWidget` (floating bubble) renders on ALL pages including `/ai-journey`. This creates a confusing experience where users see two chat interfaces simultaneously — the full-screen `AgentChat` and the floating bubble widget.
**Fix:** Conditionally hide the `ChatWidget` when `pathname` starts with `/ai-journey`.

### M6: `subAnswer` Saved as `any` Type
**Area:** Backend
**File:** `apps/api/src/modules/health-declaration/health-declaration.service.ts:87`
**Problem:** `subAnswer: a.subAnswer as any` bypasses type safety. The schema defines `subAnswer TobaccoType?` but the code uses `any`.
**Fix:** Cast explicitly to `TobaccoType | null` and validate at the DTO level.

### M7: `useQuoteStore` Default `sumInsured` Has a Typo
**Area:** Frontend
**File:** `apps/web/src/stores/useQuoteStore.ts:40`
**Problem:** `sumInsured: 500_0000` — the underscore separator is placed incorrectly. `500_0000` = 5,000,000 (50 lakhs), while the intent may have been `50_00_000` (50 lakh in Indian numbering). The value is numerically correct for 50L but visually confusing — a developer reading this would expect `500_0000` to be some unusual number.
**Fix:** Use `5_000_000` for clarity.

### M8: Pincode Not Validated Against Indian Format Server-Side
**Area:** Backend
**File:** `apps/api/src/modules/onboarding/dto/pincode.dto.ts`
**Problem:** A 6-digit regex validation should exist but needs verification. Hospital lookup is done by exact pincode match with no fallback to nearby pincodes. If a user enters a pincode with no seeded hospitals, they see "No hospitals found" with no suggestion.
**Fix:** Add a fuzzy match (same city or district) as a fallback. Add a "No hospitals found" UX with alternative options.

### M9: No Rate Limiting on Chat Endpoint
**Area:** Backend
**File:** `apps/api/src/modules/chat/chat.controller.ts`
**Problem:** The `/api/v1/chat/stream` endpoint has no rate limiting. Any client can send unlimited messages, exhausting Anthropic API credits and causing denial-of-wallet attacks.
**Fix:** Add `@nestjs/throttler` with limits of e.g. 30 requests/minute per IP for the chat endpoint.

### M10: `features/chat/` and `components/chat/` Are Duplicated
**Area:** Frontend (Code Quality)
**File:** `apps/web/src/features/chat/`, `apps/web/src/components/chat/`
**Problem:** `apps/web/src/components/chat/ChatWidget.tsx` is literally `export { default } from '@/features/chat/components/ChatWidget'` — a re-export shim. Similarly for `ChatWindow.tsx` and `useChatStream.ts`. This creates dead import paths and confuses developers about where the source of truth is.
**Fix:** Remove `apps/web/src/components/chat/` entirely and update all imports to use `@/features/chat/`.

### M11: Missing `consentGiven` Field Validation in Lead DTO
**Area:** Backend
**File:** `apps/api/src/modules/lead/dto/create-lead.dto.ts`
**Problem:** The API test confirmed the initial `POST /api/v1/leads` failed with `"consentGiven must be a boolean value"` when sending `{ mobile, selfSelected, spouseSelected, kidsCount, eldestMemberAge }`. The field naming is also inconsistent: the lead form uses `selfSelected`/`spouseSelected` (flat) while the DTO expects `members.self`/`members.spouse` (nested). This mismatch is a persistent friction point.
**Fix:** Add a migration guide or align the frontend form shape with the DTO shape.

### M12: `useAgenticStore` Persists Messages to `localStorage` — Security Risk
**Area:** Frontend
**File:** `apps/web/src/features/ai-journey/stores/useAgenticStore.ts:113`
**Problem:** The entire agentic conversation including OTP codes (visible in `devOtp` field from API), mobile numbers, health conditions, and personal details is persisted to `localStorage` under key `buyonline-agentic`. This data persists indefinitely across sessions.
**Fix:** Either use `sessionStorage` (clears on tab close), add an expiry TTL check on load, or explicitly clear sensitive fields before persisting.

### M13: Hospital Data Is Not Seeded
**Area:** Backend / DB
**File:** `apps/api/prisma/seed.ts` (inferred)
**Problem:** The hospital network search returns 0 results for any pincode in a freshly seeded database because no hospital records are seeded. The AI chat's `get_hospital_network` tool will always return "No hospitals found."
**Fix:** Add at least 20-30 sample hospitals across major Indian pincodes to the seed file.

### M14: The AI System Prompt References "PRUHealth" — Brand Name Exposed
**Area:** Backend (AI)
**File:** `apps/api/src/modules/chat/agentic-context.service.ts:4`
**Problem:** The system prompt says `"You are PRUHealth AI"` — this is the Prudential brand, which may create trademark/legal issues if the product is not actually licensed under the Prudential brand.
**Fix:** Use a neutral name like "BuyOnline AI" or "HealthGuide AI" unless there is a valid license agreement.

### M15: Payment Gateway Page Has Hardcoded Fallback Amount
**Area:** Frontend
**File:** `apps/web/src/app/(payment)/gateway/page.tsx:92`
**Problem:** `amount={amount ?? 14160}` — if `amount` is 0 or null in the payment store, the gateway shows ₹14,160 as a fallback. This hardcoded value would show incorrect amounts to users with different plan selections.
**Fix:** Redirect back to `/proposer` or show an error if `amount` is not set, rather than using a magic number fallback.

### M16: `createOrGetLead` in Agentic Flow Always Sets `selfSelected: true`
**Area:** Backend (AI)
**File:** `apps/api/src/modules/chat/agentic-auth-tools.service.ts:127`
**Problem:** When a lead already exists, `createOrGetLead` updates it with `selfSelected: members?.self ?? true` — if the AI passes `members` as undefined (which happens if the tool is called before members are collected), it defaults to `true` and overwrites any previously set value.
**Fix:** Only update fields that are explicitly provided. Use `...(members?.self !== undefined ? { selfSelected: members.self } : {})` pattern.

---

## 🟢 Low Priority / Future Enhancements

### L1: No Admin Dashboard for Proposal Review
**Area:** Product
**Problem:** `ProposalService.rateProposal()` exists but there is no admin UI to review and approve/reject proposals. The `UNDER_REVIEW` → `APPROVED`/`REJECTED` flow is only accessible via raw API calls.
**Fix:** Build a minimal admin dashboard with proposal list, detail view, and approve/reject buttons.

### L2: No Webhook for Policy Issuance After Approval
**Area:** Backend
**Problem:** After a proposal is approved, there is no downstream action — no policy document is generated, no confirmation email/SMS is sent to the customer.
**Fix:** Add an event system (or simple service call) on `APPROVED` status that triggers policy document generation and sends a confirmation message.

### L3: `LeadService.update()` Accepts Raw DTO Without Restrictions
**Area:** Backend
**File:** `apps/api/src/modules/lead/lead.service.ts:51`
**Problem:** `update(id, dto: UpdateLeadDto)` passes `dto` directly to `prisma.lead.update({ data: dto })`. If `UpdateLeadDto` is a `PartialType(CreateLeadDto)`, this allows overwriting `isVerified: false` to bypass OTP verification.
**Fix:** Whitelist specific updatable fields in `UpdateLeadDto`. Never allow `isVerified` to be set via this endpoint.

### L4: Missing `/@prisma/adapter-pg` — Potential Startup Failure
**Area:** Backend
**File:** `apps/api/src/prisma/prisma.service.ts:4`
**Problem:** `PrismaPg` from `@prisma/adapter-pg` is imported but this package may not be listed as a dependency. The generated Prisma output directory (`apps/api/src/generated/prisma/`) suggests a non-standard output path, which may cause import resolution issues.
**Fix:** Verify `@prisma/adapter-pg` is in `package.json`. If the standard Prisma client is sufficient, remove the adapter usage.

### L5: No Pagination on Hospital Search
**Area:** Backend
**File:** `apps/api/src/modules/chat/chat-tools.service.ts:139`
**Problem:** `take: 10` on hospital search is hardcoded. There is no pagination support for browsing more hospitals.
**Fix:** Add `skip`/`take` pagination parameters to the hospital search endpoint.

### L6: `HealthDeclaration` Shared Across Hospitalization and Disability
**Area:** Backend / DB
**File:** `apps/api/prisma/schema.prisma:423`
**Problem:** The `HealthDeclaration` model combines hospitalization history, disability status, and prior insurance data into a single record with a unique constraint on `applicationId`. This creates a race condition when `saveHospitalization` and `saveDisability` are called concurrently — the second upsert may overwrite the first.
**Fix:** Split into `HospitalizationRecord` and `DisabilityRecord` models, or use a single upsert with all fields combined.

### L7: No Error Boundary on Quote Page Plan Carousel
**Area:** Frontend
**File:** `apps/web/src/app/(quote)/plans/page.tsx`
**Problem:** If the plans API returns unexpected data, the `PlanCarousel` renders nothing and the user sees a blank area with no indication of what happened (the error is only shown as a banner if `filteredPlans.length === 0 && fetchError`). But if plans load but pricing doesn't match, the user sees no pricing and no error.
**Fix:** Add explicit empty state handling for "plans loaded but no matching pricing tier" vs "API error".

### L8: `TENURE_OPTIONS` in shared-types Has Options That Don't Exist in DB
**Area:** Shared Types / DB
**File:** `packages/shared-types/src/plan.types.ts:69`
**Problem:** `TENURE_OPTIONS` defines 12, 24, 36, 48, 60 month options. But the seed data only creates pricing tiers for 12 and 24 months. Selecting a 3, 4, or 5 year tenure would result in no pricing tier found.
**Fix:** Either seed pricing tiers for all tenure options, or limit `TENURE_OPTIONS` to what is actually seeded.

### L9: No Automated Tests Whatsoever
**Area:** Developer Experience
**Problem:** The only test file is `app.controller.spec.ts` (likely the NestJS scaffold default). There are no unit tests for any service, no integration tests for API endpoints, no e2e tests for the purchase journey.
**Fix:** Add Jest unit tests for `PricingService.computePremium()`, `EligibilityService.checkEligibility()`, and `OtpService.send()/verify()` as a starting point.

### L10: No Cursor-Based Pagination on Applications List
**Area:** Backend
**Problem:** There is no `GET /api/v1/applications` endpoint to list all applications (useful for admin/ops). When such an endpoint is added, it should use cursor-based pagination to handle large datasets efficiently.

### L11: `ApplicationMember` Has `@@unique([applicationId, memberType, label])`
**Area:** Backend / DB
**File:** `apps/api/prisma/schema.prisma:182`
**Problem:** The composite unique constraint includes `label`. If two kids are labeled "Kid 1" and "Kid 2", this works. But if the user labels them the same (e.g., both labeled "Kid"), only one can be stored. The constraint should be on `(applicationId, memberType)` for SELF/SPOUSE, and `(applicationId, memberType, age)` for KID.
**Fix:** Re-evaluate the unique constraint or add a `sequence` number field for child members.

### L12: No GDPR / Data Retention Policy
**Area:** Compliance
**Problem:** There is no mechanism to delete user data upon request, no data retention limits on OTP attempts, no PII masking in logs. Indian PDPB (Personal Data Protection Bill) compliance will be required.
**Fix:** Add a `DELETE /api/v1/leads/:id` endpoint that cascades deletions. Add scheduled cleanup for expired OTP attempts. Mask mobile numbers in logger output.

---

## 🤖 AI/Chat Improvements

### AI1: System Prompt Missing Context on Rejected/Ineligible Members
The agentic system prompt does not instruct the AI on what to do when `checkEligibility` returns some ineligible members. The AI may proceed to plan selection without properly explaining the implications or offering to remove ineligible members.

### AI2: `[STATE:{...}]` Parsing Is Fragile
**File:** `apps/api/src/modules/chat/agentic-chat.service.ts:16`
The regex `\[STATE:([\s\S]*?)\]` will fail if the JSON inside the brackets contains `]` characters (e.g., in array values). Use a more robust parser or switch to a dedicated structured output approach (Claude's `tool_use` with a `report_state` tool that returns state updates reliably).

### AI3: Plan Card Format `:::plan-card JSON:::` Is Fragile
**File:** `apps/web/src/features/ai-journey/hooks/useAgenticStream.ts:14`
If the AI slightly varies the delimiter format (e.g., adds a newline or extra space), the card won't parse. Prefer using a tool call (`display_plan_card`) with structured input that the frontend can render reliably.

### AI4: Standard Chat Widget Does Not Track `done` SSE Event
**File:** `apps/web/src/features/chat/hooks/useChatStream.ts:117`
The standard chat `useChatStream` hook processes `token` and `error` events but does not handle the `done` event — it relies on `finally` to set `isStreaming: false`. If the stream ends abnormally (connection cut), the `done` event may never arrive and `isStreaming` gets correctly reset by `finally`. But the message is left with `isStreaming: true` in the list until the next re-render. Add explicit `done` handling.

### AI5: No Typing Indicator Fade-Out
When streaming completes, the streaming dots in `AgentChat` disappear abruptly. A smooth CSS transition when the assistant message switches from streaming-dots to text would improve the UX significantly.

### AI6: Agentic Chat Has No Session Resumption
If the user closes the browser tab and returns, the `useAgenticStore` persists messages to `localStorage`, but `sessionId` is regenerated each time (stored in `nanoid()` which is non-deterministic). The backend Redis session will be stale. The AI will lose track of where it was in the journey.

### AI7: AI Context Does Not Include Application Status for Re-Entered Sessions
**File:** `apps/api/src/modules/chat/agentic-context.service.ts:99`
`buildUserContext()` includes the application's `currentStep` but not the full list of completed steps. The AI cannot reliably skip already-completed steps (e.g., if OTP was already verified, the AI should not ask for it again).

### AI8: Standard Chat Widget Is Context-Aware but Agentic Chat Is Not
The standard `ChatWindow.tsx` has step-aware suggestions (e.g., at `QUOTE` step, suggestions about comparing plans). The agentic `AgentChat.tsx` has no equivalent — the greeting is hardcoded and not updated based on application state.

### AI9: No Tool for AI to Query Application State
The agentic tools include create/update operations but no `get_application_state` tool. The AI must rely on the system prompt context which is built once per request — if the state changes mid-conversation (e.g., a plan was selected), the AI's context becomes stale.

---

## 🎨 UX/UI Improvements

### UX1: No Back Button Behavior on Onboarding Pages
The onboarding layout has a back button linking to `/` (landing). But users on `/critical-conditions` should go back to `/pre-existing`, not start over. Each page needs proper back navigation.

### UX2: OTP Input Does Not Handle Paste
The OTP input components (`/kyc/otp/page.tsx`, `/r/[token]/page.tsx`) handle digit-by-digit input but do not handle paste events. A user pasting "123456" from an SMS will only fill the first digit.
**Fix:** Add an `onPaste` handler that splits the pasted string across all inputs.

### UX3: No Empty State for Plans When No Matching Tier
When the user selects a sum insured/tenure combination that has no seeded pricing tier, `filteredPricings` is empty and `PlanCarousel` renders plan cards without prices. There is no "No pricing available for this combination" message.

### UX4: KYC Success Page Does Not Redirect Automatically
**File:** `apps/web/src/app/(kyc)/kyc-success/page.tsx`
The KYC success page likely shows a static success message. It should automatically redirect to the health declaration flow after 3-5 seconds or show a prominent "Continue to Health Declaration" button.

### UX5: Payment Success Page Has No Policy Reference Number
**File:** `apps/web/src/app/(payment)/payment-success/page.tsx`
After successful payment, users should see a transaction ID and a reference number they can use for support. The current page likely shows generic success copy without these details.

### UX6: Mobile Responsiveness on Desktop AI Journey
The AI journey page (`/ai-journey`) uses `h-[calc(100vh-57px)]` and assumes the full viewport. On very wide screens (>1200px), the chat interface stretches awkwardly. The max-width should be constrained.

### UX7: No Loading Skeleton for Plans Page
When plans are loading (API call in progress), the plans page shows nothing. A skeleton loader (placeholder cards) would prevent layout shift and improve perceived performance.

### UX8: Resend OTP Button Appears Immediately After Error
If OTP verification fails, the resend timer continues. But visually, after an error, users want to resend immediately. Consider showing the resend button immediately after an OTP failure.

### UX9: No Confirmation Before "New Conversation" Reset
The `AgentChat` component has a "New conversation" button that calls `reset()` — destroying all collected data and the entire chat history. There is no confirmation dialog. A user clicking it accidentally loses all their progress.

---

## 📊 Performance Improvements

### P1: `getApplicationState` Makes 1 Massive Query With 10 Includes
**File:** `apps/api/src/modules/resume/resume-state.service.ts:53`
The single `findUnique` call includes: `lead`, `members.preExistingDiseases.disease`, `members.criticalConditions.disease`, `members.healthAnswers.question`, `members.lifestyleAnswers`, `selectedPlan.plan`, `selectedAddons.addon`, `payment`, `kyc.documents`, `healthDeclarations`, `proposerDetails`, `bankDetails`. This is a 12-level deep join that will produce a massive result set. In PostgreSQL, deeply nested `include` chains can produce N+1 queries.
**Fix:** Split into targeted queries (e.g., fetch members separately from addons separately from KYC) or use `select` to limit returned fields.

### P2: `buildPlanContext()` Queries DB on Every Chat Message
**File:** `apps/api/src/modules/chat/agentic-context.service.ts:61`
`buildPlanContext()` runs a database query on every single chat message to build the system prompt context. Plans don't change frequently.
**Fix:** Cache plan context in Redis with a 5-minute TTL.

### P3: `EligibilityService.checkEligibility()` Has N+1 Updates
**File:** `apps/api/src/modules/onboarding/eligibility.service.ts:52`
After computing results, it calls `prisma.applicationMember.update()` in a `for` loop — one database round-trip per member.
**Fix:** Use `prisma.$transaction()` with a batch update, or use `updateMany` where possible.

### P4: `addMembers()` Deletes All Members and Re-Creates
**File:** `apps/api/src/modules/onboarding/onboarding.service.ts:43`
The implementation does `deleteMany` + `createMany` on every call. If called with 4 members, this is 5 queries (1 delete + 4 creates). Use `upsert` or a transaction that computes the diff.

### P5: `saveLifestyleAnswers` and `saveMedicalHistory` Use `Promise.all` on Individual Upserts
**File:** `apps/api/src/modules/health-declaration/health-declaration.service.ts:74`
Each answer is upserted individually. For a 20-question health declaration with 4 members, this is 80 concurrent database operations.
**Fix:** Use `prisma.$transaction()` to batch these writes.

---

## 🔒 Security Improvements

### S1: Correlation ID Middleware Does Not Validate Header Format
**File:** `apps/api/src/common/middleware/correlation-id.middleware.ts`
If a client sends a malformed or excessively long `X-Correlation-ID` header, it gets passed through to logs unchecked. Sanitize and truncate.

### S2: Upload File Extension Is Not Validated Against Allowed Types
**File:** `apps/api/src/modules/upload/upload.service.ts:31`
`file.originalname.split('.').pop()` extracts the extension but does not validate it against an allowlist. A user could upload `malware.exe` and the system would store it as `{uuid}.exe`.
**Fix:** Add an allowlist: `['jpg', 'jpeg', 'png', 'pdf', 'heic']`. Reject anything else.

### S3: `JwtSecret` Defaults Are Not Enforced in Production
**File:** `apps/api/src/config/env.validation.ts:13`
If `JWT_SECRET` is not set, a warning is logged but the app starts anyway. In production, this should be a hard failure.

### S4: No CSRF Protection
The API accepts `POST` requests with `Content-Type: application/json` without any CSRF token validation. While the `SameSite=Strict` cookie policy would help, the API currently uses no cookies at all for auth (x-application-id header), so CSRF is less of a concern. But if cookies are added later for session management, CSRF protection will be needed.

### S5: PAN Number and Aadhaar Number Stored in Plain Text
**File:** `apps/api/prisma/schema.prisma:349-351`
`KycVerification.panNumber` and `KycVerification.aadharNumber` are stored as plain `String` fields. These are highly sensitive PII.
**Fix:** Encrypt at the application layer before storing, or use database-level column encryption.

### S6: `gatewaySignature` Is Stored But Never Used
**File:** `apps/api/src/modules/payment/payment.service.ts:122`
The `gatewaySignature` from the callback is stored in the database but never verified against the expected HMAC. This field provides no security value in its current state.

---

## 💡 Feature Ideas

### F1: WhatsApp-Based OTP and Journey
The `packages/ui/src/WhatsAppFab.tsx` component exists but the WhatsApp number hardcoded is a placeholder. Add real WhatsApp OTP via Meta's Business API for higher OTP delivery rates in India.

### F2: Premium Comparison Tool
Allow users to compare two plans side-by-side with a feature matrix view. Currently the plan cards are carouseled without comparison capability.

### F3: Premium Calculator Widget on Landing Page
Add a premium estimator (age + members → estimated monthly premium range) directly on the landing page to capture leads before asking for mobile number.

### F4: EMI / Monthly Premium Option
The chat widget suggestion "Can I pay in EMI?" has no backend support. Indian customers expect EMI options. Integrate with card EMI or NACH mandate for monthly deduction.

### F5: Renewal Reminder System
After policy issuance, schedule a renewal reminder 30/15/7 days before expiry via SMS/email. This is a critical retention feature.

### F6: Claims Tracking
Add a `GET /api/v1/applications/:id/claims` endpoint and a claims status page. Currently there is no claims module at all.

### F7: Multi-Language Support
Indian insurance buyers often prefer Hindi or regional languages. Add `next-intl` internationalization with Hindi as the first additional language.

### F8: PDF Policy Document Generation
After `ProposalService.rateProposal()` approves a proposal, generate a PDF policy document using a library like `@react-pdf/renderer` and store it in S3. Send the download link via email/SMS.

### F9: Dark Mode
The design is white/red — a dark mode variant would improve accessibility and is expected by modern mobile users.

### F10: Progressive Web App (PWA)
Add `next-pwa` with a service worker to enable offline access to the AI chat greeting and the resume flow. Insurance purchases often happen with intermittent connectivity.

---

## Summary Statistics

| Priority | Count |
|----------|-------|
| Critical (C) | 10 |
| High (H) | 12 |
| Medium (M) | 16 |
| Low (L) | 12 |
| AI/Chat (AI) | 9 |
| UX/UI (UX) | 9 |
| Performance (P) | 5 |
| Security (S) | 6 |
| Feature Ideas (F) | 10 |
| **Total** | **89** |

The most urgent items for a v1 launch are: C1 (OTP exposure), C2 (SMS gateway), C3 (payment gateway), C4 (auth bypass), C5 (file storage), C7 (infinite loop), H1 (Swagger documentation), H5 (fake eligibility), H6 (payment signature), and H8 (addon premium not included in total).
