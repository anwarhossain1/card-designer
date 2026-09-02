"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LocaleToggle } from "@/components/ui/LocaleToggle";
import { useT } from "@/components/i18n/I18nProvider";

/** Page frame for sign-in and sign-up: logo, the card, and the two toggles. */
export function AuthShell({ children }: { children: ReactNode }) {
  const t = useT().auth;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-workspace">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1.5">
          <LocaleToggle compact />
          <ThemeToggle size="sm" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-[26rem]">
          <div className="rounded-xl border border-hairline bg-panel p-6 shadow-panel sm:p-8">
            {children}
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-800"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backHome}
          </Link>
        </div>
      </main>
    </div>
  );
}
