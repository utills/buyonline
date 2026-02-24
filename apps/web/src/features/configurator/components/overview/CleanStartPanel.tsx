'use client';

import React, { useState } from 'react';
import { API_BASE_URL } from '@/lib/constants';

// Keys to clear from browser storage
const SESSION_STORAGE_KEYS_TO_CLEAR: string[] = [
  'buyonline-journey',
  'buyonline-lead',
  'buyonline-onboarding',
  'buyonline-kyc',
  'buyonline-health',
  'buyonline-quote',
  'buyonline-payment',
  'buyonline-agentic',
];

const LOCAL_STORAGE_KEYS_TO_CLEAR: string[] = [
  'buyonline-configurator',
];

type Step = 'idle' | 'confirming' | 'running' | 'done' | 'error';

interface CleanResult {
  leads: number;
  applications: number;
  otpAttempts: number;
  postLeads: number;
  journeyConfigs: number;
  redis: string;
}

function clearBrowserStorage() {
  SESSION_STORAGE_KEYS_TO_CLEAR.forEach((k) => {
    try { sessionStorage.removeItem(k); } catch { /* ignore */ }
  });
  LOCAL_STORAGE_KEYS_TO_CLEAR.forEach((k) => {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  });
}

export const CleanStartPanel: React.FC = () => {
  const [step, setStep] = useState<Step>('idle');
  const [result, setResult] = useState<CleanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCleanStart = async () => {
    setStep('running');
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/configurator/clean-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { success: boolean; details: CleanResult; message: string };

      if (!data.success) throw new Error('Server returned failure');

      // Clear browser storage after server confirms
      clearBrowserStorage();
      setResult(data.details);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
    }
  };

  const handleReload = () => {
    window.location.href = '/configurator';
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'rgba(227,24,55,0.05)',
        border: '1px solid rgba(227,24,55,0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(227,24,55,0.15)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--cfg-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 1.5v3M9 13.5v3M1.5 9h3M13.5 9h3M3.7 3.7l2.1 2.1M12.2 12.2l2.1 2.1M3.7 14.3l2.1-2.1M12.2 5.8l2.1-2.1" />
            <circle cx="9" cy="9" r="3" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--cfg-accent)' }}>
            Clean Start
          </div>
          <div className="text-xs" style={{ color: 'var(--cfg-text-muted)' }}>
            Wipes all transaction data (leads, applications, OTPs, payments), flushes Redis session cache,
            resets the configurator, and clears all browser storage. Reference data (plans, addons, hospitals)
            is preserved. Use this to get a fresh testing environment.
          </div>
        </div>
      </div>

      {/* State: idle */}
      {step === 'idle' && (
        <button
          onClick={() => setStep('confirming')}
          className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
          style={{
            background: 'rgba(227,24,55,0.12)',
            color: 'var(--cfg-accent)',
            border: '1px solid rgba(227,24,55,0.3)',
          }}
        >
          Clean Start
        </button>
      )}

      {/* State: confirming */}
      {step === 'confirming' && (
        <div className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(227,24,55,0.3)' }}>
          <p className="text-sm font-semibold" style={{ color: '#F87171' }}>
            This will permanently delete:
          </p>
          <ul className="text-xs space-y-1" style={{ color: 'var(--cfg-text-muted)' }}>
            <li>• All leads and applications</li>
            <li>• OTP attempts, payments, KYC records</li>
            <li>• Health declarations, proposer details</li>
            <li>• Resume tokens, post leads</li>
            <li>• All journey configuration</li>
            <li>• Redis session data</li>
            <li>• All browser storage (all stores)</li>
          </ul>
          <p className="text-xs font-medium" style={{ color: '#F87171' }}>
            Plans, addons, hospitals and health questions are NOT deleted.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCleanStart}
              className="text-sm font-bold px-4 py-2 rounded-lg transition-all"
              style={{ background: 'var(--cfg-accent)', color: '#fff' }}
            >
              Yes, wipe everything
            </button>
            <button
              onClick={() => setStep('idle')}
              className="text-sm px-4 py-2 rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--cfg-text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* State: running */}
      {step === 'running' && (
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--cfg-text-muted)' }}>
          <svg className="animate-spin w-4 h-4" style={{ color: 'var(--cfg-accent)' }} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Wiping data and flushing Redis...
        </div>
      )}

      {/* State: done */}
      {step === 'done' && result && (
        <div className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <p className="text-sm font-semibold" style={{ color: '#34D399' }}>
            Clean start complete
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--cfg-text-muted)' }}>
            <span>Leads deleted: <strong style={{ color: 'var(--cfg-text)' }}>{result.leads}</strong></span>
            <span>Applications: <strong style={{ color: 'var(--cfg-text)' }}>{result.applications}</strong></span>
            <span>OTP attempts: <strong style={{ color: 'var(--cfg-text)' }}>{result.otpAttempts}</strong></span>
            <span>Post leads: <strong style={{ color: 'var(--cfg-text)' }}>{result.postLeads}</strong></span>
            <span>Configs reset: <strong style={{ color: 'var(--cfg-text)' }}>{result.journeyConfigs}</strong></span>
            <span>Redis: <strong style={{ color: 'var(--cfg-text)' }}>{result.redis}</strong></span>
          </div>
          <p className="text-xs" style={{ color: 'var(--cfg-text-muted)' }}>
            Browser storage cleared. Reload to apply default config.
          </p>
          <button
            onClick={handleReload}
            className="text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            Reload Configurator
          </button>
        </div>
      )}

      {/* State: error */}
      {step === 'error' && (
        <div className="rounded-lg p-4 space-y-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <p className="text-sm font-semibold" style={{ color: '#F87171' }}>Failed: {error}</p>
          <button
            onClick={() => setStep('idle')}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--cfg-text-muted)' }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};
