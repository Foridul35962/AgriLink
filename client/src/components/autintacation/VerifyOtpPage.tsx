"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Sprout, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { resendOtp, verifyForgetPass, verifyRegi } from "@/store/slice/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const OTP_LENGTH = 6;

type OtpFormValues = {
    otp: string[];
};

function maskEmail(email: string) {
    const [user, domain] = email.split("@");
    if (!user || !domain) return email;
    const visible = user.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(user.length - 2, 2))}@${domain}`;
}

export default function VerifyOtpPage({
    email,
    setIsverified,
    setEmail,
    topic }: {
        email: string,
        setIsverified: React.Dispatch<React.SetStateAction<boolean>>,
        setEmail?: React.Dispatch<React.SetStateAction<string>>,
        topic: "registration" | "forgetPass"
    }) {

    const [serverError, setServerError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(60);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting },
    } = useForm<OtpFormValues>({
        defaultValues: { otp: Array(OTP_LENGTH).fill("") },
    });

    const otpValues = watch("otp");
    const otpComplete = otpValues.every((digit) => digit !== "");

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown((s) => s - 1), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/[^0-9]/g, "").slice(-1);
        const next = [...otpValues];
        next[index] = digit;
        setValue("otp", next);

        if (digit && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill("");
        pasted
            .slice(0, OTP_LENGTH)
            .split("")
            .forEach((char, i) => (next[i] = char));
        setValue("otp", next);
        const lastIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
        inputsRef.current[lastIndex]?.focus();
    };

    const onSubmit = async (data: OtpFormValues) => {
        setServerError("");
        const otp = data.otp.join("");
        try {
            if (topic === "registration") {
                await dispatch(verifyRegi({ email: email, otp: otp })).unwrap()
            } else if (topic === "forgetPass") {
                await dispatch(verifyForgetPass({ email: email, otp: otp })).unwrap()
            }
            setIsverified(true)
        } catch (err: any) {
            setServerError(err.message || "Invalid code. Please try again.");
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        try {
            await dispatch(resendOtp({ email: email, topic: topic })).unwrap()
            setResendCooldown(60);
        } catch (error: any) {
            toast.error(error.message)
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
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ShieldCheck size={64} strokeWidth={1} />
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
                            Check your inbox.
                        </h1>
                        <p className="text-emerald-50/80 text-base leading-relaxed">
                            We&apos;ve sent a 6-digit verification code to your email.
                            Enter it to confirm it&apos;s really you.
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
                                className={`h-1.5 rounded-full transition-all ${step <= 2 ? "w-8 bg-emerald-600" : "w-8 bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
                        <ShieldCheck size={22} className="text-emerald-700" strokeWidth={1.75} />
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                        Enter verification code
                    </h2>
                    <p className="text-sm text-gray-500 mb-8">
                        We sent a code to{" "}
                        <span className="font-medium text-gray-700">
                            {email ? maskEmail(email) : "your email"}
                        </span>
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="flex justify-between gap-2"
                        >
                            {otpValues.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        inputsRef.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    autoFocus={index === 0}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="w-full aspect-square rounded-lg border border-gray-200 bg-gray-50 text-center text-lg font-semibold text-gray-900 outline-none transition focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                />
                            ))}
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
                            disabled={!otpComplete || isSubmitting}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="w-full flex items-center cursor-pointer justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? "Verifying..." : "Verify code"}
                            {!isSubmitting && <ArrowRight size={16} />}
                        </motion.button>
                    </form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-6 text-center text-sm text-gray-500"
                    >
                        Didn&apos;t get the code?{" "}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="font-medium text-emerald-700 hover:text-emerald-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <button
                            onClick={() => { setEmail && setEmail("") }}
                            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-emerald-700 transition"
                        >
                            <ArrowLeft size={15} />
                            Back
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}