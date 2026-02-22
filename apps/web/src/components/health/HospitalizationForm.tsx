'use client';

import { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FILE_UPLOAD } from '@/lib/constants';

interface HospitalizationFormProps {
  onSave: (data: {
    reason: string;
    isDischargeSummaryAvailable: boolean;
    dischargeSummaryUrl?: string;
    medicationName?: string;
    investigationName?: string;
    symptomName?: string;
    treatmentName?: string;
  }) => void;
}

export default function HospitalizationForm({ onSave }: HospitalizationFormProps) {
  const [reason, setReason] = useState('');
  const [hasDischargeSummary, setHasDischargeSummary] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [investigationName, setInvestigationName] = useState('');
  const [symptomName, setSymptomName] = useState('');
  const [treatmentName, setTreatmentName] = useState('');
  const dischargeUpload = useFileUpload({ endpoint: '/api/v1/uploads' });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await dischargeUpload.upload(file);
    }
  };

  const handleSave = () => {
    onSave({
      reason,
      isDischargeSummaryAvailable: hasDischargeSummary,
      dischargeSummaryUrl: dischargeUpload.file?.url,
      medicationName: medicationName || undefined,
      investigationName: investigationName || undefined,
      symptomName: symptomName || undefined,
      treatmentName: treatmentName || undefined,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Reason for hospitalization
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Please describe the reason for hospitalization..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E31837] focus:ring-1 focus:ring-[#E31837] resize-none"
        />
      </div>

      {/* Discharge Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-sm font-medium text-gray-900">
          Do you have a discharge summary?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setHasDischargeSummary(true)}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
              hasDischargeSummary
                ? 'bg-[#E31837] text-white border-[#E31837]'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setHasDischargeSummary(false)}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
              !hasDischargeSummary
                ? 'bg-gray-100 text-gray-800 border-gray-300'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            No
          </button>
        </div>

        {hasDischargeSummary && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
            {dischargeUpload.file ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 truncate">{dischargeUpload.file.name}</span>
                <button type="button" onClick={dischargeUpload.removeFile} className="text-red-500 text-sm">
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <p className="text-sm text-gray-500">Upload discharge summary</p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG (max {FILE_UPLOAD.maxSizeMB}MB)</p>
                <input type="file" className="hidden" accept={FILE_UPLOAD.acceptedExtensions} onChange={handleFileChange} />
              </label>
            )}
            {dischargeUpload.isUploading && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-[#E31837] h-1.5 rounded-full" style={{ width: `${dischargeUpload.progress}%` }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Medication</label>
          <input
            type="text"
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            placeholder="If any"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E31837]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Investigation</label>
          <input
            type="text"
            value={investigationName}
            onChange={(e) => setInvestigationName(e.target.value)}
            placeholder="If any"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E31837]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Symptom</label>
          <input
            type="text"
            value={symptomName}
            onChange={(e) => setSymptomName(e.target.value)}
            placeholder="If any"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E31837]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Treatment</label>
          <input
            type="text"
            value={treatmentName}
            onChange={(e) => setTreatmentName(e.target.value)}
            placeholder="If any"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E31837]"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D]"
      >
        Continue
      </button>
    </div>
  );
}
