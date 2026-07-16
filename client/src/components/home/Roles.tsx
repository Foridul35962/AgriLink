"use client";

import { motion } from "framer-motion";
import { Tractor, Warehouse, Store, ShoppingBasket, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ICONS = [Tractor, Warehouse, Store, ShoppingBasket];

export default function Roles() {
  const { t } = useLanguage();

  return (
    <section id="roles" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-medium text-emerald-700">
            {t.roles.sectionLabel}
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            {t.roles.title}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.roles.items.map(({ title, description, points }, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col rounded-2xl border border-gray-100 p-6 hover:border-emerald-200 hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center mb-5">
                  <Icon size={22} className="text-white" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {description}
                </p>
                <ul className="mt-auto space-y-2">
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
