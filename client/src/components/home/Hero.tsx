"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sprout,
  ArrowRight,
  Tractor,
  Warehouse,
  Store,
  ShoppingBasket,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  const roleChips = [
    { icon: Tractor, label: t.hero.roles.farmer },
    { icon: Warehouse, label: t.hero.roles.aratdar },
    { icon: Store, label: t.hero.roles.retailer },
  ];

  return (
    <section id="home" className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-emerald-800"
            style={{ top: `${(i + 1) * 7}%` }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-24 right-[8%] text-emerald-100 hidden lg:block"
        animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sprout size={70} strokeWidth={1} />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-24 lg:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-1.5 text-xs font-medium text-emerald-700 mb-6"
          >
            <TrendingUp size={14} />
            {t.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 leading-tight"
          >
            {t.hero.titleLine}{" "}
            <span className="text-emerald-700">{t.hero.titleHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 transition px-6 py-3 text-sm font-medium text-white"
            >
              {t.hero.ctaPrimary}
              <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition px-6 py-3 text-sm font-medium text-gray-700"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {roleChips.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
              className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-emerald-700" strokeWidth={1.75} />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
