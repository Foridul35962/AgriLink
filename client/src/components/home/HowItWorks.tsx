"use client";

import { motion } from "framer-motion";
import { UserPlus, Tags, Handshake, PackageCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ICONS = [UserPlus, Tags, Handshake, PackageCheck];

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="py-24 bg-emerald-50/40">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-medium text-emerald-700">
            {t.howItWorks.sectionLabel}
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            {t.howItWorks.title}
          </h2>
        </motion.div>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-emerald-200" />

          {t.howItWorks.steps.map(({ title, description }, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-white border-2 border-emerald-600 flex items-center justify-center mb-5 shadow-sm">
                  <Icon size={22} className="text-emerald-700" strokeWidth={1.75} />
                </div>
                <span className="text-xs font-semibold text-emerald-600 mb-1.5">
                  {t.howItWorks.stepLabel} {i + 1}
                </span>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-55">
                  {description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
