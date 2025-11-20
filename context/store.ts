// stores/useLanguageStore.ts
import { create } from "zustand";

type LanguageStore = {
  language: string | undefined;
  setLanguage: (lang: string) => void;
  clearLanguage: () => void;
};

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: undefined,

  setLanguage: (lang) => set({ language: lang }),

  clearLanguage: () => set({ language: undefined }),
}));
