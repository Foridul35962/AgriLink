"use client";

/**
 * AgriLink — Stats Section
 * Path: components/home/Stats.tsx
 */

import { motion } from "framer-motion";
import { Users, MapPin, Package, Handshake } from "lucide-react";

const STATS = [
  { icon: Users, value: "12,000+", label: "Registered farmers" },
  { icon: MapPin, value: "64", label: "Districts covered" },
  { icon: Package, value: "50,000+", label: "Tons traded" },
  { icon: Handshake, value: "8,500+", label: "Direct connections made" },
];

export default function Stats() {
  return (
    <section className="bg-emerald-800 py-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label }, i) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}
