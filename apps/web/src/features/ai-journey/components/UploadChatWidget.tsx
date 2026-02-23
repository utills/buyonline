'use client';

import { useCallback, useRef, useState } from 'react';

interface UploadChatWidgetProps {
  onUpload: (file: File) => void;
  label?: string;
  accept?: string;
}

export function UploadChatWidget({
  onUpload,
  label = 'Upload Document',
  accept = '.pdf,.jpg,.jpeg,.png',
}: UploadChatWidgetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        onUpload(file);
      }
    },
    [onUpload]
  );

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-600 hover:border-[#E31837] hover:text-[#E31837] transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        {fileName ? fileName : label}
      </button>
      {fileName && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Uploaded
        </p>
      )}
    </div>
  );
}
