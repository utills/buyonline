'use client';

import { PlanSummary as PlanSummaryType } from '@buyonline/shared-types';
import { PLAN_TIER_LABELS } from '@/lib/constants';

interface PlanSummaryProps {
  summary: PlanSummaryType;
}

export default function PlanSummary({ summary }: PlanSummaryProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E31837] to-[#B8132D] p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
              {PLAN_TIER_LABELS[summary.planTier]}
            </span>
            <h3 className="text-lg font-bold mt-0.5">{summary.planName}</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              Rs {summary.totalPremium.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-white/70">
              Rs {summary.monthlyPremium.toLocaleString('en-IN')}/month
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        {/* Coverage Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Sum Insured</p>
            <p className="text-sm font-semibold text-gray-900">
              {summary.sumInsuredLabel}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tenure</p>
            <p className="text-sm font-semibold text-gray-900">
              {summary.tenureMonths / 12} year{summary.tenureMonths / 12 > 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Coverage</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {summary.coverageLevel.toLowerCase()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Members</p>
            <p className="text-sm font-semibold text-gray-900">
              {summary.membersCount} ({(summary.memberLabels ?? []).join(', ')})
            </p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Premium Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Premium Breakdown</h4>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Premium</span>
            <span className="text-gray-900">
              Rs {summary.basePremium.toLocaleString('en-IN')}
            </span>
          </div>

          {(summary.addons ?? []).length > 0 && (
            <>
              {(summary.addons ?? []).map((addon) => (
                <div key={addon.name} className="flex justify-between text-sm">
                  <span className="text-gray-600">{addon.name}</span>
                  <span className="text-gray-900">
                    Rs {addon.price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </>
          )}

          {summary.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount</span>
              <span className="text-green-600">
                - Rs {summary.discountAmount.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST (18%)</span>
            <span className="text-gray-900">
              Rs {summary.gstAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <hr className="border-gray-100" />

          <div className="flex justify-between text-base font-bold">
            <span className="text-gray-900">Total Premium</span>
            <span className="text-[#E31837]">
              Rs {summary.totalPremium.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
