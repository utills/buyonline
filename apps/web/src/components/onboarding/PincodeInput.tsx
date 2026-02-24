'use client';

import { useState } from 'react';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { apiClient } from '@/lib/api-client';

export default function PincodeInput() {
  const { pincode, nearbyHospitals, setPincode, setNearbyHospitals } =
    useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePincodeChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setPincode(cleaned);
    setError('');

    if (cleaned.length === 6) {
      setIsLoading(true);
      try {
        const res = await apiClient.get<{ hospitalCount: number }>(
          `/api/v1/hospitals/nearby`,
          { params: { pincode: cleaned } }
        );
        setNearbyHospitals(res.hospitalCount);
      } catch {
        setError('Unable to verify pincode. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setNearbyHospitals(0);
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsLoading(true);
        try {
          const res = await apiClient.get<{ pincode: string; hospitalCount: number }>(
            `/api/v1/hospitals/locate`,
            {
              params: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            }
          );
          setPincode(res.pincode);
          setNearbyHospitals(res.hospitalCount);
        } catch {
          setError('Unable to detect location');
        } finally {
          setIsLoading(false);
        }
      },
      () => setError('Location permission denied')
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1.5">
          Enter your area pincode
        </label>
        <div className="relative">
          <input
            id="pincode"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="e.g. 400001"
            value={pincode ?? ''}
            onChange={(e) => handlePincodeChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-[#ED1B2D] focus:ring-1 focus:ring-[#ED1B2D]"
          />
          <button
            type="button"
            onClick={handleGeolocate}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ED1B2D]"
            title="Use current location"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Checking nearby hospitals...
        </div>
      )}

      {nearbyHospitals > 0 && !isLoading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">
              {nearbyHospitals} cashless hospitals nearby
            </p>
            <p className="text-xs text-green-600">Network hospitals found in your area</p>
          </div>
        </div>
      )}
    </div>
  );
}
