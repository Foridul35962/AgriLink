"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t.languageSwitcher.label}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-emerald-300 hover:text-emerald-700 transition"
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg shadow-emerald-900/5 z-50"
          >
            <p className="px-2.5 py-1.5 text-xs font-medium text-gray-400">
              {t.languageSwitcher.label}
            </p>
            {LOCALES.map((loc) => (
              <button
                key={loc}
                onClick={() => handleSelect(loc)}
                className={`flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-sm transition ${
                  locale === loc
                    ? "bg-emerald-50 text-emerald-800 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {LOCALE_LABELS[loc]}
                {locale === loc && (
                  <Check size={15} className="text-emerald-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
