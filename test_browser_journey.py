#!/usr/bin/env python3
"""
BuyOnline — Classic Journey Browser Test (Playwright)
Launches a real Chromium browser, walks through the full classic journey UI,
takes screenshots at every step, and reports pass/fail for each screen.

Payment is mocked — test stops after the gateway page loads.

Usage:
  python3 test_browser_journey.py              # headless
  python3 test_browser_journey.py --headed     # visible browser
  python3 test_browser_journey.py --slow 400   # slow motion (ms)
"""

import sys
import time
import re
import argparse
import json
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright, Page, TimeoutError as PWTimeout

# ─── Config ───────────────────────────────────────────────────────────────────

WEB = "http://localhost:3000"
OTP = "123456"
MOBILE = f"70000{int(time.time()) % 100000:05d}"  # unique per run
SCREENSHOT_DIR = Path("test_screenshots")
T = 12_000  # default timeout ms

parser = argparse.ArgumentParser()
parser.add_argument("--headed", action="store_true")
parser.add_argument("--slow", type=int, default=0)
args = parser.parse_args()

# ─── Helpers ──────────────────────────────────────────────────────────────────

PASS = "\033[92m✓\033[0m"
FAIL = "\033[91m✗\033[0m"
INFO = "\033[94m→\033[0m"
BOLD = "\033[1m"
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


def check(label: str, ok: bool, detail: str = "", img: str = ""):
    icon = PASS if ok else FAIL
    suffix = f"  [{detail}]" if detail else ""
    imgstr = f"  📸 {img}" if img else ""
    print(f"  {icon} {label}{suffix}{imgstr}")
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
        page.get_by_text(text).first.wait_for(timeout=ms)
        return True
    except PWTimeout:
        return False


def click_btn(page: Page, *labels: str) -> bool:
    """Try clicking a button matching any of the given text labels."""
    for label in labels:
        try:
            page.get_by_role("button", name=re.compile(label, re.IGNORECASE)).first.click()
            return True
        except Exception:
            pass
    return False


# ─── Steps ────────────────────────────────────────────────────────────────────

def step_homepage(page: Page) -> bool:
    section("1 · Homepage")
    page.goto(WEB, wait_until="networkidle")
    img = shot(page, "homepage")

    ok1 = check("Hero headline visible", page.get_by_text("Health Insurance").count() > 0, img=img)
    ok2 = check("Classic journey / form option visible",
                page.get_by_text("Classic").count() > 0 or
                page.get_by_text("Apply").count() > 0 or
                page.get_by_text("Forms").count() > 0)
    return ok1


def step_lead_form(page: Page) -> bool:
    section("2 · Lead Form (mobile + age + consent)")

    # Click "Self-Serve" to reveal the classic lead form (JourneyPicker)
    try:
        page.get_by_role("button", name=re.compile("Self.Serve|Classic|Forms", re.IGNORECASE)).first.click()
        time.sleep(0.5)
        check("Classic / Self-Serve option clicked", True)
    except Exception as e:
        check("Classic option clicked", False, str(e)[:80])
        return False

    # Age input
    try:
        page.locator("#age").fill("35")
        check("Age entered (35)", True)
    except Exception as e:
        check("Age input found", False, str(e)[:80])
        return False

    # Mobile input — id="mobile"
    try:
        page.locator("#mobile").fill(MOBILE)
        check(f"Mobile entered ({MOBILE})", True)
    except Exception as e:
        check("Mobile input found", False, str(e)[:80])
        return False

    # Consent checkbox
    try:
        page.locator("input[type='checkbox']").check()
        check("Consent checked", True)
    except Exception as e:
        check("Consent checkbox", False, str(e)[:80])

    img = shot(page, "lead_form_filled")

    # Submit — button text "Get the Best Offer"
    try:
        page.get_by_role("button", name="Get the Best Offer").click()
        check("Form submitted (Get the Best Offer)", True, img=img)
    except Exception as e:
        check("Submit button clicked", False, str(e)[:80], img=img)
        return False

    return True


def step_otp(page: Page) -> bool:
    section("3 · OTP Verification")

    # Should navigate to /otp-verify
    navigated = wait_url(page, r"/otp-verify", ms=10_000)
    img = shot(page, "otp_page")
    check("Navigated to /otp-verify", navigated, f"url={page.url}", img=img)

    if not navigated:
        return False

    # 6 individual digit inputs (maxLength=1, inputMode=numeric)
    try:
        inputs = page.locator("input[maxlength='1']").all()
        if len(inputs) < 6:
            check("6 OTP digit inputs found", False, f"found {len(inputs)}")
            return False

        for i, digit in enumerate(OTP):
            inputs[i].fill(digit)
            time.sleep(0.05)

        check(f"OTP digits entered ({OTP})", True)
        # Auto-submits on last digit — wait for navigation
        time.sleep(1.5)
    except Exception as e:
        check("OTP digits filled", False, str(e)[:80])
        return False

    img = shot(page, "after_otp")
    past = "/otp" not in page.url
    check("OTP verified — moved past /otp-verify", past, f"url={page.url}", img=img)
    return past


def step_pincode(page: Page) -> bool:
    section("4 · Pincode")

    at_pincode = wait_url(page, r"/pincode", ms=8_000)
    img = shot(page, "pincode_page")
    check("Pincode page loaded", at_pincode, f"url={page.url}", img=img)

    if not at_pincode:
        return False

    # id="pincode"
    try:
        page.locator("#pincode").fill("400001")
        time.sleep(0.5)
        check("Pincode 400001 entered", True)
    except Exception as e:
        check("Pincode input filled", False, str(e)[:80])
        return False

    # Check hospital count appears
    try:
        page.wait_for_selector("text=hospital", timeout=5000)
        check("Nearby hospitals count shown", True)
    except PWTimeout:
        check("Nearby hospitals count shown", False)

    # Continue button
    ok = click_btn(page, "Continue", "Next", "Proceed", "Save")
    check("Continue clicked", ok)
    time.sleep(0.8)
    return True


def step_pre_existing(page: Page) -> bool:
    section("5 · Pre-existing Conditions")

    if not wait_url(page, r"/pre-existing", ms=8_000):
        check("Pre-existing page", False, f"url={page.url} — skipping")
        return True

    img = shot(page, "pre_existing_page")
    check("Pre-existing conditions page loaded", True, img=img)

    # DiseaseDeclaration has Yes/No buttons — click "No" to declare no pre-existing
    ok = click_btn(page, "No")
    check("No pre-existing conditions selected", ok)
    time.sleep(1)
    return True


def step_eligibility(page: Page) -> bool:
    section("6 · Eligibility Check")

    if not wait_url(page, r"/eligibility", ms=8_000):
        check("Eligibility page", False, f"url={page.url} — skipping")
        return True

    img = shot(page, "eligibility_page")
    check("Eligibility page loaded", True, img=img)

    ok = click_btn(page, "Continue", "Next", "Proceed", "Confirmed", "Yes")
    check("Eligibility confirmed, continue", ok)
    time.sleep(1)
    return True


def step_plans(page: Page) -> bool:
    section("7 · Plan Selection")

    at_plans = wait_url(page, r"/plans", ms=10_000)
    img = shot(page, "plans_page")
    check("Plans page loaded", at_plans, f"url={page.url}", img=img)

    if not at_plans:
        return False

    # Wait for plans to load from API
    try:
        page.wait_for_selector("text=PHI", timeout=8000)
        check("PHI plan names visible (real XL data)", True)
    except PWTimeout:
        check("PHI plan names visible", False)

    # Check premium amounts are realistic
    body = page.inner_text("body")
    real_premiums = bool(re.search(r"₹[4-9],[0-9]{3}", body) or re.search(r"₹1[0-9],[0-9]{3}", body))
    check("Premiums in realistic range (₹4k–₹15k)", real_premiums)

    # Select a plan — click "Select Plan" button on first plan card
    ok = click_btn(page, "Select Plan")
    check("Plan selected ('Select Plan' button)", ok)
    time.sleep(0.5)

    # Click "Continue with Selected Plan"
    ok = click_btn(page, "Continue with Selected Plan", "Continue", "Proceed", "Next")
    check("Continue with selected plan", ok)
    time.sleep(1)
    return True


def step_addons(page: Page) -> bool:
    section("8 · Add-ons")

    if not wait_url(page, r"/addons", ms=8_000):
        check("Add-ons page", False, f"url={page.url} — skipping")
        return True

    img = shot(page, "addons_page")
    check("Add-ons page loaded", True, img=img)

    # Check addons are listed (look for any pricing or add-on names)
    body = page.inner_text("body")
    has_addons = any(k in body for k in ["Maternity", "Dental", "Vision", "Hospital Cash", "addon", "rider", "₹"])
    check("Add-on items listed", has_addons)

    # Skip / continue without addons
    ok = click_btn(page, "Skip", "Continue", "Proceed", "No Thanks", "Next")
    check("Add-ons skipped / continued", ok)
    time.sleep(1)
    return True


def step_summary(page: Page) -> bool:
    section("9 · Summary")

    if not wait_url(page, r"/summary", ms=8_000):
        check("Summary page", False, f"url={page.url} — skipping")
        return True

    img = shot(page, "summary_page")
    check("Summary page loaded", True, img=img)

    body = page.inner_text("body")
    check("Plan name shown (PHI...)", "PHI" in body)
    has_premium = "₹" in body or "INR" in body or bool(re.search(r"\d,\d{3}", body))
    check("Premium amount shown", has_premium)

    ok = click_btn(page, "Pay", "Proceed to Pay", "Continue", "Buy Now", "Purchase")
    check("Proceed to payment clicked", ok)
    time.sleep(1)
    return True


def step_proposer(page: Page) -> bool:
    section("10 · Proposer Details")

    if not wait_url(page, r"/proposer", ms=6_000):
        check("Proposer page", False, f"url={page.url} — not in this flow, skipping")
        return True

    img = shot(page, "proposer_page")
    check("Proposer details page loaded", True, img=img)

    # Inputs use placeholder, not name/id
    for selector, val in [
        ("input[placeholder='First name']", "Test"),
        ("input[placeholder='Last name']", "User"),
        ("input[type='date']", "1990-01-15"),
        ("input[placeholder='email@example.com']", "test@example.com"),
    ]:
        try:
            page.locator(selector).first.fill(val)
        except Exception:
            pass

    # Button text: "Proceed to Payment"
    ok = click_btn(page, "Proceed to Payment", "Continue", "Next", "Save")
    check("Proposer submitted ('Proceed to Payment')", ok)
    time.sleep(1.5)
    return True


def step_gateway(page: Page) -> bool:
    section("11 · Payment Gateway (Mocked)")

    at_gateway = wait_url(page, r"/gateway", ms=10_000)
    img = shot(page, "gateway_page")
    check("Payment gateway page loaded", at_gateway, f"url={page.url}", img=img)

    if not at_gateway:
        return False

    body = page.inner_text("body")
    check("Amount shown on gateway", "₹" in body or "amount" in body.lower())

    # Simulate payment — click Pay / Simulate Success
    ok = click_btn(page, "Pay Now", "Simulate Success", "Pay", "Proceed", "Confirm Payment")
    check("Payment button clicked (mocked flow)", ok)

    time.sleep(2)
    img = shot(page, "after_payment")

    success = (
        wait_url(page, r"/payment-success", ms=6_000) or
        wait_text(page, "Thank you", ms=4_000) or
        wait_text(page, "confirmed", ms=3_000) or
        wait_text(page, "Success", ms=3_000)
    )
    check("Payment success / confirmation screen", success, f"url={page.url}", img=img)
    return True


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    start = datetime.now()
    print(f"\n{BOLD}BuyOnline — Classic Journey Browser Test{RESET}")
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
            step_homepage(page)
            ok = step_lead_form(page)
            if ok:
                ok = step_otp(page)
            if ok:
                step_pincode(page)
                step_pre_existing(page)
                step_eligibility(page)
                ok = step_plans(page)
            if ok:
                step_addons(page)
                step_summary(page)
                step_proposer(page)
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
    total = len(results)
    pct = int(passed / total * 100) if total else 0

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
        unique_errors = list(dict.fromkeys(console_errors))[:8]
        print(f"\n  Browser errors ({len(console_errors)}):")
        for e in unique_errors:
            print(f"    ! {e[:120]}")

    print(f"\n  Score: {passed}/{total} ({pct}%)")
    print(f"  {'All checks passed! 🎉' if failed == 0 else 'Some checks failed.'}\n")

    report = {
        "timestamp": start.isoformat(),
        "mobile": MOBILE,
        "passed": passed, "failed": failed, "total": total, "score_pct": pct,
        "elapsed_s": round(elapsed, 1),
        "results": results,
        "console_errors": console_errors[:20],
    }
    with open("test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    print(f"  Report → test_report.json\n")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
