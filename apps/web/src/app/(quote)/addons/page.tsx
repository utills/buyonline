'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import AddonsList from '@/components/quote/AddonsList';
import SkipAddonsModal from '@/components/quote/SkipAddonsModal';
import { apiClient } from '@/lib/api-client';
import type { Addon } from '@buyonline/shared-types';
import { useJourneyConfig } from '@/features/configurator/hooks/useJourneyConfig';

export default function AddonsPage() {
  const router = useRouter();
  const { addons, selectedAddonIds, selectedPlanId, setAddons, toggleAddon } = useQuoteStore();
  const { applicationId } = useJourneyStore();
  const { isAddonEnabled } = useJourneyConfig();
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!selectedPlanId) return;
    const fetchAddons = async () => {
      try {
        const response = await apiClient.get<Addon[]>(
          `/api/v1/plans/${selectedPlanId}/addons`
        );
        setAddons(response);
      } catch {
        // Use empty state
      }
    };
    fetchAddons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeSelectedAddonIds = selectedAddonIds ?? [];

  const saveAddonsAndNavigate = async () => {
    setIsSaving(true);
    try {
      if (applicationId) {
        await apiClient.post(`/api/v1/applications/${applicationId}/addons`, {
          addonIds: safeSelectedAddonIds,
        });
      }
    } catch {
      // Non-fatal
    } finally {
      setIsSaving(false);
    }
    router.push('/summary');
  };

  const handleContinue = () => {
    if (safeSelectedAddonIds.length === 0) {
      setShowSkipModal(true);
    } else {
      saveAddonsAndNavigate();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Enhance your plan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add extra protection with these add-ons
        </p>
      </div>

      <AddonsList
        addons={(addons ?? []).filter((a) => isAddonEnabled(a.id))}
        selectedAddonIds={safeSelectedAddonIds}
        onToggle={toggleAddon}
      />

      <button
        onClick={handleContinue}
        disabled={isSaving}
        className="w-full rounded-lg bg-[#ED1B2D] py-3 px-6 text-white font-semibold hover:bg-[#C8162A] disabled:opacity-40"
      >
        {isSaving ? 'Saving...' : 'Continue'}
      </button>

      <SkipAddonsModal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onSkip={saveAddonsAndNavigate}
      />
    </div>
  );
}
