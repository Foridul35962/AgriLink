"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Menu, X, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationMenu from "../notification/notificationMenu";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import UserMenu from "./UserMenu";

// TODO: fill in the real dashboard route for each role.
const DASHBOARD_LINKS: Record<string, string> = {
  farmer: "/dashboard",
  admin: "/admin",
  aratdar: "/aratdar",
  retailer: "/retailer",
};

export default function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const { user, isUserFetch } = useSelector((state: RootState) => state.auth);

  const role = user?.role as "farmer" | "aratdar" | "retailer" | "admin" | undefined;

  const navLinks = [
    { label: t.nav.crops, href: "/crop" },
    { label: t.nav.cropSuggestions, href: "/crop/suggestions" },
    ...(isUserFetch && user && (role === "farmer" || role === "aratdar" || role === "admin")
      ? [{ label: t.nav.product, href: "/products" }]
      : []),
    ...(isUserFetch && user && (role === "aratdar" || role === "retailer" || role === "admin")
      ? [{ label: t.nav.inventory, href: "/inventory" }]
      : []),
  ];

  const dashboardHref = role ? DASHBOARD_LINKS[role] ?? "#" : "#";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_0_0_rgba(6,95,70,0.04)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-[0_8px_16px_-6px_rgba(4,120,87,0.55)]">
              <Sprout size={18} className="text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-emerald-900">
              AgriLink
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: one wrapper so NotificationMenu is rendered only ONCE
              (visible on both desktop and mobile) */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {/* Desktop auth area: loading skeleton -> login/register -> user menu */}
            <div className="hidden md:flex items-center gap-3">
              {!isUserFetch && (
                <>
                  <div className="h-9 w-14 rounded-lg bg-gray-100 animate-pulse" />
                  <div className="h-9 w-28 rounded-lg bg-gray-100 animate-pulse" />
                </>
              )}

              {isUserFetch && !user && (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition px-3 py-2"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 hover:-translate-y-0.5 transition-all px-4 py-2 rounded-lg shadow-[0_8px_16px_-6px_rgba(4,120,87,0.5)]"
                  >
                    {t.nav.getStarted}
                  </Link>
                </>
              )}

              {isUserFetch && user && (
                <UserMenu
                  name={user.name}
                  role={user.role}
                  dashboardHref={dashboardHref}
                />
              )}
            </div>

            {/* Notification bell + dropdown (handles its own open/close state) */}
            <NotificationMenu />

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setOpen((v) => !v)}
                className="text-gray-600"
                aria-label="Toggle menu"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition"
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                {!isUserFetch && (
                  <div className="flex flex-col gap-2">
                    <div className="h-9 w-full rounded-lg bg-gray-100 animate-pulse" />
                    <div className="h-9 w-full rounded-lg bg-gray-100 animate-pulse" />
                  </div>
                )}

                {isUserFetch && !user && (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-gray-600 py-2"
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-white bg-emerald-700 text-center py-2.5 rounded-lg shadow-[0_8px_16px_-6px_rgba(4,120,87,0.5)]"
                    >
                      {t.nav.getStarted}
                    </Link>
                  </>
                )}

                {isUserFetch && user && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5">
                    <span className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {role && role !== "admin" ? t.hero.roles[role] : user.role}
                      </p>
                    </div>
                    <Link
                      href={dashboardHref}
                      onClick={() => setOpen(false)}
                      className="text-gray-500 hover:text-emerald-700 transition"
                      aria-label={t.nav.dashboard}
                    >
                      <LayoutDashboard size={18} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}