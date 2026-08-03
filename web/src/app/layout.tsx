import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import { Providers } from "./providers";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme";
import { DEFAULT_LOCALE, LOCALE_INIT_SCRIPT } from "@/lib/i18n/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Bengali UI face. Inter carries no Bengali glyphs, so both families sit in the
 * same `--font-sans` stack: the browser falls through per codepoint, which
 * handles mixed Bangla/English strings without switching fonts by locale.
 */
const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CardCraft — ব্রাউজারেই ভিজিটিং কার্ড ডিজাইন",
    template: "%s · CardCraft",
  },
  description:
    "ব্রাউজারেই প্রিন্ট-রেডি ভিজিটিং কার্ড ডিজাইন করুন। টেমপ্লেট বা খালি ৩.৫ × ২ ইঞ্চি কার্ড থেকে শুরু করে PNG, JPEG বা PDF ডাউনলোড করুন।",
};

export const viewport: Viewport = {
  themeColor: "#6c4cff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* suppressHydrationWarning: inline scripts set data-theme and lang first. */
    <html
      lang={DEFAULT_LOCALE}
      className={`${inter.variable} ${notoBengali.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `${THEME_INIT_SCRIPT}\n${LOCALE_INIT_SCRIPT}`,
          }}
          suppressHydrationWarning
        />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
