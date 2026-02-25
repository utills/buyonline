'use client';

import { useJourneyStore } from '@/stores/useJourneyStore';
import { usePaymentStore } from '@/stores/usePaymentStore';
import ApplicationSummary from '@/components/complete/ApplicationSummary';
import SatisfactionRating from '@/components/complete/SatisfactionRating';

export default function CompletePage() {
  const { applicationId } = useJourneyStore();
  const { proposer, amount } = usePaymentStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <ApplicationSummary
          applicationId={applicationId ?? 'N/A'}
          planName="Health Shield Signature"
          totalPremium={amount || 14160}
          proposerName={
            proposer
              ? `${proposer.firstName} ${proposer.lastName}`
              : 'N/A'
          }
          status="Submitted"
        />

        <SatisfactionRating onRate={(rating) => console.log('Rating:', rating)} />

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="text-base font-semibold text-gray-900">What happens next?</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Our team will review your application within 24-48 hours' },
              { step: '2', text: 'You will receive policy documents on your registered email' },
              { step: '3', text: 'Your policy will be active from the date of issuance' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#ED1B2D] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white font-bold">{item.step}</span>
                </div>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">Need help?</p>
          <a
            href="tel:18001234567"
            className="inline-flex items-center gap-2 text-[#ED1B2D] font-medium text-sm hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call 1800-123-4567
          </a>
        </div>

        {/* Footer */}
        <footer className="bg-[#1A1A1A] text-white py-6 px-5 rounded-xl mt-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/prudential-logo.svg" alt="Prudential" className="h-5 w-auto brightness-0 invert" />
            </div>
            <p className="text-xs text-gray-400">
              IRDAI Registration No: XYZ123. Insurance is the subject matter of solicitation.
            </p>
            <p className="text-xs text-gray-500">
              &copy; 2026 Prudential Health Insurance. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
