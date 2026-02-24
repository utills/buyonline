'use client';

import { useState } from 'react';
import { useKycStore } from '@/stores/useKycStore';

interface PanFormProps {
  onSubmit: () => void;
}

export default function PanForm({ onSubmit }: PanFormProps) {
  const { panNumber, dob, setPanNumber, setDob } = useKycStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) {
      newErrors.pan = 'Enter a valid PAN number (e.g., ABCDE1234F)';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          PAN Number
        </label>
        <input
          type="text"
          maxLength={10}
          placeholder="ABCDE1234F"
          value={panNumber}
          onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 uppercase tracking-widest focus:border-[#ED1B2D] focus:ring-1 focus:ring-[#ED1B2D]"
        />
        {errors.pan && (
          <p className="mt-1 text-xs text-red-600">{errors.pan}</p>
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
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#ED1B2D] focus:ring-1 focus:ring-[#ED1B2D]"
        />
        {errors.dob && (
          <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-[#ED1B2D] py-3 px-6 text-white font-semibold hover:bg-[#C8162A]"
      >
        Verify PAN
      </button>
    </form>
  );
}
