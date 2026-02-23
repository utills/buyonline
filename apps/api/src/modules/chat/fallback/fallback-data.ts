import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

// ─── Rate Data ──────────────────────────────────────────────────────────────
// Base premiums extracted from Rate Calculator v13.0 (excl. GST & taxes)
// Structure: plans[planName].premiums[`${family}|${zone}`][ageBand][sumInsured]
// Try both source and dist locations
export function loadRateData() {
  const candidates = [
    join(process.cwd(), 'src/modules/chat/rate-data.json'),
    join(process.cwd(), 'dist/modules/chat/rate-data.json'),
    resolve('src/modules/chat/rate-data.json'),
  ];
  for (const p of candidates) {
    try { return JSON.parse(readFileSync(p, 'utf-8')).plans; } catch { /* try next */ }
  }
  return {};
}
export const RATE_DATA: Record<string, { premiums: Record<string, Record<string, Record<string, number>>> }> = loadRateData();

export const GST_RATE = 0.18;

export function applyGst(base: number): number {
  return Math.round(base * (1 + GST_RATE));
}

// ─── Plan Metadata ───────────────────────────────────────────────────────────
export function getAgeBand(age: number): string {
  if (age <= 17) return '5 - 17';
  if (age <= 25) return '18 - 25';
  if (age <= 30) return '26 - 30';
  if (age <= 35) return '31 - 35';
  if (age <= 40) return '36 - 40';
  if (age <= 45) return '41 - 45';
  if (age <= 50) return '46 - 50';
  if (age <= 55) return '51 - 55';
  if (age <= 60) return '56 - 60';
  if (age <= 65) return '61 - 65';
  if (age <= 70) return '66 - 70';
  if (age <= 75) return '71 - 75';
  if (age <= 80) return '76 - 80';
  if (age <= 85) return '81 - 85';
  return '85+';
}

export function lookupPremium(plan: string, family: string, zone: string, age: number, si: number): number | null {
  const planData = RATE_DATA[plan];
  if (!planData) return null;
  const combo = planData.premiums[`${family}|${zone}`];
  if (!combo) return null;
  const ageBand = getAgeBand(age);
  const ageData = combo[ageBand];
  if (!ageData) return null;
  // Find closest SI
  const siKeys = Object.keys(ageData).map(Number).sort((a, b) => a - b);
  const exactKey = siKeys.find(k => k === si);
  if (exactKey !== undefined) return ageData[String(exactKey)];
  // Find nearest
  const nearest = siKeys.reduce((prev, curr) => Math.abs(curr - si) < Math.abs(prev - si) ? curr : prev);
  return ageData[String(nearest)] || null;
}

export function formatMoney(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
  if (amount >= 1000) return `₹${amount.toLocaleString('en-IN')}`;
  return `₹${amount}`;
}

export function parseSI(text: string): number | null {
  const t = text.toLowerCase().replace(/,/g, '').replace(/₹/g, '');
  const lakh = t.match(/(\d+(?:\.\d+)?)\s*l(?:akh)?/);
  if (lakh) return Math.round(parseFloat(lakh[1]) * 100000);
  const cr = t.match(/(\d+(?:\.\d+)?)\s*cr(?:ore)?/);
  if (cr) return Math.round(parseFloat(cr[1]) * 10000000);
  const num = t.match(/^(\d{4,})/);
  if (num) return parseInt(num[1]);
  return null;
}

export function parseAge(text: string): number | null {
  const m = text.match(/\b(\d{1,2})\s*(?:years?|yrs?|yr|y|age)?\b/i);
  return m ? parseInt(m[1]) : null;
}

export function parseZone(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('zone 1') || t.includes('zone1') || t.includes('metro') || t.includes('mumbai') || t.includes('delhi') || t.includes('bangalore') || t.includes('bengaluru')) return 'Zone 1';
  if (t.includes('zone 2') || t.includes('zone2') || t.includes('pune') || t.includes('hyderabad') || t.includes('chennai') || t.includes('kolkata')) return 'Zone 2';
  if (t.includes('zone 3') || t.includes('zone3')) return 'Zone 3';
  if (t.includes('zone 4') || t.includes('zone4') || t.includes('rural') || t.includes('town')) return 'Zone 4';
  return 'Zone 2'; // default
}

export function parseFamily(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('2a4c') || (t.includes('2 adult') && t.includes('4 child'))) return '2A4C';
  if (t.includes('2a3c') || (t.includes('2 adult') && t.includes('3 child'))) return '2A3C';
  if (t.includes('2a2c') || (t.includes('2 adult') && t.includes('2 child'))) return '2A2C';
  if (t.includes('2a1c') || (t.includes('2 adult') && t.includes('1 child'))) return '2A1C';
  if (t.includes('1a4c') || (t.includes('1 adult') && t.includes('4 child'))) return '1A4C';
  if (t.includes('1a3c') || (t.includes('1 adult') && t.includes('3 child'))) return '1A3C';
  if (t.includes('1a2c') || (t.includes('1 adult') && t.includes('2 child'))) return '1A2C';
  if (t.includes('1a1c') || (t.includes('1 adult') && t.includes('1 child'))) return '1A1C';
  if (t.includes('2a') || t.includes('2 adult') || t.includes('couple') || t.includes('husband') || t.includes('wife') || t.includes('spouse')) return '2A';
  if (t.includes('family') && !t.includes('individual')) return '2A2C';
  return '1A';
}

export function parsePlan(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes('global plus') && (t.includes('us') || t.includes('canada') || t.includes('america'))) return 'PHI Global Plus Incl US/Canada';
  if (t.includes('global plus') && (t.includes('europe') || t.includes('euro'))) return 'PHI Global Plus Europe';
  if (t.includes('global plus') && t.includes('asia')) return 'PHI Global Plus Asia Excl India';
  if (t.includes('global plus')) return 'PHI Global Plus Excl US/Canada';
  if (t.includes('global') && (t.includes('us') || t.includes('canada') || t.includes('america'))) return 'PHI Global Plus Incl US/Canada';
  if (t.includes('global') && (t.includes('europe') || t.includes('euro'))) return 'PHI Global Europe';
  if (t.includes('global') && t.includes('asia')) return 'PHI Global Asia Excl India';
  if (t.includes('global')) return 'PHI Global Excl US/Canada';
  if (t.includes('flagship 4') || t.includes('flagship4') || t.includes('priority banking') || t.includes('pb')) return 'PHI Flagship 4 (PB)';
  if (t.includes('flagship 3') || t.includes('flagship3')) return 'PHI Flagship 2/3';
  if (t.includes('flagship 2') || t.includes('flagship2')) return 'PHI Flagship 2/3';
  if (t.includes('flagship 1') || t.includes('flagship1') || t.includes('flagship one')) return 'PHI Flagship 1';
  if (t.includes('flagship')) return 'PHI Flagship 2/3';
  if (t.includes('senior')) return 'PHI Senior';
  if (t.includes('sub standard') || t.includes('substandard') || t.includes('sub-standard')) return 'PHI Sub Standard';
  if (t.includes('posp')) return 'PHI POSP';
  if (t.includes('basic')) return 'PHI Basic';
  return null;
}


// ─── Re-exports from sub-modules ────────────────────────────────────────────
export { PLAN_META } from './fallback-data-plans.js';
export { ADDONS, DISCOUNTS, INSTALLMENT_LOADING, ZONE_GUIDE, FAMILY_GUIDE, BUSINESS_RULES } from './fallback-data-addons.js';
