'use client';

import { Addon } from '@buyonline/shared-types';
import AddonCard from './AddonCard';

interface AddonsListProps {
  addons: Addon[];
  selectedAddonIds: string[];
  onToggle: (addonId: string) => void;
}

export default function AddonsList({
  addons,
  selectedAddonIds,
  onToggle,
}: AddonsListProps) {
  const safeAddons = addons ?? [];
  const safeSelectedAddonIds = selectedAddonIds ?? [];

  const bundleAddons = safeAddons.filter((a) => a.isIncludedInBundle);
  const otherAddons = safeAddons.filter((a) => !a.isIncludedInBundle);

  const selectedTotal = safeAddons
    .filter((a) => safeSelectedAddonIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="space-y-6">
      {/* Bundle Add-ons */}
      {bundleAddons.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-semibold text-gray-900">
              Bundle Add-ons
            </h3>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Recommended
            </span>
          </div>
          <div className="space-y-3">
            {bundleAddons.map((addon) => (
              <AddonCard
                key={addon.id}
                addon={addon}
                isSelected={safeSelectedAddonIds.includes(addon.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Add-ons */}
      {otherAddons.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Optional Add-ons
          </h3>
          <div className="space-y-3">
            {otherAddons.map((addon) => (
              <AddonCard
                key={addon.id}
                addon={addon}
                isSelected={safeSelectedAddonIds.includes(addon.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      {safeSelectedAddonIds.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {safeSelectedAddonIds.length} add-on{safeSelectedAddonIds.length > 1 ? 's' : ''} selected
          </span>
          <span className="text-base font-bold text-gray-900">
            + Rs {selectedTotal.toLocaleString('en-IN')}
          </span>
        </div>
      )}
    </div>
  );
}
