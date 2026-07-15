"use client";

/**
 * AgriLink — Features Section
 * Path: components/home/Features.tsx
 */

import { motion } from "framer-motion";
import {
  LineChart,
  ShieldCheck,
  Truck,
  MessagesSquare,
  Wallet,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  {
    icon: LineChart,
    title: "Real-time market prices",
    description:
      "See up-to-date crop prices across every district before you buy or sell.",
  },
  {
    icon: Truck,
    title: "Direct trade, less waste",
    description:
      "Connect farmers straight to buyers — fewer middlemen, fresher produce, better margins.",
  },
  {
    icon: ShieldCheck,
    title: "Verified accounts",
    description:
      "Every farmer, aratdar, and retailer is verified so you always know who you're trading with.",
  },
  {
    icon: Wallet,
    title: "Secure payments",
    description:
      "Pay and get paid safely with transaction protection built into every order.",
  },
  {
    icon: MessagesSquare,
    title: "Direct messaging",
    description:
      "Negotiate quantities, prices, and delivery details directly in the app.",
  },
  {
    icon: BarChart3,
    title: "Order tracking",
    description:
      "Track every order from harvest to delivery, with status updates at each step.",
  },
];

export default function Features() {
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
            Why AgriLink
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            Everything the agri chain needs, in one place
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            Built for the realities of farming and trade in Bangladesh —
            simple, transparent, and fair for everyone involved.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group rounded-2xl border border-gray-100 p-6 hover:border-emerald-200 hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)] transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <Icon size={20} className="text-emerald-700" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                {title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
