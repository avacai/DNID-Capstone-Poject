import { create } from "zustand";

export const useOnboarding = create(set => ({
petType: null,
petColor: null,
petName: null,

setPetType: (type) => set({ petType: type }),
  setPetColor: (color) => set({ petColor: color }),
  setPetName: (name) => set({ petName: name }),
}));