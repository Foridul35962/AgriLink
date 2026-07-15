"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
    Sprout,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    Check,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { resetPass } from "@/store/slice/authSlice";

type ResetFormValues = {
    password: string;
    confirmPassword: string;
};

export default function ResetPassPage({ email }: { email: string }) {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ResetFormValues>({ mode: "onTouched" });

    const passwordValue = watch("password") || "";
    const dispatch = useDispatch<AppDispatch>()

    const passwordChecks = [
        { label: "At least 8 characters", passed: passwordValue.length >= 8 },
        { label: "Contains a letter", passed: /[a-zA-Z]/.test(passwordValue) },
        { label: "Contains a number", passed: /[0-9]/.test(passwordValue) },
    ];

    const onSubmit = async (data: ResetFormValues) => {
        setServerError("");
        if (data.password !== data.confirmPassword) {
            return
        }
        try {
            await dispatch(resetPass({ email: email, password: data.password })).unwrap()
            setSuccess(true);
            setTimeout(() => router.push("/login"), 900);
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
                    <Lock size={64} strokeWidth={1} />
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
                            Almost there.
                        </h1>
                        <p className="text-emerald-50/80 text-base leading-relaxed">
                            Choose a strong new password to keep your farm data and
                            transactions secure.
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
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center py-10"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                                className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5"
                            >
                                <CheckCircle2 size={32} className="text-emerald-600" />
                            </motion.div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                Password reset!
                            </h2>
                            <p className="text-sm text-gray-500">
                                Redirecting you to login...
                            </p>
                        </motion.div>
                    ) : (
                        <>
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
                                        className="h-1.5 w-8 rounded-full bg-emerald-600"
                                    />
                                ))}
                            </div>

                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
                                <Lock size={22} className="text-emerald-700" strokeWidth={1.75} />
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                                Set a new password
                            </h2>
                            <p className="text-sm text-gray-500 mb-8">
                                Make sure it&apos;s at least 8 characters with a letter and a
                                number.
                            </p>

                            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                                {/* New password */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                    >
                                        New password
                                    </label>
                                    <div className="relative">
                                        <Lock
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                            autoFocus
                                            {...register("password", {
                                                required: "Password is required",
                                                minLength: {
                                                    value: 8,
                                                    message: "Password must be at least 8 characters",
                                                },
                                                validate: {
                                                    hasLetter: (v) =>
                                                        /[a-zA-Z]/.test(v) || "Password must contain a letter",
                                                    hasNumber: (v) =>
                                                        /[0-9]/.test(v) || "Password must contain a number",
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

                                    {passwordValue.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-2 space-y-1"
                                        >
                                            {passwordChecks.map((check) => (
                                                <div
                                                    key={check.label}
                                                    className={`flex items-center gap-1.5 text-xs transition-colors ${check.passed ? "text-emerald-600" : "text-gray-400"
                                                        }`}
                                                >
                                                    <span
                                                        className={`flex items-center justify-center w-3.5 h-3.5 rounded-full border ${check.passed
                                                            ? "border-emerald-600 bg-emerald-600"
                                                            : "border-gray-300"
                                                            }`}
                                                    >
                                                        {check.passed && (
                                                            <Check size={9} className="text-white" strokeWidth={3} />
                                                        )}
                                                    </span>
                                                    {check.label}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}

                                    {errors.password && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </motion.div>

                                {/* Confirm password */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.15 }}
                                >
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                    >
                                        Confirm password
                                    </label>
                                    <div className="relative">
                                        <Lock
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Re-enter new password"
                                            autoComplete="new-password"
                                            {...register("confirmPassword", {
                                                required: "Please confirm your password",
                                                validate: (value) =>
                                                    value === passwordValue || "Passwords do not match",
                                            })}
                                            className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 ${errors.confirmPassword
                                                ? "border-red-300 focus:ring-red-200"
                                                : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            aria-label={showConfirm ? "Hide password" : "Show password"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            {errors.confirmPassword.message}
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
                                    {isSubmitting ? "Resetting..." : "Reset password"}
                                    {!isSubmitting && <ArrowRight size={16} />}
                                </motion.button>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}