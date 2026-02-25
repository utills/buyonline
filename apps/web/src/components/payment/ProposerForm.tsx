'use client';

import { useState } from 'react';
import { usePaymentStore } from '@/stores/usePaymentStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { apiClient } from '@/lib/api-client';

interface ProposerFormProps {
  onSubmit: () => void;
}

export default function ProposerForm({ onSubmit }: ProposerFormProps) {
  const { proposer, setProposer } = usePaymentStore();
  const { applicationId } = useJourneyStore();
  const [firstName, setFirstName] = useState(proposer?.firstName ?? '');
  const [lastName, setLastName] = useState(proposer?.lastName ?? '');
  const [dob, setDob] = useState(proposer?.dob ?? '');
  const [email, setEmail] = useState(proposer?.email ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (firstName.length < 2) newErrors.firstName = 'First name is required';
    if (lastName.length < 2) newErrors.lastName = 'Last name is required';
    if (!dob) newErrors.dob = 'Date of birth is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (applicationId) {
        await apiClient.post(`/api/v1/applications/${applicationId}/proposer`, {
          firstName,
          lastName,
          dob,
          email,
        });
      }
    } catch {
      // Non-fatal — store locally and continue
    } finally {
      setIsSubmitting(false);
    }
    setProposer({ firstName, lastName, dob, email });
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#ED1B2D] focus:ring-1 focus:ring-[#ED1B2D]"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#ED1B2D] focus:ring-1 focus:ring-[#ED1B2D]"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Date of Birth
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#ED1B2D] focus:ring-1 focus:ring-[#ED1B2D]"
        />
        {errors.dob && (
          <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#ED1B2D] focus:ring-1 focus:ring-[#ED1B2D]"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-[#ED1B2D] py-3 px-6 text-white font-semibold hover:bg-[#C8162A] disabled:opacity-40"
      >
        {isSubmitting ? 'Saving...' : 'Proceed to Payment'}
      </button>
    </form>
  );
}
