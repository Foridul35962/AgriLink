"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sprout } from "lucide-react";

export default function FirstLoad() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + Math.floor(Math.random() * 12) + 4;
                });
            }, 180);

            return () => clearInterval(interval);
        }, 100);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="fixed inset-0 z-100 flex items-center justify-center bg-white overflow-hidden"
            >
                {/* Ambient farmland row pattern */}
                <div className="absolute inset-0 opacity-[0.04]">
                    {Array.from({ length: 14 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-0 right-0 h-px bg-emerald-800"
                            style={{ top: `${(i + 1) * 7}%` }}
                        />
                    ))}
                </div>

                {/* Soft floating leaves in the background */}
                <motion.div
                    className="absolute top-[18%] left-[15%] text-emerald-100"
                    animate={{ y: [0, -16, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Sprout size={40} strokeWidth={1} />
                </motion.div>
                <motion.div
                    className="absolute bottom-[20%] right-[16%] text-emerald-100"
                    animate={{ y: [0, 14, 0], rotate: [0, -8, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                >
                    <Sprout size={56} strokeWidth={1} />
                </motion.div>

                <div className="relative z-10 flex flex-col items-center px-6">
                    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                        <motion.span
                            className="absolute inset-0 rounded-full bg-emerald-100"
                            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.15, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="relative w-16 h-16 rounded-2xl bg-emerald-700 flex items-center justify-center shadow-sm"
                            initial={{ scale: 0.9, opacity: 1 }} 
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <motion.div
                                initial={{ scale: 1, rotate: 0 }}
                            >
                                <Sprout size={30} className="text-white" strokeWidth={1.75} />
                            </motion.div>
                        </motion.div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 1, y: 0 }}
                        className="text-2xl font-semibold tracking-tight text-emerald-900 mb-1"
                    >
                        AgriLink
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0.8 }}
                        className="text-sm text-gray-500 mb-8"
                    >
                        Cultivating smarter farms
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="w-56 h-1.5 rounded-full bg-emerald-50 overflow-hidden"
                    >
                        <motion.div
                            className="h-full rounded-full bg-emerald-600"
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                    </motion.div>
                    
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-3 text-xs font-medium text-emerald-700 tabular-nums"
                    >
                        {Math.min(progress, 100)}%
                    </motion.span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}