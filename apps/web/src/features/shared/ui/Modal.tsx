'use client';
import React, { useEffect, useCallback } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: ModalSize;
}

const maxWidths: Record<ModalSize, string> = {
  sm: 'max-w-sm',   // 384px
  md: 'max-w-lg',   // 512px
  lg: 'max-w-2xl',  // 640px
};

/**
 * Modal dialog with backdrop blur overlay, escape-key support, and opacity transition.
 * Click outside the card or press Escape to close.
 */
export default function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label={title}
      className={[
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-opacity duration-200',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className={[
          'relative w-full bg-white rounded-2xl shadow-xl z-10',
          maxWidths[size],
        ].join(' ')}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E31837]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
