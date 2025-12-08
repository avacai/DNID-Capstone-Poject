import { create } from "zustand";

export type PetType = "Cat" | "Dog" | "Duck" | "Seal";

interface OnboardingState {
petType: PetType | null;
petColor: string | null;
petName: string | null;
currency: number; // New field for coins

setPetType: (type: PetType) => void;
  setPetColor: (color: string) => void;
  setPetName: (name: string) => void;
  setCurrency: (amount: number) => void; // New setter
  addCurrency: (amount: number) => void; // Helper to add coins
}

export const useOnboarding = create<OnboardingState>((set) => ({
  petType: null,
  petColor: null,
  petName: null,
  currency: 0, // Default to 0

  setPetType: (type) => set({ petType: type }),
  setPetColor: (color) => set({ petColor: color }),
  setPetName: (name) => set({ petName: name }),
  setCurrency: (amount) => set({ currency: amount }),
  addCurrency: (amount) => set((state) => ({ currency: state.currency + amount })),
}));