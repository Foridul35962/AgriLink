"use client";

/**
 * AgriLink — How It Works Section
 * Path: components/home/HowItWorks.tsx
 */

import { motion } from "framer-motion";
import { UserPlus, Tags, Handshake, PackageCheck } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up in minutes and tell us whether you're a farmer, aratdar, retailer, or consumer.",
  },
  {
    icon: Tags,
    title: "List or browse",
    description:
      "Farmers list their harvest, buyers browse listings by crop, price, and district.",
  },
  {
    icon: Handshake,
    title: "Connect & agree",
    description:
      "Message directly, agree on quantity and price, and confirm the order.",
  },
  {
    icon: PackageCheck,
    title: "Deliver & get paid",
    description:
      "Track delivery in real time and receive secure payment once it's complete.",
  },
];

export default function HowItWorks() {
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
            How it works
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            Four steps from harvest to hand
          </h2>
        </motion.div>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-emerald-200" />

          {STEPS.map(({ icon: Icon, title, description }, i) => (
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
                STEP {i + 1}
              </span>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                {title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
