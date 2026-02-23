import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { KycMethod, KycStatus, DocumentType } from '@buyonline/shared-types';

interface KycState {
  method: KycMethod | null;
  status: KycStatus;
  panNumber: string;
  aadharNumber: string;
  dob: string;
  identityProofType: DocumentType | null;
  identityProofUrl: string;
  addressProofType: DocumentType | null;
  addressProofUrl: string;
  useDigiLocker: boolean;

  setMethod: (method: KycMethod) => void;
  setStatus: (status: KycStatus) => void;
  setPanNumber: (pan: string) => void;
  setAadharNumber: (aadhar: string) => void;
  setDob: (dob: string) => void;
  setIdentityProof: (type: DocumentType, url: string) => void;
  setAddressProof: (type: DocumentType, url: string) => void;
  setUseDigiLocker: (use: boolean) => void;
  reset: () => void;
}

const initialState = {
  method: null as KycMethod | null,
  status: KycStatus.PENDING,
  panNumber: '',
  aadharNumber: '',
  dob: '',
  identityProofType: null as DocumentType | null,
  identityProofUrl: '',
  addressProofType: null as DocumentType | null,
  addressProofUrl: '',
  useDigiLocker: false,
};

export const useKycStore = create<KycState>()(
  persist(
    (set) => ({
      ...initialState,

      setMethod: (method: KycMethod) => set({ method }),

      setStatus: (status: KycStatus) => set({ status }),

      setPanNumber: (pan: string) => set({ panNumber: pan.toUpperCase() }),

      setAadharNumber: (aadhar: string) => set({ aadharNumber: aadhar }),

      setDob: (dob: string) => set({ dob }),

      setIdentityProof: (type: DocumentType, url: string) =>
        set({ identityProofType: type, identityProofUrl: url }),

      setAddressProof: (type: DocumentType, url: string) =>
        set({ addressProofType: type, addressProofUrl: url }),

      setUseDigiLocker: (use: boolean) => set({ useDigiLocker: use }),

      reset: () => set(initialState),
    }),
    {
      name: 'buyonline-kyc',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null, setItem: () => {}, removeItem: () => {},
        }
      ),
    }
  )
);
