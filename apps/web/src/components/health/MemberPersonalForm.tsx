'use client';

import { useState } from 'react';
import { TITLE_OPTIONS } from '@/lib/constants';

interface MemberPersonalFormProps {
  memberId: string;
  memberLabel: string;
  initialValues?: {
    title: string;
    firstName: string;
    lastName: string;
    mobile: string;
    dob: string;
    heightFt: number;
    heightIn: number;
    weightKg: number;
  };
  onSave: (data: {
    memberId: string;
    title: string;
    firstName: string;
    lastName: string;
    mobile: string;
    dob: string;
    heightFt: number;
    heightIn: number;
    weightKg: number;
  }) => void;
}

export default function MemberPersonalForm({
  memberId,
  memberLabel,
  initialValues,
  onSave,
}: MemberPersonalFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [firstName, setFirstName] = useState(initialValues?.firstName ?? '');
  const [lastName, setLastName] = useState(initialValues?.lastName ?? '');
  const [mobile, setMobile] = useState(initialValues?.mobile ?? '');
  const [dob, setDob] = useState(initialValues?.dob ?? '');
  const [heightFt, setHeightFt] = useState(initialValues?.heightFt ?? 0);
  const [heightIn, setHeightIn] = useState(initialValues?.heightIn ?? 0);
  const [weightKg, setWeightKg] = useState(initialValues?.weightKg ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title) e.title = 'Required';
    if (firstName.length < 2) e.firstName = 'Required';
    if (lastName.length < 2) e.lastName = 'Required';
    if (!dob) e.dob = 'Required';
    if (mobile && !/^\d{10}$/.test(mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (heightFt < 1 || heightFt > 8) e.height = 'Enter valid height';
    if (weightKg < 10 || weightKg > 300) e.weight = 'Enter valid weight';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ memberId, title, firstName, lastName, mobile, dob, heightFt, heightIn, weightKg });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <div className="w-6 h-6 bg-[#E31837] rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">
            {memberLabel.charAt(0)}
          </span>
        </div>
        {memberLabel}
      </h3>

      {/* Title and Name */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          >
            <option value="">Title</option>
            {TITLE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      {/* Mobile */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Mobile (optional)</label>
        <input
          type="tel"
          maxLength={10}
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="Mobile number"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
        />
        {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
      </div>

      {/* DOB */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
        />
        {errors.dob && <p className="mt-1 text-xs text-red-600">{errors.dob}</p>}
      </div>

      {/* Height and Weight */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Height (ft)</label>
          <input
            type="number"
            min={1}
            max={8}
            value={heightFt || ''}
            onChange={(e) => setHeightFt(parseInt(e.target.value) || 0)}
            placeholder="ft"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Height (in)</label>
          <input
            type="number"
            min={0}
            max={11}
            value={heightIn || ''}
            onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)}
            placeholder="in"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
          <input
            type="number"
            min={10}
            max={300}
            value={weightKg || ''}
            onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
            placeholder="kg"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          />
        </div>
      </div>
      {(errors.height || errors.weight) && (
        <p className="text-xs text-red-600">{errors.height || errors.weight}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-lg bg-gray-100 py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-200"
      >
        Save Details
      </button>
    </div>
  );
}
