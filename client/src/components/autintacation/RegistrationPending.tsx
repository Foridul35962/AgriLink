"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sprout,
  Clock,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Mail,
  ArrowLeft,
} from "lucide-react";

const STEPS = [
  {
    title: "Registration submitted",
    description: "We've received your details successfully.",
    status: "done" as const,
  },
  {
    title: "Admin verification",
    description:
      "Our team is reviewing your information to keep AgriLink safe and trustworthy for everyone.",
    status: "active" as const,
  },
  {
    title: "Account approved",
    description: "You'll be able to log in and start using AgriLink right away.",
    status: "upcoming" as const,
  },
];

export default function RegistrationPendingPage() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Ambient farmland row pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-emerald-800"
            style={{ top: `${(i + 1) * 7}%` }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-20 left-[10%] text-emerald-100 hidden lg:block"
        animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sprout size={64} strokeWidth={1} />
      </motion.div>
      <motion.div
        className="absolute bottom-16 right-[10%] text-emerald-100 hidden lg:block"
        animate={{ y: [0, 14, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      >
        <Sprout size={80} strokeWidth={1} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center">
            <Sprout size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-emerald-900">
            AgriLink
          </span>
        </div>

        <div className="rounded-3xl border border-gray-100 shadow-sm bg-white p-8 sm:p-10 text-center">
          {/* Animated clock icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center"
          >
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-100"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Clock size={26} className="text-emerald-700" strokeWidth={1.75} />
            </div>
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-block rounded-full bg-emerald-50 border border-emerald-100 px-3.5 py-1 text-xs font-medium text-emerald-700 mb-4"
          >
            Registration submitted
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 mb-3"
          >
            Your registration is pending approval
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-sm text-gray-500 leading-relaxed mb-8"
          >
            Thanks for joining AgriLink! We&apos;ve received your details and
            our admin team is now reviewing your account to make sure
            everything checks out. This usually takes no more than{" "}
            <span className="font-medium text-gray-700">
              3 working days
            </span>
            . You&apos;ll get an email as soon as your account is approved.
          </motion.p>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="text-left space-y-5 mb-8"
          >
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      step.status === "done"
                        ? "bg-emerald-600"
                        : step.status === "active"
                        ? "bg-emerald-100 border-2 border-emerald-600"
                        : "bg-gray-100 border-2 border-gray-200"
                    }`}
                  >
                    {step.status === "done" && (
                      <CheckCircle2 size={15} className="text-white" />
                    )}
                    {step.status === "active" && (
                      <Loader2
                        size={13}
                        className="text-emerald-700 animate-spin"
                      />
                    )}
                    {step.status === "upcoming" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`w-px flex-1 min-h-7 ${
                        step.status === "done" ? "bg-emerald-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <div className="pb-1">
                  <p
                    className={`text-sm font-medium ${
                      step.status === "upcoming"
                        ? "text-gray-400"
                        : "text-gray-900"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Estimated time badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-2.5 mb-6"
          >
            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
            <span className="text-xs font-medium text-emerald-800">
              Estimated review time: within 3 working days
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="text-sm text-gray-500"
          >
            Have a question about your application?{" "}
            <a
              href="mailto:support@agrilink.com"
              className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800"
            >
              <Mail size={13} />
              Contact support
            </a>
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Link
            href="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}