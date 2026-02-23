import React from 'react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
}

const variantStyles: Record<AlertVariant, { wrapper: string; icon: string; title: string; body: string }> = {
  success: { wrapper: 'bg-green-50 border-green-200',  icon: 'text-green-700', title: 'text-green-800', body: 'text-green-700' },
  error:   { wrapper: 'bg-red-50 border-red-200',      icon: 'text-[#E31837]', title: 'text-red-900',   body: 'text-[#E31837]' },
  warning: { wrapper: 'bg-amber-50 border-amber-200',  icon: 'text-amber-700', title: 'text-amber-800', body: 'text-amber-700' },
  info:    { wrapper: 'bg-blue-50 border-blue-200',    icon: 'text-blue-700',  title: 'text-blue-800',  body: 'text-blue-700'  },
};

const icons: Record<AlertVariant, React.ReactNode> = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

/**
 * Inline alert banner with icon, optional title, dismiss button, and semantic color variants.
 * Server Component safe — visibility is controlled by the parent (render or not).
 */
export default function Alert({ variant, title, children, onDismiss }: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        styles.wrapper,
      ].join(' ')}
    >
      <span className={['flex-shrink-0 mt-0.5', styles.icon].join(' ')}>
        {icons[variant]}
      </span>

      <div className="flex-1 min-w-0">
        {title && (
          <p className={['font-semibold mb-0.5', styles.title].join(' ')}>{title}</p>
        )}
        {children && (
          <div className={styles.body}>{children}</div>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className={['flex-shrink-0 mt-0.5 p-0.5 rounded hover:opacity-70 transition-opacity focus:outline-none', styles.icon].join(' ')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
