"use client";

import { create } from "zustand";
import { Language, translations } from "@/lib/i18n/translations";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const STORAGE_KEY = "velora_admin_lang";

const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "vi") {
      return saved;
    }
  }
  return "en"; // Default is strictly English
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en", // Server default
  setLanguage: (lang: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang);
    }
    set({ language: lang });
  },
}));

// Initialize from localStorage on client
if (typeof window !== "undefined") {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "vi") {
    useLanguageStore.setState({ language: saved });
  }
}

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const t = (path: string, fallback?: string): string => {
    const parts = path.split(".");
    if (parts.length === 2) {
      const [section, key] = parts;
      const currentDict = (translations[language] as any)?.[section];
      if (currentDict && currentDict[key] !== undefined) {
        return currentDict[key];
      }
      // Fallback to English
      const enDict = (translations.en as any)?.[section];
      if (enDict && enDict[key] !== undefined) {
        return enDict[key];
      }
    }
    return fallback || path;
  };

  return { language, setLanguage, t };
}
