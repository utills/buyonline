'use client';

import { useState } from 'react';
import { useKycStore } from '@/stores/useKycStore';

interface AadharFormProps {
  onSubmit: () => void;
  onDigiLocker: () => void;
}

export default function AadharForm({ onSubmit, onDigiLocker }: AadharFormProps) {
  const { aadharNumber, dob, setAadharNumber, setDob } = useKycStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!/^\d{12}$/.test(aadharNumber)) {
      newErrors.aadhar = 'Enter a valid 12-digit Aadhar number';
    }
    if (!dob) {
      newErrors.dob = 'Date of birth is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit();
  };

  const formatAadhar = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 12);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Aadhar Number
        </label>
        <input
          type="text"
          maxLength={14}
          placeholder="1234 5678 9012"
          value={formatAadhar(aadharNumber)}
          onChange={(e) =>
            setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 tracking-widest focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
        />
        {errors.aadhar && (
          <p className="mt-1 text-xs text-red-600">{errors.aadhar}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Date of Birth
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
        />
        {errors.dob && (
          <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D]"
      >
        Verify Aadhar
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">OR</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onDigiLocker}
        className="w-full rounded-lg border-2 border-blue-500 py-3 px-6 text-blue-600 font-semibold hover:bg-blue-50 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Verify via DigiLocker
      </button>
    </form>
  );
}
