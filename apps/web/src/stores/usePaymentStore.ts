import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PaymentStatus, ProposerDetails } from '@buyonline/shared-types';

interface PaymentState {
  proposer: ProposerDetails | null;
  paymentStatus: PaymentStatus | null;
  transactionId: string | null;
  paymentMethod: string | null;
  gatewayOrderId: string | null;
  amount: number;

  setProposer: (details: ProposerDetails) => void;
  setPaymentStatus: (status: PaymentStatus) => void;
  setTransactionId: (id: string) => void;
  setPaymentMethod: (method: string) => void;
  setGatewayOrderId: (id: string) => void;
  setAmount: (amount: number) => void;
  reset: () => void;
}

const initialState = {
  proposer: null as ProposerDetails | null,
  paymentStatus: null as PaymentStatus | null,
  transactionId: null as string | null,
  paymentMethod: null as string | null,
  gatewayOrderId: null as string | null,
  amount: 0,
};

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      ...initialState,

      setProposer: (details: ProposerDetails) => set({ proposer: details }),

      setPaymentStatus: (status: PaymentStatus) => set({ paymentStatus: status }),

      setTransactionId: (id: string) => set({ transactionId: id }),

      setPaymentMethod: (method: string) => set({ paymentMethod: method }),

      setGatewayOrderId: (id: string) => set({ gatewayOrderId: id }),

      setAmount: (amount: number) => set({ amount }),

      reset: () => set(initialState),
    }),
    {
      name: 'buyonline-payment',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
