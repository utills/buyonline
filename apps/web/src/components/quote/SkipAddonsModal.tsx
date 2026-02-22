'use client';

interface SkipAddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}

export default function SkipAddonsModal({
  isOpen,
  onClose,
  onSkip,
}: SkipAddonsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl sm:rounded-2xl p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            Continue without add-ons?
          </h3>
          <p className="text-sm text-gray-500">
            Add-ons enhance your coverage with additional benefits. Are you sure you want to skip them?
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D]"
            >
              View Add-ons
            </button>
            <button
              onClick={onSkip}
              className="w-full rounded-lg border border-gray-300 py-3 px-6 text-gray-600 font-semibold hover:bg-gray-50"
            >
              Skip Add-ons
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
