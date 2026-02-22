'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHealthStore } from '@/stores/useHealthStore';

export default function BankDetailsPage() {
  const router = useRouter();
  const { bankDetails, setBankDetails } = useHealthStore();
  const [accountNumber, setAccountNumber] = useState(bankDetails?.accountNumber ?? '');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [bankName, setBankName] = useState(bankDetails?.bankName ?? '');
  const [ifscCode, setIfscCode] = useState(bankDetails?.ifscCode ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (accountNumber.length < 9) e.account = 'Enter a valid account number';
    if (accountNumber !== confirmAccount) e.confirm = 'Account numbers do not match';
    if (bankName.length < 2) e.bank = 'Bank name is required';
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) e.ifsc = 'Enter a valid IFSC code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBankDetails({ accountNumber, bankName, ifscCode });
    router.push('/lifestyle');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Bank Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Required for premium refunds and claims settlement
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Account Number
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={18}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter account number"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          />
          {errors.account && <p className="mt-1 text-xs text-red-600">{errors.account}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm Account Number
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={18}
            value={confirmAccount}
            onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, ''))}
            placeholder="Re-enter account number"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          />
          {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bank Name
          </label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. State Bank of India"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          />
          {errors.bank && <p className="mt-1 text-xs text-red-600">{errors.bank}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            IFSC Code
          </label>
          <input
            type="text"
            maxLength={11}
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            placeholder="e.g. SBIN0001234"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 uppercase tracking-wider focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
          />
          {errors.ifsc && <p className="mt-1 text-xs text-red-600">{errors.ifsc}</p>}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D]"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
