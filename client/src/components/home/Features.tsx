"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  ShieldCheck,
  Truck,
  MessagesSquare,
  Wallet,
  BarChart3,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import TiltCard from "./TiltCart";

const ICONS = [LineChart, Truck, ShieldCheck, Wallet, MessagesSquare, BarChart3];

export default function Features() {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-medium text-emerald-700">
            {t.features.sectionLabel}
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            {t.features.title}
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            {t.features.subtitle}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map(({ title, description }, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              >
                <TiltCard>
                  <div className="group h-full rounded-2xl border border-gray-100 p-6 bg-white shadow-[0_2px_10px_-4px_rgba(16,24,40,0.06)] hover:border-emerald-200 hover:shadow-[0_24px_38px_-16px_rgba(16,185,129,0.28)] transition-shadow">
                    <div
                      style={{ transform: "translateZ(28px)" }}
                      className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors"
                    >
                      <Icon size={20} className="text-emerald-700" strokeWidth={1.75} />
                    </div>
                    <h3
                      style={{ transform: "translateZ(16px)" }}
                      className="text-base font-semibold text-gray-900 mb-1.5"
                    >
                      {title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}