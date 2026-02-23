'use client';

import { useState } from 'react';
import { useSubmitPostLead } from '../hooks/useSubmitPostLead';

interface LeadCaptureWidgetProps {
  slug: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export default function LeadCaptureWidget({ slug, utmSource, utmMedium, utmCampaign }: LeadCaptureWidgetProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const { submit, loading, success, error } = useSubmitPostLead(slug);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ name: name.trim() || undefined, mobile: mobile.trim(), utmSource, utmMedium, utmCampaign });
  };

  if (success) {
    return (
      <div className="my-8 p-6 bg-green-50 rounded-2xl border border-green-100 text-center">
        <div className="text-green-600 text-2xl mb-2">✓</div>
        <p className="font-semibold text-green-800">Thanks! We'll be in touch soon.</p>
        <p className="text-sm text-green-600 mt-1">Our team will call you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-100">
      <h3 className="font-bold text-gray-900 text-lg mb-1">Get personalised advice</h3>
      <p className="text-sm text-gray-500 mb-4">Leave your details — our experts will call you at no cost.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <input
          type="tel"
          placeholder="Mobile number *"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          maxLength={10}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          required
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || mobile.length !== 10}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          {loading ? 'Submitting…' : 'Request a Call Back'}
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-3 text-center">No spam. We respect your privacy.</p>
    </div>
  );
}
