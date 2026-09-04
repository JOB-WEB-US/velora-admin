"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Language } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
  shortLabel: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", flag: "🇺🇸", shortLabel: "EN" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳", shortLabel: "VI" },
];

interface LanguageSwitcherProps {
  variant?: "dropdown" | "pills";
  className?: string;
}

export default function LanguageSwitcher({ variant = "dropdown", className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "pills") {
    return (
      <div className={cn("inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl", className)}>
        {LANGUAGES.map((item) => {
          const isActive = language === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setLanguage(item.code)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                isActive
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <span>{item.flag}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition shadow-2xs"
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600" />
        <span className="flex items-center gap-1">
          <span>{currentLang.flag}</span>
          <span className="font-bold">{currentLang.shortLabel}</span>
        </span>
        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 divide-y divide-slate-100"
          >
            <div className="py-1">
              {LANGUAGES.map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLanguage(item.code);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left",
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{item.flag}</span>
                      <span>{item.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
