import { z } from 'zod';

export const leadFormSchema = z.object({
  selfSelected: z.boolean(),
  spouseSelected: z.boolean(),
  kidsCount: z.number().min(0).max(4),
  eldestMemberAge: z
    .number({ error: 'Age is required' })
    .min(18, 'Must be at least 18 years old')
    .max(99, 'Must be under 100 years old'),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  consentGiven: z.literal(true, { error: 'You must agree to the terms' }),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const pincodeSchema = z.object({
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
});

export type PincodeValues = z.infer<typeof pincodeSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

export type OtpValues = z.infer<typeof otpSchema>;

export const proposerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long'),
  dob: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Enter a valid email address'),
});

export type ProposerValues = z.infer<typeof proposerSchema>;

export const bankDetailsSchema = z.object({
  accountNumber: z
    .string()
    .min(9, 'Account number must be at least 9 digits')
    .max(18, 'Account number is too long')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  bankName: z.string().min(2, 'Bank name is required'),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code'),
});

export type BankDetailsValues = z.infer<typeof bankDetailsSchema>;

export const panSchema = z.object({
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter a valid PAN number'),
  dob: z.string().min(1, 'Date of birth is required'),
});

export type PanValues = z.infer<typeof panSchema>;

export const aadharSchema = z.object({
  aadharNumber: z
    .string()
    .regex(/^\d{12}$/, 'Enter a valid 12-digit Aadhar number'),
  dob: z.string().min(1, 'Date of birth is required'),
});

export type AadharValues = z.infer<typeof aadharSchema>;

export const memberPersonalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid mobile number')
    .optional()
    .or(z.literal('')),
  dob: z.string().min(1, 'Date of birth is required'),
  heightFt: z.number().min(1, 'Height is required').max(8),
  heightIn: z.number().min(0).max(11),
  weightKg: z.number().min(10, 'Weight is required').max(300),
});

export type MemberPersonalValues = z.infer<typeof memberPersonalSchema>;
