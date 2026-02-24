'use client';

import { KycMethod } from '@buyonline/shared-types';

interface KycMethodCardProps {
  method: KycMethod;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: (method: KycMethod) => void;
  badge?: string;
}

export default function KycMethodCard({
  method,
  title,
  description,
  isSelected,
  onSelect,
  badge,
}: KycMethodCardProps) {
  const icons: Record<KycMethod, string> = {
    [KycMethod.CKYC]: 'C',
    [KycMethod.EKYC]: 'E',
    [KycMethod.MANUAL]: 'M',
  };

  return (
    <button
      onClick={() => onSelect(method)}
      className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
        isSelected
          ? 'border-[#ED1B2D] bg-red-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
          isSelected
            ? 'bg-[#ED1B2D] text-white'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {icons[method]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          {badge && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
          isSelected ? 'border-[#ED1B2D]' : 'border-gray-300'
        }`}
      >
        {isSelected && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#ED1B2D]" />
        )}
      </div>
    </button>
  );
}
