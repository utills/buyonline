'use client';

interface PaymentSuccessProps {
  transactionId: string;
  amount: number;
  onContinue: () => void;
}

export default function PaymentSuccess({
  transactionId,
  amount,
  onContinue,
}: PaymentSuccessProps) {
  return (
    <div className="text-center space-y-6 py-8">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your payment has been processed successfully.
        </p>
      </div>

      {/* Transaction Details */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Transaction ID</span>
          <span className="font-medium text-gray-900">{transactionId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Amount Paid</span>
          <span className="font-bold text-gray-900">
            Rs {amount.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Success
          </span>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full rounded-lg bg-[#ED1B2D] py-3 px-6 text-white font-semibold hover:bg-[#C8162A]"
      >
        Continue
      </button>
    </div>
  );
}
