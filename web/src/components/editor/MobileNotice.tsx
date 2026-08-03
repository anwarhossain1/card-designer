"use client";

import Link from "next/link";
import { Monitor } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * Shown instead of the editor on small screens. A cramped canvas with eight
 * panels is worse than an honest message.
 */
export function MobileNotice() {
  const t = useT().editor.mobile;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />

      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
        <Monitor className="h-6 w-6" />
      </span>

      <div className="max-w-sm">
        <h1 className="text-xl font-semibold text-ink-900">{t.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">{t.body}</p>
      </div>

      <Link href="/">
        <Button variant="outline">{t.back}</Button>
      </Link>
    </div>
  );
}
