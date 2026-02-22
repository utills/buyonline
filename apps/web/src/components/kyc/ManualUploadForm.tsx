'use client';

import { useState } from 'react';
import { useKycStore } from '@/stores/useKycStore';
import { useFileUpload } from '@/hooks/useFileUpload';
import { DocumentType } from '@buyonline/shared-types';
import { IDENTITY_PROOF_OPTIONS, ADDRESS_PROOF_OPTIONS, FILE_UPLOAD } from '@/lib/constants';

interface ManualUploadFormProps {
  onSubmit: () => void;
}

export default function ManualUploadForm({ onSubmit }: ManualUploadFormProps) {
  const { setIdentityProof, setAddressProof } = useKycStore();
  const [identityType, setIdentityType] = useState('');
  const [addressType, setAddressType] = useState('');
  const identityUpload = useFileUpload({ endpoint: '/api/v1/uploads' });
  const addressUpload = useFileUpload({ endpoint: '/api/v1/uploads' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleIdentityFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await identityUpload.upload(file);
    if (url && identityType) {
      setIdentityProof(identityType as DocumentType, url);
    }
  };

  const handleAddressFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await addressUpload.upload(file);
    if (url && addressType) {
      setAddressProof(addressType as DocumentType, url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!identityType) newErrors.identityType = 'Select identity proof type';
    if (!identityUpload.file) newErrors.identityFile = 'Upload identity proof';
    else if (identityUpload.error) newErrors.identityFile = 'Upload failed — please try again';
    if (!addressType) newErrors.addressType = 'Select address proof type';
    if (!addressUpload.file) newErrors.addressFile = 'Upload address proof';
    else if (addressUpload.error) newErrors.addressFile = 'Upload failed — please try again';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity Proof */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Identity Proof</h4>
        <select
          value={identityType}
          onChange={(e) => setIdentityType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
        >
          <option value="">Select document type</option>
          {IDENTITY_PROOF_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.identityType && (
          <p className="text-xs text-red-600">{errors.identityType}</p>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#E31837] transition-colors">
          {identityUpload.file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700 truncate">{identityUpload.file.name}</span>
              </div>
              <button type="button" onClick={identityUpload.removeFile} className="text-red-500 text-sm hover:underline">
                Remove
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">Upload document</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max {FILE_UPLOAD.maxSizeMB}MB)</p>
              <input
                type="file"
                className="hidden"
                accept={FILE_UPLOAD.acceptedExtensions}
                onChange={handleIdentityFileChange}
              />
            </label>
          )}
          {identityUpload.isUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-[#E31837] h-1.5 rounded-full transition-all" style={{ width: `${identityUpload.progress}%` }} />
              </div>
            </div>
          )}
        </div>
        {identityUpload.error && <p className="text-xs text-red-600">{identityUpload.error}</p>}
        {errors.identityFile && <p className="text-xs text-red-600">{errors.identityFile}</p>}
      </div>

      {/* Address Proof */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Address Proof</h4>
        <select
          value={addressType}
          onChange={(e) => setAddressType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837]"
        >
          <option value="">Select document type</option>
          {ADDRESS_PROOF_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.addressType && (
          <p className="text-xs text-red-600">{errors.addressType}</p>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#E31837] transition-colors">
          {addressUpload.file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700 truncate">{addressUpload.file.name}</span>
              </div>
              <button type="button" onClick={addressUpload.removeFile} className="text-red-500 text-sm hover:underline">
                Remove
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">Upload document</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max {FILE_UPLOAD.maxSizeMB}MB)</p>
              <input
                type="file"
                className="hidden"
                accept={FILE_UPLOAD.acceptedExtensions}
                onChange={handleAddressFileChange}
              />
            </label>
          )}
          {addressUpload.isUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-[#E31837] h-1.5 rounded-full transition-all" style={{ width: `${addressUpload.progress}%` }} />
              </div>
            </div>
          )}
        </div>
        {addressUpload.error && <p className="text-xs text-red-600">{addressUpload.error}</p>}
        {errors.addressFile && <p className="text-xs text-red-600">{errors.addressFile}</p>}
      </div>

      <button
        type="submit"
        disabled={identityUpload.isUploading || addressUpload.isUploading}
        className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Documents
      </button>
    </form>
  );
}
