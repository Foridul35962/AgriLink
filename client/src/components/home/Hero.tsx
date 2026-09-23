"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Tractor, Warehouse, Store, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function Hero() {
  const { t } = useLanguage();
  const sceneRef = useRef<HTMLDivElement>(null);

  const {user, isUserFetch} = useSelector((state:RootState)=>state.auth)

  // Raw pointer position, normalized to roughly -0.5..0.5
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    mx.set(0);
    my.set(0);
  }

  // Three parallax depths: far (field + sky), mid (silo + crates), near (floating chips)
  const spring = { stiffness: 60, damping: 18, mass: 0.6 };
  const farX = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), spring);
  const farY = useSpring(useTransform(my, [-0.5, 0.5], [-4, 4]), spring);
  const midX = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), spring);
  const midY = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), spring);
  const nearX = useSpring(useTransform(mx, [-0.5, 0.5], [-26, 26]), spring);
  const nearY = useSpring(useTransform(my, [-0.5, 0.5], [-18, 18]), spring);
  const sceneRotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), spring);
  const sceneRotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), spring);

  const roleChips = [
    { icon: Tractor, label: t.hero.roles.farmer, top: "6%", left: "2%", rotate: -6 },
    { icon: Warehouse, label: t.hero.roles.aratdar, top: "40%", left: "78%", rotate: 5 },
    { icon: Store, label: t.hero.roles.retailer, top: "78%", left: "8%", rotate: -4 },
  ];

  return (
    <section id="home" className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-emerald-800"
            style={{ top: `${(i + 1) * 7}%` }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pb-10 lg:pb-28 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left: copy */}
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-1.5 text-xs font-medium text-emerald-700 mb-6"
          >
            <TrendingUp size={14} />
            {t.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold tracking-tight text-gray-900 leading-tight"
          >
            {t.hero.titleLine}{" "}
            <span className="text-emerald-700">{t.hero.titleHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-gray-500 max-w-md leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col sm:flex-row items-center sm:items-start gap-3"
          >
            {isUserFetch && !user && <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 transition px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_-8px_rgba(4,120,87,0.55)]"
            >
              {t.hero.ctaPrimary}
              <ArrowRight size={16} />
            </Link>}
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition px-6 py-3 text-sm font-medium text-gray-700"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </div>

        {/* Right: isometric 3D farm scene with pointer-driven parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          ref={sceneRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ perspective: 1400 }}
          className="relative h-95 sm:h-110 lg:h-125 select-none"
        >
          <motion.div
            style={{
              rotateX: sceneRotateX,
              rotateY: sceneRotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative h-full w-full"
          >
            {/* far layer: sky glow + field plane */}
            <motion.div style={{ x: farX, y: farY }} className="absolute inset-0">
              <svg
                viewBox="0 0 640 560"
                className="w-full h-full drop-shadow-[0_30px_40px_rgba(6,78,59,0.18)]"
              >
                <defs>
                  <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="fieldTop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6ee7b7" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <pattern
                    id="rows"
                    width="34"
                    height="34"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(-27)"
                  >
                    <rect width="34" height="34" fill="transparent" />
                    <rect width="16" height="34" fill="#047857" opacity="0.35" />
                  </pattern>
                </defs>

                <circle cx="540" cy="92" r="70" fill="url(#sunGlow)" />
                <circle cx="540" cy="92" r="30" fill="#fbbf24" opacity="0.9" />

                {/* ground / field diamond */}
                <polygon
                  points="320,140 560,266 320,392 80,266"
                  fill="url(#fieldTop)"
                />
                <polygon
                  points="320,140 560,266 320,392 80,266"
                  fill="url(#rows)"
                />
                <polygon
                  points="320,140 560,266 320,392 80,266"
                  fill="none"
                  stroke="#065f46"
                  strokeOpacity="0.15"
                  strokeWidth="2"
                />
              </svg>
            </motion.div>

            {/* mid layer: silo + crates, sitting slightly above the field */}
            <motion.div style={{ x: midX, y: midY }} className="absolute inset-0">
              <svg viewBox="0 0 640 560" className="w-full h-full">
                <defs>
                  <linearGradient id="siloBody" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#d1fae5" />
                    <stop offset="55%" stopColor="#a7f3d0" />
                    <stop offset="100%" stopColor="#6ee7b7" />
                  </linearGradient>
                  <linearGradient id="crateTop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>

                {/* silo */}
                <polygon points="432,190 470,150 508,190" fill="#f59e0b" />
                <rect x="432" y="190" width="76" height="108" fill="url(#siloBody)" />
                <ellipse cx="470" cy="190" rx="38" ry="15" fill="#ecfdf5" />
                <ellipse cx="470" cy="298" rx="38" ry="15" fill="#34d399" />

                {/* crate A */}
                <polygon points="225,280 261,300 225,320 189,300" fill="url(#crateTop)" />
                <polygon points="189,300 225,320 225,364 189,344" fill="#d97706" />
                <polygon points="225,320 261,300 261,344 225,364" fill="#f59e0b" />

                {/* crate B, in front */}
                <polygon points="170,300 206,320 170,340 134,320" fill="url(#crateTop)" />
                <polygon points="134,320 170,340 170,384 134,364" fill="#b45309" />
                <polygon points="170,340 206,320 206,364 170,384" fill="#d97706" />
              </svg>
            </motion.div>

            {/* near layer: floating role chips, closest to the viewer */}
            <motion.div style={{ x: nearX, y: nearY }} className="absolute inset-0">
              {roleChips.map(({ icon: Icon, label, top, left, rotate }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                  style={{ top, left, rotate }}
                  className="absolute flex items-center gap-2 rounded-xl bg-white/95 border border-emerald-100 shadow-[0_18px_30px_-12px_rgba(6,95,70,0.35)] px-3.5 py-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-emerald-700" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}