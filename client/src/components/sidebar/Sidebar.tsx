"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PanelLeft, X } from "lucide-react";
import { roleNavItems, type UserRole } from "@/components/sidebar/Nav-config";
import { LogoutButton } from "@/components/sidebar/Logout";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useLanguage } from "@/context/LanguageContext";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const {locale} = useLanguage()

  const role: UserRole | null = user?.role ?? null;
  const navItems = role ? roleNavItems[role] ?? [] : [];

  return (
    <>
      {/* Mobile-e Sidebar khular button: top-20 kora hoyeche jate Navbar (h-16) er niche thake */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-20 z-30 flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-medium text-green-700 shadow-sm md:hidden"
        aria-label="Open dashboard menu"
      >
        <PanelLeft size={16} />
        <span>Menu</span>
      </button>

      {/* Mobile backdrop/overlay: Navbar er niche thakar jonno top-16 and z-30 */}
      {isOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container: top-16 and height calc(100vh - 4rem) dya hoyeche */}
      <aside
        className={`fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-green-100 bg-white transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Mobile Header Inside Sidebar */}
        <div className="flex items-center justify-between border-b border-green-100 px-5 py-3 md:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-800">
            Dashboard Menu
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-green-700"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role-wise navigation items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-gray-600 hover:bg-green-50 hover:text-emerald-700"
                }`}
              >
                <item.icon
                  size={18}
                  className={isActive ? "text-white" : "text-emerald-700"}
                />
                {item.label[locale]}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-green-100 p-3">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}