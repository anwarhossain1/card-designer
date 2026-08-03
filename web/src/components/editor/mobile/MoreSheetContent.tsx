"use client";

import { Grid3x3, Monitor, Moon, Ruler, Square, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/store/uiStore";
import { useTheme } from "@/hooks/useTheme";
import { useI18n, useT } from "@/components/i18n/I18nProvider";
import { LOCALE_LABELS, LOCALES } from "@/lib/i18n/config";
import type { ThemePreference } from "@/lib/theme/theme";

/** Settings that have no room in the phone chrome: view guides, theme, language. */
export function MoreSheetContent() {
  const t = useT().editor;
  const view = useUiStore((state) => state.view);
  const toggleView = useUiStore((state) => state.toggleView);
  const { preference, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();

  const themes: { id: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: t.mobileUi.themeLight, icon: <Sun className="h-4 w-4" /> },
    { id: "dark", label: t.mobileUi.themeDark, icon: <Moon className="h-4 w-4" /> },
    { id: "system", label: t.mobileUi.themeSystem, icon: <Monitor className="h-4 w-4" /> },
  ];

  const guides = [
    { key: "grid" as const, label: t.zoom.grid, icon: <Grid3x3 className="h-4 w-4" /> },
    { key: "safeArea" as const, label: t.zoom.safeArea, icon: <Square className="h-4 w-4" /> },
    { key: "bleed" as const, label: t.zoom.bleed, icon: <Ruler className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-5 pt-1">
      <Section title={t.mobileUi.view}>
        {guides.map((guide) => (
          <Row
            key={guide.key}
            icon={guide.icon}
            label={guide.label}
            active={view[guide.key]}
            onClick={() => toggleView(guide.key)}
          />
        ))}
      </Section>

      <Section title={t.mobileUi.theme}>
        {themes.map((entry) => (
          <Row
            key={entry.id}
            icon={entry.icon}
            label={entry.label}
            active={preference === entry.id}
            onClick={() => setTheme(entry.id)}
          />
        ))}
      </Section>

      <Section title={t.mobileUi.language}>
        {LOCALES.map((entry) => (
          <Row
            key={entry}
            label={LOCALE_LABELS[entry]}
            active={locale === entry}
            onClick={() => setLocale(entry)}
          />
        ))}
      </Section>

      <p className="px-1 text-[11px] text-ink-400">{t.mobileUi.rotateHint}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Row({
  icon,
  label,
  active,
  onClick,
}: {
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-h-[48px] w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors",
        active
          ? "bg-brand-50 font-medium text-brand-700"
          : "text-ink-700 active:bg-ink-100",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
