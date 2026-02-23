// ─── Intent Detection ──────────────────────────────────────────────────────────
// Maps intent names to their keyword arrays

export const INTENT_MAP: Record<string, string[]> = {
  premium_lookup: ['how much', 'premium for', 'cost for', 'price for', 'quote for', 'calculate', 'what is the premium', 'what would be', 'what will be'],
  plans_overview: ['what plans', 'list plan', 'all plan', 'plans available', 'which plan', 'types of plan', 'show plan', 'plans offer', 'insurance plan', 'health plan', 'tell me about plan', 'available plan'],
  compare_plans: ['compare', 'difference between', 'vs ', 'versus', 'better plan', 'which is better', 'basic vs', 'flagship vs', 'global vs'],
  plan_details: ['tell me about', 'details of', 'features of', 'what is', 'explain', 'describe', 'info on', 'about'],
  addons_info: ['addon', 'add-on', 'rider', 'optional', 'extra cover', 'additional cover', 'maternity', 'dental', 'vision', 'critical illness', 'personal accident', 'air ambulance', 'daily cash', 'loyalty bonus', 'chronic', 'cancer booster', 'infertility', 'opd', 'fitness', 'room rent', 'consumable', 'restoration', 'dmf cover', 'dme'],
  discounts_info: ['discount', 'saving', 'how to save', 'cibil', 'nri', 'employee discount', 'auto debit', 'tenure discount', 'multiple member'],
  zone_info: ['zone', 'which zone', 'my city', 'zone for', 'mumbai zone', 'delhi zone', 'bangalore zone'],
  family_type_info: ['family type', 'floater', 'family floater', 'family plan', 'cover family', '1a', '2a', 'who can', 'how many member'],
  waiting_period_info: ['waiting period', 'wait', 'when can i claim', 'how long before', 'ped waiting', 'pre-existing wait'],
  pre_existing_info: ['pre-existing', 'pre existing', 'existing condition', 'prior illness', 'previous disease', 'ped'],
  claim_info: ['claim', 'how to claim', 'raise claim', 'file a claim', 'reimbursement', 'cashless claim', 'claim process'],
  installment_info: ['instalment', 'installment', 'emi', 'monthly payment', 'quarterly', 'how to pay', 'payment mode', 'payment frequency'],
  tenure_info: ['tenure', '1 year', '2 year', '3 year', 'long term', 'multi year', 'policy term', 'duration'],
  kyc_info: ['kyc', 'document', 'verification', 'pan', 'aadhar', 'identity proof'],
  hospitals_info: ['hospital', 'cashless', 'network hospital', 'empanelled', 'near me', 'which hospital'],
  eligibility_info: ['eligib', 'who can apply', 'age limit', 'qualify', 'minimum age', 'maximum age', 'entry age'],
  copay_info: ['copay', 'co-pay', 'co pay', 'deductible', 'excess', 'aggregate deductible', 'per claim'],
  rules_info: ['rule', 'restriction', 'cannot combine', 'can i combine', 'together', 'allowed'],
  greeting: ['hello', 'hi ', 'hey ', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hi!', 'hello!'],
  thanks: ['thank', 'thanks'],
};

function matchesKeywords(query: string, keywords: string[]): boolean {
  return keywords.some((kw) => query.includes(kw));
}

/**
 * Detect the intent of a lowercased user message.
 * Returns an intent name string, or 'default' if no match.
 */
export function detectIntent(query: string): string {
  // Premium / pricing lookup (most specific first)
  if (matchesKeywords(query, INTENT_MAP.premium_lookup)) return 'premium_lookup';

  // Plan listing
  if (matchesKeywords(query, INTENT_MAP.plans_overview)) return 'plans_overview';

  // Plan comparison
  if (matchesKeywords(query, INTENT_MAP.compare_plans)) return 'compare_plans';

  // Specific plan details
  if (matchesKeywords(query, INTENT_MAP.plan_details)) return 'plan_details';

  // Add-ons
  if (matchesKeywords(query, INTENT_MAP.addons_info)) return 'addons_info';

  // Discounts
  if (matchesKeywords(query, INTENT_MAP.discounts_info)) return 'discounts_info';

  // Zone info
  if (matchesKeywords(query, INTENT_MAP.zone_info)) return 'zone_info';

  // Family type
  if (matchesKeywords(query, INTENT_MAP.family_type_info)) return 'family_type_info';

  // Waiting period
  if (matchesKeywords(query, INTENT_MAP.waiting_period_info)) return 'waiting_period_info';

  // Pre-existing conditions
  if (matchesKeywords(query, INTENT_MAP.pre_existing_info)) return 'pre_existing_info';

  // Claims
  if (matchesKeywords(query, INTENT_MAP.claim_info)) return 'claim_info';

  // Installment / payment mode
  if (matchesKeywords(query, INTENT_MAP.installment_info)) return 'installment_info';

  // Tenure
  if (matchesKeywords(query, INTENT_MAP.tenure_info)) return 'tenure_info';

  // KYC
  if (matchesKeywords(query, INTENT_MAP.kyc_info)) return 'kyc_info';

  // Hospitals / cashless
  if (matchesKeywords(query, INTENT_MAP.hospitals_info)) return 'hospitals_info';

  // Eligibility
  if (matchesKeywords(query, INTENT_MAP.eligibility_info)) return 'eligibility_info';

  // Co-payment
  if (matchesKeywords(query, INTENT_MAP.copay_info)) return 'copay_info';

  // Business rules / restrictions
  if (matchesKeywords(query, INTENT_MAP.rules_info)) return 'rules_info';

  // Greetings
  if (matchesKeywords(query, INTENT_MAP.greeting)) return 'greeting';

  // Thanks
  if (matchesKeywords(query, INTENT_MAP.thanks)) return 'thanks';

  return 'default';
}
