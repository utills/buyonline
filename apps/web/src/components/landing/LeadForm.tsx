'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/stores/useLeadStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { apiClient } from '@/lib/api-client';
import type { LeadResponse } from '@buyonline/shared-types';

export default function LeadForm() {
  const router = useRouter();
  const { members, eldestMemberAge, mobile, consentGiven, setEldestMemberAge, setMobile, setConsentGiven } =
    useLeadStore();
  const safeMembers = members ?? { self: true, spouse: false, kidsCount: 0 };
  const { setLeadId } = useJourneyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!safeMembers.self && !safeMembers.spouse && safeMembers.kidsCount === 0) {
      newErrors.members = 'Select at least one member';
    }

    if (!eldestMemberAge || eldestMemberAge < 18 || eldestMemberAge > 99) {
      newErrors.age = 'Enter age between 18 and 99';
    }

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!consentGiven) {
      newErrors.consent = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post<LeadResponse>('/api/v1/leads', {
        mobile,
        countryCode: '+91',
        members: {
          self: safeMembers.self,
          spouse: safeMembers.spouse,
          kidsCount: safeMembers.kidsCount,
          father: false,
          mother: false,
          fatherInLaw: false,
          motherInLaw: false,
        },
        eldestMemberAge,
        consentGiven,
      });

      setLeadId(response.id);

      // Send OTP after lead creation
      const otpResponse = await apiClient.post<{ message: string; otp?: string }>('/api/v1/otp/send', {
        mobile,
        purpose: 'LOGIN',
      });
      // DEV ONLY: log OTP to console for testing
      if (otpResponse.otp) {
        console.log(`[DEV] OTP for ${mobile}: ${otpResponse.otp}`);
      }

      router.push('/otp-verify');
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Age Input */}
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1.5">
          Age of eldest member
        </label>
        <input
          id="age"
          type="number"
          min={18}
          max={99}
          placeholder="Enter age"
          value={eldestMemberAge ?? ''}
          onChange={(e) => setEldestMemberAge(parseInt(e.target.value) || 0)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
        />
        {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
      </div>

      {/* Phone Input */}
      <div>
        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1.5">
          Mobile Number
        </label>
        <div className="flex">
          <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm font-medium">
            +91
          </div>
          <input
            id="mobile"
            type="tel"
            maxLength={10}
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="flex-1 rounded-r-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          />
        </div>
        {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#E31837] focus:ring-[#E31837]"
        />
        <span className="text-xs text-gray-500 leading-relaxed">
          I agree to the{' '}
          <a href="/terms" className="text-[#E31837] underline">
            Terms & Conditions
          </a>{' '}
          and authorize Prudential to contact me regarding my application.
        </span>
      </label>
      {errors.consent && <p className="text-xs text-red-600">{errors.consent}</p>}

      {/* Errors */}
      {errors.members && <p className="text-xs text-red-600">{errors.members}</p>}
      {errors.submit && <p className="text-xs text-red-600">{errors.submit}</p>}

      {/* CTA Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-[#E31837] py-3.5 px-6 text-white font-semibold text-base hover:bg-[#B8132D] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          'Get the Best Offer'
        )}
      </button>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>Your information is safe and encrypted</span>
      </div>
    </form>
  );
}
