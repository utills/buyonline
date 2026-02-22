'use client';

import React, { useRef, useState, useCallback } from 'react';

export interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  preview?: string;
  error?: string;
  label?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = 'PDF,JPG,PNG',
  maxSizeMB = 10,
  onUpload,
  onRemove,
  preview,
  error,
  label,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const acceptMime = accept
    .split(',')
    .map((ext) => {
      const e = ext.trim().toLowerCase();
      if (e === 'pdf') return '.pdf';
      if (e === 'jpg' || e === 'jpeg') return '.jpg,.jpeg';
      if (e === 'png') return '.png';
      return `.${e}`;
    })
    .join(',');

  const validateFile = useCallback(
    (file: File): string | null => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        return `File size exceeds ${maxSizeMB}MB limit`;
      }
      return null;
    },
    [maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) return;
      onUpload?.(file);
    },
    [validateFile, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (preview) {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <div className="relative rounded-lg border border-gray-300 p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {preview.match(/\.(jpg|jpeg|png|gif|webp)$/i) || preview.startsWith('data:image') ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2V8H20" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 truncate">File uploaded</p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors p-1"
              aria-label="Remove file"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={[
          'rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors duration-200',
          isDragging
            ? 'border-[#E31837] bg-red-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptMime}
          onChange={handleInputChange}
          className="sr-only"
        />
        <svg className="mx-auto mb-2" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 22V10M16 10L11 15M16 10L21 15" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 20V24C6 25.1 6.9 26 8 26H24C25.1 26 26 25.1 26 24V20" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-gray-600 font-medium">
          Drop file here or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {accept} - Max {maxSizeMB}MB
        </p>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
