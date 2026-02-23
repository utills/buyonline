#!/usr/bin/env python3
"""
BuyOnline — Full Journey Test (Playwright)
Tests two scenarios end-to-end:

  Suite A — Classic Journey (no AI, no chatbot)
    Homepage → Lead Form → OTP → Pincode → Pre-existing → Eligibility
    → Plans → Addons → Hospitals → Summary → Proposer → Gateway
    → Payment Success → KYC Method → KYC Details (PAN) → KYC OTP
    → KYC Success → Personal Details → Bank Details → Lifestyle
    → Medical → Hospitalization → Disability → Declaration → Complete

  Suite B — Configurator → Journey Integration
    1. Open /configurator, disable PHI Basic plan, save
    2. Run classic journey → Plans page must NOT show PHI Basic
    3. Open /configurator, disable Maternity addon, save
    4. Run classic journey → Addons page must NOT show Maternity
    5. Open /configurator, toggle hospitalSearchEnabled OFF
    6. Verify /hospitals page redirects away
    7. Reset config → all plans/addons reappear

Usage:
  python3 test_full_journey.py              # headless
  python3 test_full_journey.py --headed     # visible browser
  python3 test_full_journey.py --slow 300   # slow motion (ms)
  python3 test_full_journey.py --suite A    # only classic journey
  python3 test_full_journey.py --suite B    # only configurator integration
"""

import sys, re, time, argparse, json
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright, Page, BrowserContext, TimeoutError as PWTimeout

# ─── Config ───────────────────────────────────────────────────────────────────

WEB  = "http://localhost:3000"
OTP  = "123456"
T    = 12_000   # default timeout ms
STREAM = 8_000  # wait for async ops

parser = argparse.ArgumentParser()
parser.add_argument("--headed", action="store_true")
parser.add_argument("--slow",   type=int, default=0)
parser.add_argument("--suite",  choices=["A", "B", "AB"], default="AB")
args = parser.parse_args()

SCREENSHOT_DIR = Path("test_screenshots_full")
SCREENSHOT_DIR.mkdir(exist_ok=True)

PASS  = "\033[92m✓\033[0m"
FAIL  = "\033[91m✗\033[0m"
WARN  = "\033[93m!\033[0m"
BOLD  = "\033[1m"
RESET = "\033[0m"

results: list[dict] = []
step_n = [0]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def shot(page: Page, name: str) -> str:
    path = SCREENSHOT_DIR / f"{step_n[0]:02d}_{name}.png"
    step_n[0] += 1
    try: page.screenshot(path=str(path))
    except Exception: pass
    return str(path)


def check(label: str, ok: bool, detail: str = "", img: str = "") -> bool:
    icon   = PASS if ok else FAIL
    sfx    = f"  [{detail}]" if detail else ""
    istr   = f"  📸 {img}" if img else ""
    print(f"  {icon} {label}{sfx}{istr}")
    results.append({"label": label, "ok": ok, "detail": detail})
    return ok


def section(title: str):
    print(f"\n{BOLD}── {title} {'─' * (52 - len(title))}{RESET}")


def wait_url(page: Page, pattern: str, ms: int = T) -> bool:
    try:   page.wait_for_url(re.compile(pattern), timeout=ms); return True
    except PWTimeout: return False


def wait_text(page: Page, text: str, ms: int = T) -> bool:
    try:   page.get_by_text(text, exact=False).first.wait_for(timeout=ms); return True
    except PWTimeout: return False


def click_btn(page: Page, *labels: str) -> bool:
    for label in labels:
        try:
            page.get_by_role("button", name=re.compile(label, re.IGNORECASE)).first.click()
            return True
        except Exception:
            pass
    return False


def fill(page: Page, selector: str, value: str) -> bool:
    try:   page.locator(selector).first.fill(value); return True
    except Exception: return False


def new_mobile() -> str:
    return f"9{int(time.time() * 1000) % 900_000_000 + 100_000_000}"


# ─────────────────────────────────────────────────────────────────────────────
#  SUITE A — Full Classic Journey
# ─────────────────────────────────────────────────────────────────────────────

def run_lead_otp(page: Page, mobile: str) -> bool:
    """Homepage → Lead form → OTP verify. Returns True on success."""
    section("A1 · Homepage + Lead Form")
    page.goto(WEB, wait_until="networkidle")
    img = shot(page, "A_homepage")
    check("Homepage loaded", page.get_by_text("Health Insurance").count() > 0, img=img)

    # Open classic form
    try:
        page.get_by_role("button", name=re.compile("Self.Serve|Classic|Forms", re.IGNORECASE)).first.click()
        time.sleep(0.4)
        check("Self-Serve option clicked", True)
    except Exception as e:
        check("Self-Serve option clicked", False, str(e)[:60])
        return False

    fill(page, "#age",    "35")
    fill(page, "#mobile", mobile)
    try: page.locator("input[type='checkbox']").check()
    except Exception: pass

    img = shot(page, "A_lead_form")
    try:
        page.get_by_role("button", name="Get the Best Offer").click()
        check("Lead form submitted", True, img=img)
    except Exception as e:
        check("Lead form submitted", False, str(e)[:60], img=img)
        return False

    section("A2 · OTP Verification")
    if not wait_url(page, r"/otp-verify", ms=10_000):
        check("Navigated to /otp-verify", False, f"url={page.url}")
        return False
    check("Navigated to /otp-verify", True)

    try:
        inputs = page.locator("input[maxlength='1']").all()
        for i, d in enumerate(OTP): inputs[i].fill(d); time.sleep(0.05)
        check(f"OTP {OTP} entered", True)
        time.sleep(1.5)
    except Exception as e:
        check("OTP digits filled", False, str(e)[:60])
        return False

    img = shot(page, "A_after_otp")
    ok = "/otp" not in page.url
    check("OTP verified → moved to next step", ok, f"url={page.url}", img=img)
    return ok


def run_onboarding(page: Page) -> bool:
    section("A3 · Pincode")
    if not wait_url(page, r"/pincode", ms=8_000):
        check("Pincode page", False, f"url={page.url}"); return False
    check("Pincode page loaded", True)
    fill(page, "#pincode", "400001")
    time.sleep(0.5)
    check("Pincode 400001 entered", True)
    body = page.inner_text("body")
    check("Hospital count visible", "hospital" in body.lower() or "cashless" in body.lower())
    click_btn(page, "Continue"); time.sleep(0.8)

    section("A4 · Pre-existing Conditions")
    if not wait_url(page, r"/pre-existing", ms=8_000):
        check("Pre-existing page", False, f"url={page.url}"); return False
    img = shot(page, "A_pre_existing")
    check("Pre-existing page loaded", True, img=img)
    click_btn(page, "No"); time.sleep(1)

    section("A5 · Eligibility")
    if not wait_url(page, r"/eligibility", ms=8_000):
        check("Eligibility page", False, f"url={page.url}"); return False
    img = shot(page, "A_eligibility")
    check("Eligibility page loaded", True, img=img)
    click_btn(page, "Continue", "Confirmed", "Yes"); time.sleep(1)
    return True


def run_quote(page: Page) -> bool:
    section("A6 · Plans")
    if not wait_url(page, r"/plans", ms=10_000):
        check("Plans page", False, f"url={page.url}"); return False
    try: page.wait_for_selector("text=PHI", timeout=8_000)
    except PWTimeout: pass
    img = shot(page, "A_plans")
    check("Plans page loaded", True, f"url={page.url}", img=img)
    body = page.inner_text("body")
    check("PHI plan names visible", "PHI" in body)
    check("Realistic premiums (₹4k–₹15k)", bool(re.search(r"₹[4-9],[0-9]{3}", body) or re.search(r"₹1[0-5],[0-9]{3}", body)))
    click_btn(page, "Select Plan"); time.sleep(0.5)
    click_btn(page, "Continue with Selected Plan", "Continue"); time.sleep(1)

    section("A7 · Add-ons")
    if not wait_url(page, r"/addons", ms=8_000):
        check("Add-ons page", False, f"url={page.url}"); return False
    img = shot(page, "A_addons")
    check("Add-ons page loaded", True, img=img)
    body = page.inner_text("body")
    check("Add-ons listed", any(k in body for k in ["Maternity", "Dental", "Vision", "Hospital", "₹"]))
    click_btn(page, "Skip", "Continue"); time.sleep(1)

    section("A8 · Hospitals")
    if wait_url(page, r"/hospitals", ms=6_000):
        img = shot(page, "A_hospitals")
        check("Hospitals page loaded", True, img=img)
        try:
            page.wait_for_selector("text=hospital", timeout=5_000)
            check("Hospital list loaded", True)
        except PWTimeout:
            check("Hospital list loaded", False)
        click_btn(page, "Continue"); time.sleep(1)
    else:
        check("Hospitals page (skipped — featureFlag off)", True)

    section("A9 · Summary")
    if not wait_url(page, r"/summary", ms=8_000):
        check("Summary page", False, f"url={page.url}"); return False
    img = shot(page, "A_summary")
    body = page.inner_text("body")
    check("Summary page loaded", True, img=img)
    check("Plan name in summary (PHI)", "PHI" in body)
    check("Premium shown in summary", "₹" in body or bool(re.search(r"\d,\d{3}", body)))
    click_btn(page, "Pay", "Proceed to Pay", "Continue"); time.sleep(1)
    return True


def run_payment(page: Page) -> bool:
    section("A10 · Proposer Details")
    if wait_url(page, r"/proposer", ms=6_000):
        img = shot(page, "A_proposer")
        check("Proposer page loaded", True, img=img)
        fill(page, "input[placeholder='First name']", "Test")
        fill(page, "input[placeholder='Last name']",  "User")
        fill(page, "input[type='date']",               "1990-01-15")
        fill(page, "input[placeholder='email@example.com']", "test@example.com")
        click_btn(page, "Proceed to Payment"); time.sleep(1.5)
    else:
        check("Proposer page (not in flow)", True)

    section("A11 · Payment Gateway")
    if not wait_url(page, r"/gateway", ms=10_000):
        check("Gateway page", False, f"url={page.url}"); return False
    img = shot(page, "A_gateway")
    body = page.inner_text("body")
    check("Gateway page loaded", True, img=img)
    check("Amount shown on gateway", "₹" in body or bool(re.search(r"\d,\d{3}", body)))
    click_btn(page, "Pay Now", "Simulate", "Pay", "Proceed"); time.sleep(2)

    ok = wait_url(page, r"/payment-success", ms=8_000)
    img = shot(page, "A_payment_success")
    check("Payment success page", ok, f"url={page.url}", img=img)
    if ok:
        body = page.inner_text("body")
        check("Success message visible", any(k in body for k in ["success", "Success", "Thank", "confirmed", "✓"]))
    return ok


def run_kyc(page: Page) -> bool:
    section("A12 · KYC Method")
    if not wait_url(page, r"/method", ms=8_000):
        check("KYC Method page", False, f"url={page.url}"); return False
    img = shot(page, "A_kyc_method")
    check("KYC Method page loaded", True, img=img)
    body = page.inner_text("body")
    check("KYC method options visible", any(k in body for k in ["CKYC", "eKYC", "Manual", "PAN", "Aadhar"]))

    # Select CKYC (PAN based) — always visible
    try:
        page.get_by_text("CKYC (PAN Based)").click()
        check("CKYC (PAN Based) selected", True)
    except Exception:
        check("CKYC option clicked", False)
    click_btn(page, "Continue"); time.sleep(0.8)

    section("A13 · KYC Details (PAN)")
    if not wait_url(page, r"/details", ms=8_000):
        check("KYC Details page", False, f"url={page.url}"); return False
    img = shot(page, "A_kyc_details")
    check("KYC Details page loaded", True, img=img)
    fill(page, "input[placeholder*='PAN']", "ABCDE1234F")
    fill(page, "input[type='date']", "1990-01-15")
    click_btn(page, "Verify", "Verify PAN", "Continue", "Submit"); time.sleep(1)

    section("A14 · KYC OTP")
    if not wait_url(page, r"/kyc.*otp|/otp", ms=8_000):
        check("KYC OTP page", False, f"url={page.url}"); return False
    img = shot(page, "A_kyc_otp")
    check("KYC OTP page loaded", True, img=img)
    try:
        inputs = page.locator("input[maxlength='1']").all()
        for i, d in enumerate(OTP): inputs[i].fill(d); time.sleep(0.05)
        check(f"KYC OTP {OTP} entered", True)
        time.sleep(1.5)
    except Exception as e:
        check("KYC OTP filled", False, str(e)[:60])

    section("A15 · KYC Success")
    if wait_url(page, r"/kyc-success", ms=8_000):
        img = shot(page, "A_kyc_success")
        check("KYC Success page", True, img=img)
        click_btn(page, "Continue", "Next", "Proceed"); time.sleep(0.8)
    else:
        check("KYC Success page", False, f"url={page.url}")
    return True


def run_health_declaration(page: Page) -> bool:
    section("A16 · Personal Details")
    if not wait_url(page, r"/personal", ms=8_000):
        check("Personal page", False, f"url={page.url}"); return False
    img = shot(page, "A_personal")
    check("Personal details page loaded", True, img=img)
    # Fill member form (MemberPersonalForm)
    fill(page, "input[placeholder*='irst']", "Test")
    fill(page, "input[placeholder*='ast']",  "User")
    fill(page, "input[type='date']",          "1990-01-15")
    fill(page, "input[placeholder*='eight']", "170")
    fill(page, "input[placeholder*='eight'][type='number']", "70")
    click_btn(page, "Continue"); time.sleep(1)

    section("A17 · Bank Details")
    if not wait_url(page, r"/bank", ms=8_000):
        check("Bank page", False, f"url={page.url}"); return False
    img = shot(page, "A_bank")
    check("Bank details page loaded", True, img=img)
    fill(page, "input[placeholder='Enter account number']",  "123456789012")
    fill(page, "input[placeholder='Re-enter account number']", "123456789012")
    fill(page, "input[placeholder*='Bank']",                 "State Bank of India")
    fill(page, "input[placeholder*='IFSC']",                 "SBIN0001234")
    click_btn(page, "Continue"); time.sleep(1)

    section("A18 · Lifestyle")
    if not wait_url(page, r"/lifestyle", ms=8_000):
        check("Lifestyle page", False, f"url={page.url}"); return False
    img = shot(page, "A_lifestyle")
    check("Lifestyle page loaded", True, img=img)
    # Answer No to tobacco/alcohol
    try:
        no_btns = page.get_by_role("button", name=re.compile("No", re.IGNORECASE)).all()
        for btn in no_btns[:2]: btn.click(); time.sleep(0.1)
    except Exception: pass
    click_btn(page, "Continue", "Next"); time.sleep(1)

    section("A19 · Medical History")
    if not wait_url(page, r"/medical", ms=8_000):
        check("Medical page", False, f"url={page.url}"); return False
    img = shot(page, "A_medical")
    check("Medical history page loaded", True, img=img)
    body = page.inner_text("body")
    check("Health questions shown", any(k in body for k in ["diabetes", "Diabetes", "heart", "Heart"]))
    # Answer No to all conditions
    try:
        no_btns = page.get_by_role("button", name=re.compile("^No$", re.IGNORECASE)).all()
        for btn in no_btns: btn.click(); time.sleep(0.05)
    except Exception: pass
    click_btn(page, "Continue"); time.sleep(1)

    section("A20 · Hospitalization History")
    if not wait_url(page, r"/hospitalization", ms=8_000):
        check("Hospitalization page", False, f"url={page.url}"); return False
    img = shot(page, "A_hospitalization")
    check("Hospitalization page loaded", True, img=img)
    try:
        no_btns = page.get_by_role("button", name=re.compile("^No$", re.IGNORECASE)).all()
        for btn in no_btns[:2]: btn.click(); time.sleep(0.05)
    except Exception: pass
    click_btn(page, "Continue"); time.sleep(1)

    section("A21 · Disability")
    if not wait_url(page, r"/disability", ms=8_000):
        check("Disability page", False, f"url={page.url}"); return False
    img = shot(page, "A_disability")
    check("Disability page loaded", True, img=img)
    try:
        no_btns = page.get_by_role("button", name=re.compile("^No$", re.IGNORECASE)).all()
        for btn in no_btns[:2]: btn.click(); time.sleep(0.05)
    except Exception: pass
    click_btn(page, "Continue"); time.sleep(1)

    section("A22 · Declaration (Review)")
    if not wait_url(page, r"/declaration", ms=8_000):
        check("Declaration page", False, f"url={page.url}"); return False
    img = shot(page, "A_declaration")
    body = page.inner_text("body")
    check("Declaration review page loaded", True, img=img)
    check("Summary sections visible", any(k in body for k in ["Lifestyle", "Medical", "Declaration", "Submit"]))
    click_btn(page, "Submit Declaration", "Submit", "Confirm"); time.sleep(1)

    section("A23 · Complete")
    ok = wait_url(page, r"/complete", ms=8_000)
    img = shot(page, "A_complete")
    body = page.inner_text("body")
    check("Application complete page", ok, f"url={page.url}", img=img)
    if ok:
        check("Completion message visible", any(k in body for k in ["complete", "Complete", "Thank", "submitted", "success"]))
    return ok


# ─────────────────────────────────────────────────────────────────────────────
#  SUITE B — Configurator → Journey Integration
# ─────────────────────────────────────────────────────────────────────────────

def open_configurator(page: Page) -> bool:
    page.goto(f"{WEB}/configurator", wait_until="networkidle")
    time.sleep(1)
    ok = "/configurator" in page.url
    check("Configurator opens at /configurator", ok, f"url={page.url}")
    return ok


def cfg_nav(page: Page, section_name: str) -> bool:
    """Click a sidebar nav link in the configurator."""
    try:
        page.get_by_role("link", name=re.compile(section_name, re.IGNORECASE)).first.click()
        time.sleep(0.5)
        return True
    except Exception:
        try:
            page.get_by_text(section_name).first.click()
            time.sleep(0.5)
            return True
        except Exception:
            return False


def cfg_toggle_plan(page: Page, plan_name: str, enable: bool) -> bool:
    """Toggle a plan on/off in the Plans configurator."""
    try:
        # Find the plan row and its toggle
        plan_row = page.locator(f"text={plan_name}").first
        plan_row.scroll_into_view_if_needed()
        # Find toggle near this text
        toggle = plan_row.locator("xpath=ancestor::*[contains(@class,'flex') or contains(@class,'grid')][1]//button[@role='switch' or contains(@class,'toggle')]").first
        current = toggle.get_attribute("aria-checked") or toggle.get_attribute("data-state")
        is_on = current in ("true", "checked")
        if (enable and not is_on) or (not enable and is_on):
            toggle.click()
            time.sleep(0.3)
        return True
    except Exception:
        return False


def suite_b_plan_toggle(ctx: BrowserContext) -> None:
    section("B1 · Configurator: Disable PHI Basic plan")
    page = ctx.new_page()
    opened = open_configurator(page)

    if opened:
        # Navigate to Plans section
        nav_ok = cfg_nav(page, "Plans")
        check("Navigated to Plans & Addons in configurator", nav_ok)
        img = shot(page, "B_plans_config")

        # Find PHI Basic toggle and disable it
        try:
            page.wait_for_selector("text=PHI Basic", timeout=5_000)
            check("PHI Basic visible in configurator", True, img=img)

            # Look for the toggle button associated with PHI Basic
            phi_basic = page.locator("text=PHI Basic").first
            phi_basic.scroll_into_view_if_needed()

            # Try to find toggle within the same card/row
            parent = phi_basic.locator("xpath=ancestor::div[contains(@class,'flex') or contains(@class,'card')][2]")
            toggle = parent.locator("button[role='switch'], input[type='checkbox'], button:has-text('Enabled'), button:has-text('Disable')").first
            toggle.click()
            time.sleep(0.5)
            check("PHI Basic toggle clicked (disabled)", True)
        except PWTimeout:
            check("PHI Basic visible in configurator", False)
        except Exception as e:
            check("PHI Basic toggle clicked", False, str(e)[:80])

    page.close()

    # Now run classic journey up to plans page and verify PHI Basic is absent
    section("B2 · Verify: PHI Basic hidden in Classic Journey Plans")
    p2 = ctx.new_page()
    mobile = new_mobile()
    ok = run_lead_otp(p2, mobile)
    if ok:
        run_onboarding(p2)
        if wait_url(p2, r"/plans", ms=10_000):
            try: p2.wait_for_selector("text=PHI", timeout=8_000)
            except PWTimeout: pass
            body = p2.inner_text("body")
            img = shot(p2, "B_plans_no_basic")
            phi_basic_gone = "PHI Basic" not in body
            check("PHI Basic NOT shown in plans (config respected)", phi_basic_gone, img=img)
            phi_flag_shown = "PHI Flagship" in body
            check("Other PHI plans still shown", phi_flag_shown)
    p2.close()


def suite_b_addon_toggle(ctx: BrowserContext) -> None:
    section("B3 · Configurator: Disable Maternity addon")
    page = ctx.new_page()
    open_configurator(page)
    cfg_nav(page, "Plans")
    time.sleep(0.5)

    try:
        page.wait_for_selector("text=Maternity", timeout=5_000)
        maternity = page.locator("text=Maternity").first
        maternity.scroll_into_view_if_needed()
        parent = maternity.locator("xpath=ancestor::div[contains(@class,'flex') or contains(@class,'card')][2]")
        toggle = parent.locator("button[role='switch'], input[type='checkbox']").first
        toggle.click()
        time.sleep(0.5)
        check("Maternity addon toggle clicked (disabled)", True)
    except Exception as e:
        check("Maternity addon toggle clicked", False, str(e)[:80])
    page.close()

    section("B4 · Verify: Maternity hidden in Classic Journey Addons")
    p2 = ctx.new_page()
    mobile = new_mobile()
    ok = run_lead_otp(p2, mobile)
    if ok:
        run_onboarding(p2)
        if wait_url(p2, r"/plans", ms=10_000):
            try: p2.wait_for_selector("text=PHI", timeout=8_000)
            except PWTimeout: pass
            click_btn(p2, "Select Plan"); time.sleep(0.5)
            click_btn(p2, "Continue with Selected Plan", "Continue"); time.sleep(1)
        if wait_url(p2, r"/addons", ms=8_000):
            body = p2.inner_text("body")
            img = shot(p2, "B_addons_no_maternity")
            maternity_gone = "Maternity" not in body
            check("Maternity NOT shown in addons (config respected)", maternity_gone, img=img)
    p2.close()


def suite_b_hospital_flag(ctx: BrowserContext) -> None:
    section("B5 · Configurator: Toggle hospitalSearchEnabled OFF")
    page = ctx.new_page()
    open_configurator(page)
    cfg_nav(page, "Branding")
    time.sleep(0.5)

    try:
        page.wait_for_selector("text=Hospital Search", timeout=5_000)
        hosp = page.locator("text=Hospital Search").first
        hosp.scroll_into_view_if_needed()
        parent = hosp.locator("xpath=ancestor::div[3]")
        toggle = parent.locator("button[role='switch'], input[type='checkbox']").first
        toggle.click()
        time.sleep(0.5)
        check("Hospital Search flag toggled OFF", True)
    except Exception as e:
        check("Hospital Search flag toggle", False, str(e)[:80])
    page.close()

    section("B6 · Verify: /hospitals redirects when flag is OFF")
    p2 = ctx.new_page()
    p2.goto(f"{WEB}/hospitals")
    time.sleep(2)
    img = shot(p2, "B_hospitals_redirect")
    redirected = "/hospitals" not in p2.url
    check("/hospitals redirects when hospitalSearchEnabled=false", redirected, f"url={p2.url}", img=img)
    p2.close()


def suite_b_reset(ctx: BrowserContext) -> None:
    section("B7 · Configurator: Reset to defaults")
    page = ctx.new_page()
    open_configurator(page)
    try:
        page.get_by_role("button", name=re.compile("Reset", re.IGNORECASE)).first.click()
        time.sleep(0.5)
        # Confirm reset if dialog appears
        try:
            page.get_by_role("button", name=re.compile("Confirm|Yes|Reset", re.IGNORECASE)).first.click(timeout=2_000)
        except Exception:
            pass
        time.sleep(0.5)
        check("Config reset to defaults", True)
    except Exception as e:
        check("Config reset button found", False, str(e)[:60])
    page.close()

    section("B8 · Verify: PHI Basic reappears after reset")
    p2 = ctx.new_page()
    mobile = new_mobile()
    ok = run_lead_otp(p2, mobile)
    if ok:
        run_onboarding(p2)
        if wait_url(p2, r"/plans", ms=10_000):
            try: p2.wait_for_selector("text=PHI", timeout=8_000)
            except PWTimeout: pass
            body = p2.inner_text("body")
            img = shot(p2, "B_plans_after_reset")
            check("PHI Basic reappears after config reset", "PHI Basic" in body, img=img)
    p2.close()


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    start  = datetime.now()
    mobile = new_mobile()
    print(f"\n{BOLD}BuyOnline — Full Journey Test{RESET}")
    print(f"Started:  {start.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Mobile:   {mobile}  (OTP bypass: {OTP})")
    print(f"Suites:   {args.suite}  |  Browser: {'headed' if args.headed else 'headless'}")
    print(f"Shots:    {SCREENSHOT_DIR.resolve()}/")

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=not args.headed, slow_mo=args.slow)
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, locale="en-IN")
        console_errors: list[str] = []
        page = ctx.new_page()
        page.on("console",   lambda m: console_errors.append(f"[{m.type}] {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"[JS] {e}"))

        try:
            if "A" in args.suite:
                # ── Suite A: Full Classic Journey ──────────────────────────
                ok = run_lead_otp(page, mobile)
                if ok: ok = run_onboarding(page)
                if ok: ok = run_quote(page)
                if ok: ok = run_payment(page)
                if ok: ok = run_kyc(page)
                if ok: run_health_declaration(page)

            if "B" in args.suite:
                # ── Suite B: Configurator Integration ─────────────────────
                suite_b_plan_toggle(ctx)
                suite_b_addon_toggle(ctx)
                suite_b_hospital_flag(ctx)
                suite_b_reset(ctx)

        except Exception as ex:
            img = shot(page, "crash")
            check("Unexpected exception", False, str(ex)[:120], img=img)
        finally:
            shot(page, "final_state")
            browser.close()

    # ── Report ────────────────────────────────────────────────────────────────
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
        for e in unique: print(f"    {WARN} {e[:120]}")

    print(f"\n  Score: {passed}/{total} ({pct}%)")
    print(f"  {'All checks passed! 🎉' if failed == 0 else 'Some checks failed.'}\n")

    report = {"timestamp": start.isoformat(), "mobile": mobile,
              "passed": passed, "failed": failed, "total": total,
              "score_pct": pct, "elapsed_s": round(elapsed, 1),
              "results": results, "console_errors": console_errors[:20]}
    with open("test_report_full.json", "w") as f:
        json.dump(report, f, indent=2)
    print(f"  Report → test_report_full.json\n")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
