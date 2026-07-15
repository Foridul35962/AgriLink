"use client";

/**
 * AgriLink — CTA Section
 * Path: components/home/CTA.tsx
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { Sprout, ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600 px-8 py-16 sm:px-16 text-center"
        >
          <div className="absolute inset-0 opacity-[0.12]">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 h-px bg-white"
                style={{ top: `${(i + 1) * 9}%` }}
              />
            ))}
          </div>

          <motion.div
            className="absolute top-8 left-10 text-emerald-200/30 hidden sm:block"
            animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sprout size={56} strokeWidth={1} />
          </motion.div>
          <motion.div
            className="absolute bottom-8 right-10 text-emerald-200/30 hidden sm:block"
            animate={{ y: [0, 14, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            <Sprout size={72} strokeWidth={1} />
          </motion.div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
              Ready to grow with AgriLink?
            </h2>
            <p className="text-emerald-50/80 max-w-lg mx-auto mb-8 leading-relaxed">
              Join thousands of farmers, aratdars, retailers, and consumers
              already trading smarter, together.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-white hover:bg-emerald-50 transition px-6 py-3 text-sm font-medium text-emerald-800"
            >
              Create your free account
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
