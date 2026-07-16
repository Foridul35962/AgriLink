"use client";

import Link from "next/link";
import { Sprout, Mail, Phone, ScanFace, Inbox } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const { platform, company, legal } = t.footer.sections;

  return (
    <footer id="contact" className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center">
                <Sprout size={18} className="text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-emerald-900">
                AgriLink
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-5">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <Mail size={15} />
              {t.footer.email}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Phone size={15} />
              {t.footer.phone}
            </div>
          </div>

          {[platform, company, legal].map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-emerald-700 transition"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} AgriLink. {t.footer.copyright}
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-700 hover:border-emerald-300 transition"
              aria-label="Facebook"
            >
              <ScanFace size={16} />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-700 hover:border-emerald-300 transition"
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
