import { create } from "zustand";

interface CreditState {
  creditUSD: number | null;
  setCreditUSD: (value: number) => void;
}

export const useCreditStore = create<CreditState>((set) => ({
  creditUSD: null,
  setCreditUSD: (value) => set({ creditUSD: value }),
}));
