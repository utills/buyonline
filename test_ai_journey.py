#!/usr/bin/env python3
"""
BuyOnline — AI Journey Browser Test (Playwright)
Tests the full AI/chat-driven journey:
  Homepage → AI Chat → greeting → members → age → mobile → OTP → pincode
  → pre-existing → plan selection → add-ons → handoff → /gateway

Usage:
  python3 test_ai_journey.py              # headless
  python3 test_ai_journey.py --headed     # visible browser
  python3 test_ai_journey.py --slow 400   # slow motion (ms)
"""

import sys
import re
import time
import argparse
import json
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright, Page, TimeoutError as PWTimeout

# ─── Config ───────────────────────────────────────────────────────────────────

WEB = "http://localhost:3000"
OTP = "123456"
MOBILE = f"80000{int(time.time()) % 100000:05d}"  # unique per run
SCREENSHOT_DIR = Path("test_screenshots_ai")
T = 15_000   # default wait ms
STREAM_WAIT = 12_000  # wait for AI to finish streaming

parser = argparse.ArgumentParser()
parser.add_argument("--headed", action="store_true")
parser.add_argument("--slow", type=int, default=0)
args = parser.parse_args()

# ─── Helpers ──────────────────────────────────────────────────────────────────

PASS  = "\033[92m✓\033[0m"
FAIL  = "\033[91m✗\033[0m"
INFO  = "\033[94m→\033[0m"
BOLD  = "\033[1m"
RESET = "\033[0m"

results: list[dict] = []
SCREENSHOT_DIR.mkdir(exist_ok=True)
step_n = [0]


def shot(page: Page, name: str) -> str:
    path = SCREENSHOT_DIR / f"{step_n[0]:02d}_{name}.png"
    step_n[0] += 1
    try:
        page.screenshot(path=str(path))
    except Exception:
        pass
    return str(path)


def check(label: str, ok: bool, detail: str = "", img: str = "") -> bool:
    icon = PASS if ok else FAIL
    suffix = f"  [{detail}]" if detail else ""
    istr  = f"  📸 {img}" if img else ""
    print(f"  {icon} {label}{suffix}{istr}")
    results.append({"label": label, "ok": ok, "detail": detail})
    return ok


def section(title: str):
    print(f"\n{BOLD}── {title} {'─' * (52 - len(title))}{RESET}")


def wait_url(page: Page, pattern: str, ms: int = T) -> bool:
    try:
        page.wait_for_url(re.compile(pattern), timeout=ms)
        return True
    except PWTimeout:
        return False


def wait_text(page: Page, text: str, ms: int = T) -> bool:
    try:
        page.get_by_text(text, exact=False).first.wait_for(timeout=ms)
        return True
    except PWTimeout:
        return False


def wait_no_stream(page: Page, ms: int = STREAM_WAIT) -> bool:
    """Wait until the streaming dots disappear (AI finished responding)."""
    try:
        # Wait for streaming indicator to disappear
        page.wait_for_selector("[aria-label='Loading response']", state="hidden", timeout=ms)
        return True
    except PWTimeout:
        return True  # If it never appeared, that's fine too


def send_chat(page: Page, message: str) -> bool:
    """Type message into chat textarea and press Enter."""
    try:
        ta = page.locator("textarea[aria-label='Chat input']")
        ta.wait_for(timeout=T)
        ta.fill(message)
        ta.press("Enter")
        return True
    except Exception as e:
        check(f"Send '{message}'", False, str(e)[:80])
        return False


def click_chip(page: Page, chip_text: str) -> bool:
    """Click a quick-reply chip button."""
    try:
        page.get_by_role("button", name=re.compile(re.escape(chip_text), re.IGNORECASE)).first.click()
        return True
    except Exception:
        # Fallback: find button containing the text
        try:
            btns = page.locator("button").all()
            for btn in btns:
                try:
                    if chip_text.lower() in (btn.inner_text() or "").lower():
                        btn.click()
                        return True
                except Exception:
                    pass
        except Exception:
            pass
    return False


def wait_ai_done(page: Page) -> str:
    """Wait for streaming to finish, return last AI message text."""
    wait_no_stream(page, STREAM_WAIT)
    time.sleep(0.5)  # small buffer after stream ends
    try:
        msgs = page.locator("[class*='message'], [class*='chat']").all()
        if msgs:
            return msgs[-1].inner_text() or ""
    except Exception:
        pass
    return page.inner_text("body")[-500:]


# ─── Journey Steps ────────────────────────────────────────────────────────────

def step_homepage(page: Page) -> bool:
    section("1 · Homepage → AI Journey")
    page.goto(WEB, wait_until="networkidle")
    img = shot(page, "homepage")

    check("Homepage loaded", page.get_by_text("Health Insurance").count() > 0, img=img)

    # Click "Chat with AI" button (AI journey option)
    try:
        page.get_by_role("button", name=re.compile("Chat with AI|AI|Recommended", re.IGNORECASE)).first.click()
        check("'Chat with AI' clicked", True)
    except Exception as e:
        check("'Chat with AI' button found", False, str(e)[:80])
        return False

    time.sleep(0.5)
    return True


def step_greeting(page: Page) -> bool:
    section("2 · Greeting")

    at_ai = wait_url(page, r"/ai-journey", ms=8_000)
    img = shot(page, "ai_journey_page")
    check("Navigated to /ai-journey", at_ai, f"url={page.url}", img=img)

    if not at_ai:
        return False

    # Chat input should be present
    try:
        page.locator("textarea[aria-label='Chat input']").wait_for(timeout=T)
        check("Chat input textarea found", True)
    except PWTimeout:
        check("Chat input textarea found", False)
        return False

    # Send greeting — triggers welcome message
    ok = send_chat(page, "Hi")
    check("Greeting 'Hi' sent", ok)

    # Wait for AI welcome message
    wait_ai_done(page)
    body = page.inner_text("body")
    has_welcome = any(k in body for k in ["Welcome", "guide", "cover", "health", "Health"])
    img = shot(page, "greeting_response")
    check("AI welcome message received", has_welcome, img=img)

    # Quick-reply chips for members should appear
    time.sleep(0.5)
    has_chips = (
        page.get_by_role("button", name="Self only").count() > 0 or
        page.get_by_text("Self only").count() > 0
    )
    check("Member quick-reply chips visible", has_chips)
    return True


def step_members(page: Page) -> bool:
    section("3 · Members Selection")

    # Click "Self only" chip
    ok = click_chip(page, "Self only")
    check("'Self only' chip clicked", ok)

    wait_ai_done(page)
    body = page.inner_text("body")
    has_age_prompt = any(k in body for k in ["age", "Age", "eldest", "years"])
    img = shot(page, "members_response")
    check("AI asks for age", has_age_prompt, img=img)
    return ok


def step_age(page: Page) -> bool:
    section("4 · Age")

    ok = send_chat(page, "35")
    check("Age '35' sent", ok)

    wait_ai_done(page)
    body = page.inner_text("body")
    has_mobile_prompt = any(k in body for k in ["mobile", "Mobile", "number", "OTP", "phone"])
    img = shot(page, "age_response")
    check("AI asks for mobile number", has_mobile_prompt, img=img)
    return ok


def step_mobile(page: Page) -> bool:
    section("5 · Mobile Number")

    ok = send_chat(page, MOBILE)
    check(f"Mobile '{MOBILE}' sent", ok)

    wait_ai_done(page)
    body = page.inner_text("body")
    has_otp_prompt = any(k in body for k in ["OTP", "otp", "code", "sent", "verify", "Verify"])
    img = shot(page, "mobile_response")
    check("AI confirms OTP sent", has_otp_prompt, img=img)
    return ok


def step_otp(page: Page) -> bool:
    section("6 · OTP Verification")

    # Check for OTP widget or just send OTP as text
    time.sleep(0.5)
    body = page.inner_text("body")

    # Try OTP chat widget first (6 individual inputs)
    otp_inputs = page.locator("input[maxlength='1']").all()
    if len(otp_inputs) >= 6:
        for i, digit in enumerate(OTP):
            otp_inputs[i].fill(digit)
            time.sleep(0.05)
        check(f"OTP entered in widget ({OTP})", True)
        # Widget auto-submits on last digit
        time.sleep(1)
    else:
        # Send OTP as chat message
        ok = send_chat(page, OTP)
        check(f"OTP '{OTP}' sent as message", ok)

    wait_ai_done(page)
    body = page.inner_text("body")
    verified = any(k in body for k in ["verified", "✅", "Verified", "pincode", "Pincode"])
    img = shot(page, "otp_response")
    check("OTP verified — AI asks for pincode", verified, img=img)
    return True


def step_pincode(page: Page) -> bool:
    section("7 · Pincode")

    ok = send_chat(page, "400001")
    check("Pincode '400001' sent", ok)

    wait_ai_done(page)
    body = page.inner_text("body")
    has_hospital = any(k in body for k in ["hospital", "Hospital", "network", "pre-existing", "condition"])
    img = shot(page, "pincode_response")
    check("AI shows hospital count / asks pre-existing", has_hospital, img=img)
    return ok


def step_pre_existing(page: Page) -> bool:
    section("8 · Pre-existing Conditions")

    ok = send_chat(page, "None")
    check("Pre-existing 'None' sent", ok)

    wait_ai_done(page)
    body = page.inner_text("body")
    has_plans = any(k in body for k in ["PHI", "plan", "Plan", "₹", "premium", "Premium"])
    img = shot(page, "pre_existing_response")
    check("AI shows plan recommendations with PHI names", has_plans, img=img)

    # Check real XL plan names
    has_phi = "PHI" in body
    check("PHI plan names visible (real XL data)", has_phi)

    # Check realistic premiums (₹4,000–₹15,000 range)
    has_real_premium = bool(re.search(r"₹[4-9],[0-9]{3}", body) or re.search(r"₹1[0-5],[0-9]{3}", body))
    check("Premiums in realistic range (₹4k–₹15k)", has_real_premium)

    return ok


def step_plan_selection(page: Page) -> bool:
    section("9 · Plan Selection")

    # Select plan 2 (PHI Flagship 1)
    ok = send_chat(page, "2")
    check("Plan '2' selected (PHI Flagship 1)", ok)

    wait_ai_done(page)
    body = page.inner_text("body")
    has_addon_prompt = any(k in body for k in ["add-on", "addon", "rider", "Skip", "optional"])
    img = shot(page, "plan_selected_response")
    check("AI confirms plan + asks for add-ons", has_addon_prompt, img=img)

    # Verify plan name in response
    plan_confirmed = "PHI Flagship 1" in body or "Flagship" in body or "selected" in body
    check("Plan selection confirmed", plan_confirmed)
    return ok


def step_addons(page: Page) -> bool:
    section("10 · Add-ons")

    # Try chip first, then text
    if not click_chip(page, "Skip add-ons") and not click_chip(page, "No add-ons"):
        ok = send_chat(page, "Skip")
        check("'Skip' sent for add-ons", ok)
    else:
        check("Skip add-ons chip clicked", True)

    wait_ai_done(page)
    body = page.inner_text("body")
    img = shot(page, "addons_response")

    redirecting = any(k in body for k in ["Redirecting", "payment", "Payment", "ready", "🎉", "complete"])
    check("AI confirms completion + redirecting to payment", redirecting, img=img)
    return True


def step_gateway(page: Page) -> bool:
    section("11 · Handoff → Payment Gateway")

    # After handoff SSE event, frontend should redirect to /gateway
    at_gateway = wait_url(page, r"/gateway", ms=12_000)
    img = shot(page, "gateway_page")
    check("Redirected to /gateway after handoff", at_gateway, f"url={page.url}", img=img)

    if not at_gateway:
        # Maybe still on /ai-journey — check if handoff message appeared
        body = page.inner_text("body")
        handoff_msg = any(k in body for k in ["Redirecting", "gateway", "payment complete"])
        check("Handoff message visible on AI page", handoff_msg)
        return False

    body = page.inner_text("body")
    check("Payment amount shown on gateway", "₹" in body or bool(re.search(r"\d,\d{3}", body)))

    # Simulate payment success
    try:
        page.get_by_role("button", name=re.compile("Pay Now|Simulate|Pay|Proceed|Confirm", re.IGNORECASE)).first.click()
        check("Pay Now clicked (mocked)", True)
    except Exception as e:
        check("Pay Now button", False, str(e)[:60])

    time.sleep(2)
    img = shot(page, "after_payment")
    success = (
        wait_url(page, r"/payment-success", ms=6_000) or
        wait_text(page, "Thank you", ms=4_000) or
        wait_text(page, "Success", ms=3_000)
    )
    check("Payment success screen", success, f"url={page.url}", img=img)
    return at_gateway


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    start = datetime.now()
    print(f"\n{BOLD}BuyOnline — AI Journey Browser Test{RESET}")
    print(f"Started:     {start.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Mobile:      {MOBILE}  (OTP bypass: {OTP})")
    print(f"Browser:     {'headed' if args.headed else 'headless'}")
    print(f"Screenshots: {SCREENSHOT_DIR.resolve()}/")

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=not args.headed, slow_mo=args.slow)
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            locale="en-IN",
        )
        console_errors: list[str] = []
        page = ctx.new_page()
        page.on("console", lambda m: console_errors.append(f"[{m.type}] {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"[JS] {e}"))

        try:
            ok = step_homepage(page)
            if ok:
                ok = step_greeting(page)
            if ok:
                step_members(page)
                step_age(page)
                step_mobile(page)
                step_otp(page)
                step_pincode(page)
                step_pre_existing(page)
                step_plan_selection(page)
                step_addons(page)
                step_gateway(page)
        except Exception as ex:
            img = shot(page, "crash")
            check("Unexpected exception", False, str(ex)[:120], img=img)
        finally:
            shot(page, "final_state")
            browser.close()

    # ─── Report ───────────────────────────────────────────────────────────────
    elapsed = (datetime.now() - start).total_seconds()
    section("Results")

    passed = sum(1 for r in results if r["ok"])
    failed = sum(1 for r in results if not r["ok"])
    total  = len(results)
    pct    = int(passed / total * 100) if total else 0

    print(f"\n  Total:   {total} checks  ({elapsed:.1f}s)")
    print(f"  {PASS} Passed: {passed}")
    if failed:
        print(f"  {FAIL} Failed: {failed}")
        print(f"\n  Failed checks:")
        for r in results:
            if not r["ok"]:
                d = f"  ({r['detail']})" if r["detail"] else ""
                print(f"    {FAIL} {r['label']}{d}")

    if console_errors:
        unique = list(dict.fromkeys(console_errors))[:6]
        print(f"\n  Browser errors ({len(console_errors)}):")
        for e in unique:
            print(f"    ! {e[:120]}")

    print(f"\n  Score: {passed}/{total} ({pct}%)")
    print(f"  {'All checks passed! 🎉' if failed == 0 else 'Some checks failed.'}\n")

    report = {
        "timestamp": start.isoformat(),
        "journey": "ai",
        "mobile": MOBILE,
        "passed": passed, "failed": failed, "total": total, "score_pct": pct,
        "elapsed_s": round(elapsed, 1),
        "results": results,
        "console_errors": console_errors[:20],
    }
    with open("test_report_ai.json", "w") as f:
        json.dump(report, f, indent=2)
    print(f"  Report → test_report_ai.json\n")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
