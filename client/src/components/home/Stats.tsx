"use client";


import { motion } from "framer-motion";
import { Users, MapPin, Package, Handshake } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ICONS = [Users, MapPin, Package, Handshake];

export default function Stats() {
  const { t } = useLanguage();

  return (
    <section className="bg-emerald-800 py-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {t.stats.items.map(({ value, label }, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-1">
                  <Icon size={20} className="text-emerald-200" strokeWidth={1.75} />
                </div>
                <span className="text-2xl sm:text-3xl font-semibold text-white">
                  {value}
                </span>
                <span className="text-sm text-emerald-100/70">{label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
