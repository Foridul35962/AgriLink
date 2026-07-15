"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Sprout, Mail, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { forgetPass } from "@/store/slice/authSlice";

type EmailFormValues = {
  email: string;
};

export default function ForgetPassDesign({ setEmail }: { setEmail: React.Dispatch<React.SetStateAction<string>> }) {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormValues>({ mode: "onTouched" });

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = async (data: EmailFormValues) => {
    setServerError("");
    try {
      await dispatch(forgetPass(data)).unwrap()
      setEmail(data.email)
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-emerald-800 via-emerald-700 to-green-600">
        <div className="absolute inset-0 opacity-[0.15]">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px bg-white"
              style={{ top: `${(i + 1) * 9}%` }}
            />
          ))}
        </div>

        <motion.div
          className="absolute top-16 left-16 text-emerald-200/40"
          animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <KeyRound size={64} strokeWidth={1} />
        </motion.div>
        <motion.div
          className="absolute bottom-24 right-20 text-emerald-200/30"
          animate={{ y: [0, 16, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Sprout size={90} strokeWidth={1} />
        </motion.div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Sprout size={22} />
            </div>
            <span className="text-xl font-semibold tracking-tight">AgriLink</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-md"
          >
            <h1 className="text-4xl font-semibold leading-tight mb-4">
              Let&apos;s get you back in.
            </h1>
            <p className="text-emerald-50/80 text-base leading-relaxed">
              Enter the email linked to your account and we&apos;ll send you a
              verification code to reset your password.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm text-emerald-100/60"
          >
            © {new Date().getFullYear()} AgriLink. All rights reserved.
          </motion.p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Sprout size={20} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-emerald-800">
              AgriLink
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all ${step === 1 ? "w-8 bg-emerald-600" : "w-8 bg-gray-200"
                  }`}
              />
            ))}
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
            <Mail size={22} className="text-emerald-700" strokeWidth={1.75} />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Forgot password?
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            No worries. Enter your email and we&apos;ll send you a code.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  type="email"
                  placeholder="you@farmname.com"
                  autoComplete="email"
                  autoFocus
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 ${errors.email
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {serverError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
              >
                {serverError}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending code..." : "Send verification code"}
              {!isSubmitting && <ArrowRight size={16} />}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/login"
              className="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-emerald-700 transition"
            >
              <ArrowLeft size={15} />
              Back to login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}