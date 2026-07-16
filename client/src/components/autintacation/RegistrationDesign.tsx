"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
    Sprout,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    MapPin,
    Tractor,
    Warehouse,
    Store,
    Check,
    ArrowRight,
} from "lucide-react";
import { DISTRICTS } from "@/constants/constantValues";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { registration } from "@/store/slice/authSlice";

type Role = "farmer" | "aratdar" | "retailer";

type RegisterFormValues = {
    name: string;
    email: string;
    phoneNumber: string;
    role: Role;
    district: string;
    password: string;
};

const ROLES: { value: Role; label: string; icon: typeof Tractor }[] = [
    { value: "farmer", label: "Farmer", icon: Tractor },
    { value: "aratdar", label: "Aratdar", icon: Warehouse },
    { value: "retailer", label: "Retailer", icon: Store },
];

// Matches express-validator's isMobilePhone("bn-BD")
const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;

export default function RegisterPage({ setEmail }: { setEmail: React.Dispatch<React.SetStateAction<string>> }) {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState("");
    const dispatch = useDispatch<AppDispatch>()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({ mode: "onTouched" });

    const passwordValue = watch("password") || "";
    const selectedRole = watch("role");

    const passwordChecks = [
        { label: "At least 8 characters", passed: passwordValue.length >= 8 },
        { label: "Contains a letter", passed: /[a-zA-Z]/.test(passwordValue) },
        { label: "Contains a number", passed: /[0-9]/.test(passwordValue) },
    ];

    const onSubmit = async (data: RegisterFormValues) => {
        setServerError("");
        try {
            await dispatch(registration(data)).unwrap()
            setEmail(data.email)
        } catch (err: any) {
            console.log(err)
            setServerError(err.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-linear-to-br from-emerald-800 via-emerald-700 to-green-600">
                <div className="absolute inset-0 opacity-[0.15]">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-0 right-0 h-px bg-white"
                            style={{ top: `${(i + 1) * 8}%` }}
                        />
                    ))}
                </div>

                <motion.div
                    className="absolute top-20 left-14 text-emerald-200/40"
                    animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Sprout size={60} strokeWidth={1} />
                </motion.div>
                <motion.div
                    className="absolute bottom-28 right-16 text-emerald-200/30"
                    animate={{ y: [0, 16, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <Sprout size={84} strokeWidth={1} />
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
                            Join the network that grows with you.
                        </h1>
                        <p className="text-emerald-50/80 text-base leading-relaxed mb-6">
                            Whether you farm, trade, sell, or buy — AgriLink connects the
                            entire chain, from field to table.
                        </p>
                        <ul className="space-y-3 text-sm text-emerald-50/90">
                            {[
                                "Real-time market prices for every district",
                                "Direct connections, fewer middlemen",
                                "Track orders from harvest to delivery",
                            ].map((item, i) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                                    className="flex items-start gap-2"
                                >
                                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-200" />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="text-sm text-emerald-100/60"
                    >
                        © {new Date().getFullYear()} AgriLink. All rights reserved.
                    </motion.p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="w-full lg:w-[58%] flex items-center justify-center px-6 py-12 sm:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-lg"
                >
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                            <Sprout size={20} className="text-white" />
                        </div>
                        <span className="text-lg font-semibold text-emerald-800">
                            AgriLink
                        </span>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                        Create your account
                    </h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Tell us a bit about yourself to get started.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        {/* Role selector */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                I am a...
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {ROLES.map(({ value, label, icon: Icon }) => {
                                    const active = selectedRole === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setValue("role", value, { shouldValidate: true })
                                            }
                                            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-medium transition ${active
                                                ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600"
                                                : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/40"
                                                }`}
                                        >
                                            <Icon size={20} strokeWidth={1.75} />
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                            <input
                                type="hidden"
                                {...register("role", { required: "Please select a role" })}
                            />
                            {errors.role && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.role.message}
                                </p>
                            )}
                        </motion.div>

                        {/* Name + Email side by side */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.05 }}
                            >
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Full name
                                </label>
                                <div className="relative">
                                    <User
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Rahim Uddin"
                                        autoComplete="name"
                                        {...register("name", {
                                            required: "Name is required",
                                            validate: (v) =>
                                                v.trim().length > 0 || "Name is required",
                                        })}
                                        className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 ${errors.name
                                            ? "border-red-300 focus:ring-red-200"
                                            : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                                            }`}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.name.message}
                                    </p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
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
                                                message: "Email is invalid",
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
                        </div>

                        {/* Phone + District side by side */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.15 }}
                            >
                                <label
                                    htmlFor="phoneNumber"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Phone number
                                </label>
                                <div className="relative">
                                    <Phone
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        id="phoneNumber"
                                        type="tel"
                                        placeholder="01XXXXXXXXX"
                                        autoComplete="tel"
                                        {...register("phoneNumber", {
                                            required: "Phone number is required",
                                            pattern: {
                                                value: BD_PHONE_REGEX,
                                                message: "Phone number is invalid",
                                            },
                                        })}
                                        className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 ${errors.phoneNumber
                                            ? "border-red-300 focus:ring-red-200"
                                            : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                                            }`}
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.phoneNumber.message}
                                    </p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <label
                                    htmlFor="district"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    District
                                </label>
                                <div className="relative">
                                    <MapPin
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                                    />
                                    <select
                                        id="district"
                                        defaultValue=""
                                        {...register("district", {
                                            required: "District is required",
                                        })}
                                        className={`w-full appearance-none rounded-lg border bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 ${errors.district
                                            ? "border-red-300 focus:ring-red-200"
                                            : "border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                                            }`}
                                    >
                                        <option value="" disabled>
                                            Select district
                                        </option>
                                        {DISTRICTS.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.district && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.district.message}
                                    </p>
                                )}
                            </motion.div>
                        </div>

                        {/* Password */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.25 }}
                        >
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
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

                            {/* Live password requirement checklist */}
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
                            className="w-full flex items-center cursor-pointer justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Creating account..." : "Create account"}
                            {!isSubmitting && <ArrowRight size={16} />}
                        </motion.button>
                    </form>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-8 text-center text-sm text-gray-500"
                    >
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-emerald-700 hover:text-emerald-800"
                        >
                            Log in
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}