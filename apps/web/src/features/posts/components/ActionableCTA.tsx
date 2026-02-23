import Link from 'next/link';

interface ActionableCTAProps {
  label?: string;
  ctaType?: 'journey' | 'plan';
  ctaPlanId?: string;
}

export default function ActionableCTA({ label, ctaType, ctaPlanId }: ActionableCTAProps) {
  const href = ctaType === 'plan' && ctaPlanId ? `/?plan=${ctaPlanId}` : '/';
  const text = label || 'Get Covered Now';

  return (
    <div className="my-8 p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
      <p className="text-sm text-gray-600 mb-3">Ready to protect your family?</p>
      <Link
        href={href}
        className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
      >
        {text}
      </Link>
    </div>
  );
}
