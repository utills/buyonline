'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { apiClient } from '@/lib/api-client';
import { useJourneyConfig } from '@/features/configurator/hooks/useJourneyConfig';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isNetworkHospital: boolean;
}

export default function HospitalsPage() {
  const router = useRouter();
  const { applicationId } = useJourneyStore();
  const { featureFlags } = useJourneyConfig();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  if (!featureFlags.hospitalSearchEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 text-sm">Hospital search is not available.</p>
        <button onClick={() => router.back()} className="mt-4 text-[#E31837] text-sm font-medium">
          Go back
        </button>
      </div>
    );
  }

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await apiClient.get<Hospital[]>('/api/v1/hospitals?limit=50');
        setHospitals(data);
      } catch {
        // show empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#E31837] text-white px-4 pt-12 pb-6">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm opacity-80">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-xl font-bold">Network Hospitals</h1>
        <p className="text-sm opacity-80 mt-1">Cashless treatment at 5000+ hospitals</p>
      </div>

      <div className="px-4 py-4">
        <input
          type="text"
          placeholder="Search by hospital or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31837]/30"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#E31837] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No hospitals found</div>
      ) : (
        <ul className="px-4 space-y-3 pb-8">
          {filtered.map((h) => (
            <li key={h.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{h.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{h.address}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {h.city}, {h.state} — {h.pincode}
                  </p>
                </div>
                {h.isNetworkHospital && (
                  <span className="shrink-0 text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                    Cashless
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 max-w-md mx-auto">
        <button
          onClick={() => router.push(applicationId ? '/summary' : '/plans')}
          className="w-full bg-[#E31837] text-white font-semibold py-3 rounded-xl text-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
