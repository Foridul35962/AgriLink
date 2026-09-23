import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProvider from "@/providers/AppProvider";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/context/LanguageContext";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isValidLocale,
} from "@/lib/i18n/config";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriLink",
  description: "Connecting farmers, aratdars and retailers across Bangladesh.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const initialLocale = isValidLocale(cookieLocale)
    ? cookieLocale
    : DEFAULT_LOCALE;

  return (
    <html
      lang={initialLocale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LanguageProvider initialLocale={initialLocale}>
          <AppProvider >
            <Navbar />
            {children}
            <Footer />
          </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
