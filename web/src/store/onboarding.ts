import { create } from "zustand";
import { RiskMode, OnboardingData } from "@/types";

interface OnboardingStore {
  data: Partial<OnboardingData>;
  setData: (update: Partial<OnboardingData>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  data: {},
  setData: (update) => set((s) => ({ data: { ...s.data, ...update } })),
  reset: () => set({ data: {} }),
}));
