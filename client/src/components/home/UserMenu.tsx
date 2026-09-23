"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Role = "farmer" | "aratdar" | "retailer";

interface UserMenuProps {
  name: string;
  role: Role | string;
  dashboardHref: string;
}

const ROLE_LABEL_KEY: Record<string, Role> = {
  farmer: "farmer",
  aratdar: "aratdar",
  retailer: "retailer",
};

export default function UserMenu({ name, role, dashboardHref }: UserMenuProps) {
  const { t } = useLanguage();
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

  const roleKey = ROLE_LABEL_KEY[role];
  const roleLabel = roleKey ? t.hero.roles[roleKey] : role;
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 pl-1 pr-2 py-1 hover:border-emerald-300 transition"
        aria-label={name}
      >
        <span className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">
          {initial}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg shadow-emerald-900/5 z-50"
          >
            <div className="px-2.5 py-2 mb-1 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
              {roleLabel && (
                <p className="text-xs text-gray-400 mt-0.5">{roleLabel}</p>
              )}
            </div>
            <Link
              href={dashboardHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 transition"
            >
              <LayoutDashboard size={15} />
              {t.nav.dashboard}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}