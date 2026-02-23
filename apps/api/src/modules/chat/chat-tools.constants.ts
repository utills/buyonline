import Anthropic from '@anthropic-ai/sdk';

// ─── Standard Chat Tools ───────────────────────────────────────────────────────
// Used by the embedded chat widget (plan info, premium calc, hospitals)
export const STANDARD_TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_plans',
    description: 'Fetch all available health insurance plans with features, pricing tiers, and add-ons.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'calculate_premium',
    description: 'Calculate the exact annual premium (including GST and discounts) for a specific plan.',
    input_schema: {
      type: 'object',
      properties: {
        planId: { type: 'string', description: 'Plan ID — e.g. plan-premier, plan-signature, plan-global' },
        sumInsured: { type: 'number', description: 'Sum insured in rupees (e.g. 500000, 1000000)' },
        coverageLevel: { type: 'string', enum: ['INDIVIDUAL', 'FLOATER'] },
        tenureMonths: { type: 'number', enum: [12, 24] },
      },
      required: ['planId', 'sumInsured', 'coverageLevel', 'tenureMonths'],
    },
  },
  {
    name: 'get_plan_addons',
    description: 'Get available add-ons for a specific plan.',
    input_schema: {
      type: 'object',
      properties: { planId: { type: 'string' } },
      required: ['planId'],
    },
  },
  {
    name: 'get_hospital_network',
    description: 'Search for cashless network hospitals near a pincode.',
    input_schema: {
      type: 'object',
      properties: { pincode: { type: 'string', description: '6-digit Indian pincode' } },
      required: ['pincode'],
    },
  },
];

// ─── Agentic Tools (standard + auth + plan actions) ──────────────────────────
// Used by the full AI journey (conversational insurance purchase flow)
export const AGENTIC_TOOLS: Anthropic.Tool[] = [
  ...STANDARD_TOOLS,
  // Auth & onboarding
  {
    name: 'send_otp',
    description: 'Send a one-time password to the given mobile number for verification.',
    input_schema: {
      type: 'object',
      properties: { mobile: { type: 'string', description: '10-digit Indian mobile number' } },
      required: ['mobile'],
    },
  },
  {
    name: 'verify_otp',
    description: 'Verify the OTP entered by the user.',
    input_schema: {
      type: 'object',
      properties: { mobile: { type: 'string' }, otp: { type: 'string', description: '6-digit OTP' } },
      required: ['mobile', 'otp'],
    },
  },
  {
    name: 'create_or_get_lead',
    description: 'Create or retrieve a lead record for the given mobile number.',
    input_schema: {
      type: 'object',
      properties: {
        mobile: { type: 'string' },
        members: {
          type: 'object',
          properties: {
            self: { type: 'boolean' },
            spouse: { type: 'boolean' },
            kidsCount: { type: 'number' },
          },
        },
        eldestMemberAge: { type: 'number' },
      },
      required: ['mobile'],
    },
  },
  {
    name: 'create_application',
    description: 'Create an insurance application for an existing lead.',
    input_schema: {
      type: 'object',
      properties: { leadId: { type: 'string' } },
      required: ['leadId'],
    },
  },
  {
    name: 'update_pincode',
    description: "Save the user's pincode to their application.",
    input_schema: {
      type: 'object',
      properties: {
        applicationId: { type: 'string' },
        pincode: { type: 'string', description: '6-digit pincode' },
      },
      required: ['applicationId', 'pincode'],
    },
  },
  {
    name: 'declare_pre_existing',
    description: 'Record any pre-existing medical conditions declared by the user.',
    input_schema: {
      type: 'object',
      properties: {
        applicationId: { type: 'string' },
        conditions: { type: 'array', items: { type: 'string' } },
      },
      required: ['applicationId', 'conditions'],
    },
  },
  {
    name: 'check_eligibility',
    description: 'Check insurance eligibility for all members on the application.',
    input_schema: {
      type: 'object',
      properties: { applicationId: { type: 'string' } },
      required: ['applicationId'],
    },
  },
  // Plan action tools
  {
    name: 'select_plan',
    description: 'Persist the chosen plan configuration to the application record.',
    input_schema: {
      type: 'object',
      properties: {
        applicationId: { type: 'string' },
        planId: { type: 'string' },
        sumInsured: { type: 'number' },
        coverageLevel: { type: 'string', enum: ['INDIVIDUAL', 'FLOATER'] },
        tenureMonths: { type: 'number', enum: [12, 24] },
      },
      required: ['applicationId', 'planId', 'sumInsured', 'coverageLevel', 'tenureMonths'],
    },
  },
  {
    name: 'select_addons',
    description: 'Save the selected add-ons to the application.',
    input_schema: {
      type: 'object',
      properties: {
        applicationId: { type: 'string' },
        addonIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['applicationId', 'addonIds'],
    },
  },
  {
    name: 'save_proposer_details',
    description: "Save the proposer's full name and email to the application.",
    input_schema: {
      type: 'object',
      properties: {
        applicationId: { type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string' },
      },
      required: ['applicationId', 'fullName', 'email'],
    },
  },
  {
    name: 'initiate_payment',
    description: 'Create a payment record and return a redirect URL for the payment gateway.',
    input_schema: {
      type: 'object',
      properties: { applicationId: { type: 'string' } },
      required: ['applicationId'],
    },
  },
  // AI9: Query current application state from DB
  {
    name: 'get_application_state',
    description: 'Get the current status, step, selected plan summary, and member count for an application.',
    input_schema: {
      type: 'object',
      properties: { applicationId: { type: 'string', description: 'The application UUID' } },
      required: ['applicationId'],
    },
  },
];
