"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils/cn";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

/**
 * Two languages means a direct switch beats a dropdown: one click, and the
 * button always names the language you would move to.
 */
export function LocaleToggle({ compact = false }: { compact?: boolean }) {
  const { locale, t, setLocale } = useI18n();
  const next: Locale = locale === "bn" ? "en" : "bn";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      title={t.common.switchLanguage}
      aria-label={`${t.common.language}: ${LOCALE_LABELS[locale]} — ${t.common.switchLanguage}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md text-ink-700 transition-colors",
        "hover:bg-ink-100 active:bg-ink-200",
        "focus-visible:ring-2 focus-visible:ring-brand-400 outline-none",
        compact ? "h-7 px-2 text-xs" : "h-9 px-2.5 text-sm",
      )}
    >
      <Languages className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span className="font-medium">{LOCALE_LABELS[next]}</span>
    </button>
  );
}
