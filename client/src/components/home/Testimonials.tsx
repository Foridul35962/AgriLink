"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-emerald-50/40">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-medium text-emerald-700">
            {t.testimonials.sectionLabel}
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            {t.testimonials.title}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {t.testimonials.items.map(({ quote, name, role }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col rounded-2xl bg-white border border-gray-100 p-6"
            >
              <Quote size={26} className="text-emerald-200 mb-4" strokeWidth={1.5} />
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {quote}
              </p>
              <div className="mt-auto flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white text-sm font-medium">
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
