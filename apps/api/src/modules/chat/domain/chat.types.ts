export type JourneyMode = "chat" | "agentic";

export interface AgenticHandoffPayload {
  applicationId: string;
  leadId: string;
  mobile: string;
  redirectPath: string;
}

export interface AgenticRedirectPayload {
  path: string;
  returnPath: string;
}

export interface AgenticStateUpdatePayload {
  phase?: string;
  members?: { self: boolean; spouse: boolean; kidsCount: number };
  eldestAge?: number;
  mobile?: string;
  pincode?: string;
  hospitalCount?: number;
  preExisting?: string[];
  planSelected?: { planId: string; name: string; premium: number };
  kycVerified?: boolean;
  healthSubmitted?: boolean;
}

export interface ChatSSEEvent {
  token?: string;
  done?: boolean;
  error?: string;
  stateUpdate?: AgenticStateUpdatePayload;
  redirect?: AgenticRedirectPayload;
  handoff?: AgenticHandoffPayload;
}

// Tool definitions for agentic mode (used in chat.service.ts)
export const AGENTIC_AUTH_TOOLS = [
  {
    name: "send_otp",
    description:
      "Send a 6-digit OTP to the user mobile number for identity verification. Call this when you have collected the user mobile number.",
    input_schema: {
      type: "object",
      properties: {
        mobile: {
          type: "string",
          description: "10-digit Indian mobile number starting with 6-9",
        },
      },
      required: ["mobile"],
    },
  },
  {
    name: "verify_otp",
    description:
      "Verify the OTP entered by the user. Call this after user provides the 6-digit code.",
    input_schema: {
      type: "object",
      properties: {
        mobile: { type: "string" },
        otp: { type: "string", description: "6-digit OTP code" },
      },
      required: ["mobile", "otp"],
    },
  },
  {
    name: "create_or_get_lead",
    description:
      "Create or retrieve a lead record with member information. Call this after OTP is verified.",
    input_schema: {
      type: "object",
      properties: {
        mobile: { type: "string" },
        members: {
          type: "object",
          properties: {
            self: { type: "boolean" },
            spouse: { type: "boolean" },
            kidsCount: { type: "number" },
          },
          required: ["self"],
        },
        eldestMemberAge: {
          type: "number",
          description: "Age of the eldest family member",
        },
      },
      required: ["mobile", "members", "eldestMemberAge"],
    },
  },
  {
    name: "create_application",
    description:
      "Create an insurance application for the lead. Call this immediately after create_or_get_lead.",
    input_schema: {
      type: "object",
      properties: {
        leadId: {
          type: "string",
          description: "Lead ID from create_or_get_lead result",
        },
      },
      required: ["leadId"],
    },
  },
  {
    name: "update_pincode",
    description:
      "Set the pincode for the application to find nearby hospitals.",
    input_schema: {
      type: "object",
      properties: {
        applicationId: { type: "string" },
        pincode: { type: "string", description: "6-digit Indian pincode" },
      },
      required: ["applicationId", "pincode"],
    },
  },
  {
    name: "declare_pre_existing",
    description:
      "Record pre-existing medical conditions declared by the user.",
    input_schema: {
      type: "object",
      properties: {
        applicationId: { type: "string" },
        conditions: {
          type: "array",
          items: { type: "string" },
          description:
            "List of conditions e.g. [\"diabetes\", \"hypertension\"]. Empty array if none.",
        },
      },
      required: ["applicationId", "conditions"],
    },
  },
  {
    name: "check_eligibility",
    description:
      "Check if all family members are eligible for health insurance coverage.",
    input_schema: {
      type: "object",
      properties: {
        applicationId: { type: "string" },
      },
      required: ["applicationId"],
    },
  },
] as const;
