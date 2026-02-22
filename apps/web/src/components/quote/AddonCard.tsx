'use client';

import { Addon } from '@buyonline/shared-types';

interface AddonCardProps {
  addon: Addon;
  isSelected: boolean;
  onToggle: (addonId: string) => void;
}

export default function AddonCard({ addon, isSelected, onToggle }: AddonCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 transition-all ${
        isSelected ? 'border-[#E31837] bg-red-50/30' : 'border-gray-200'
      }`}
    >
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(addon.id)}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-[#E31837] focus:ring-[#E31837]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900">{addon.name}</h4>
            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
              Rs {addon.price.toLocaleString('en-IN')}
            </span>
          </div>
          {addon.description && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {addon.description}
            </p>
          )}
          {addon.isIncludedInBundle && (
            <span className="inline-block mt-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Included in bundle
            </span>
          )}
        </div>
      </label>
    </div>
  );
}
