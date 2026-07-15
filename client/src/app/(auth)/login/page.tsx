"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { login } from "@/store/slice/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: "onTouched" });

  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const onSubmit = async (data: LoginFormValues) => {
    setServerError("");
    try {
      await dispatch(login(data)).unwrap()
      toast.success("Login Successfully")
      router.push("/")
    } catch (err: any) {
      setServerError(err.message || "Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-emerald-800 via-emerald-700 to-green-600">
        {/* Row-of-crops pattern, evokes farmland rows */}
        <div className="absolute inset-0 opacity-[0.15]">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px bg-white"
              style={{ top: `${(i + 1) * 9}%` }}
            />
          ))}
        </div>

        {/* Floating leaf accents */}
        <motion.div
          className="absolute top-16 left-16 text-emerald-200/40"
          animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf size={64} strokeWidth={1} />
        </motion.div>
        <motion.div
          className="absolute bottom-24 right-20 text-emerald-200/30"
          animate={{ y: [0, 16, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Leaf size={90} strokeWidth={1} />
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
              Growing farms into networks.
            </h1>
            <p className="text-emerald-50/80 text-base leading-relaxed">
              Manage your fields, connect with buyers, and track every
              harvest — all from one place built for farmers.
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
          {/* Mobile-only logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Sprout size={20} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-emerald-800">
              AgriLink
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Log in to manage your farm dashboard.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
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

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 ${errors.password
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.password.message}
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
              transition={{ duration: 0.4, delay: 0.3 }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
              {!isSubmitting && <ArrowRight size={16} />}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}