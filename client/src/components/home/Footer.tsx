"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, Mail, Phone, ArrowUpRight, ScanFace, Inbox } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { platform, company, legal } = t.footer.sections;

  const dashboardRoutes = ["/dashboard", "/admin", "/aratdar", "/retailer", "/my-products", "/receive-order", "/crop/create", "/crop/edit"];
  const isDashboardPage = dashboardRoutes.some((route) => pathname.startsWith(route));

  return (
    <footer
      id="contact"
      className={`bg-gray-50 border-t border-gray-100 transition-all duration-200 ${isDashboardPage ? "md:pl-64" : ""
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-[0_8px_16px_-6px_rgba(4,120,87,0.55)]">
                <Sprout size={18} className="text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-emerald-900">
                AgriLink
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-5">
              {t.footer.description}
            </p>
            <a
              href={`mailto:${t.footer.email}`}
              className="flex items-center gap-3 text-sm text-gray-500 hover:text-emerald-700 transition mb-2"
            >
              <Mail size={15} />
              {t.footer.email}
            </a>
            <a
              href={`tel:${t.footer.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-3 text-sm text-gray-500 hover:text-emerald-700 transition"
            >
              <Phone size={15} />
              {t.footer.phone}
            </a>
          </div>

          {[platform, company, legal].map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => {
                  const isAnchor = link.href.startsWith("#");
                  const className =
                    "group inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition";
                  return (
                    <li key={link.label}>
                      {isAnchor ? (
                        <a href={link.href} className={className}>
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className={className}>
                          {link.label}
                          <ArrowUpRight
                            size={13}
                            className="opacity-0 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                          />
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} AgriLink. {t.footer.copyright}
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-700 hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-md transition-all"
              aria-label="Facebook"
            >
              <ScanFace size={16} />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-700 hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-md transition-all"
              aria-label="Instagram"
            >
              <Inbox size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}