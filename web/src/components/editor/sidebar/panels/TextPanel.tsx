"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { useT } from "@/components/i18n/I18nProvider";
import { TEXT_PRESETS } from "@/lib/canvas/elements/text";
import { DEFAULT_FONT_FAMILY } from "@/config/fonts";

/** Preview weight/size per preset, mirrored from the canvas defaults. */
const PREVIEW_STYLE: Record<string, string> = {
  heading: "text-xl font-bold tracking-tight",
  subheading: "text-sm font-medium tracking-wide",
  paragraph: "text-xs",
  custom: "text-sm",
};

export function TextPanel() {
  const t = useT().editor.text;
  const { addText } = useCanvasActions();

  const copy = {
    heading: t.heading,
    subheading: t.subheading,
    paragraph: t.body,
  } as const;

  return (
    <div className="space-y-3">
      <Button
        size="sm"
        className="w-full"
        onClick={() => void addText("custom")}
      >
        <Plus className="h-4 w-4" />
        {t.addBox}
      </Button>

      <ul className="space-y-2">
        {TEXT_PRESETS.filter((preset) => preset.variant !== "custom").map(
          (preset) => (
            <li key={preset.variant}>
              <button
                type="button"
                onClick={() => void addText(preset.variant)}
                style={{ fontFamily: DEFAULT_FONT_FAMILY }}
                className="w-full rounded-lg border border-hairline bg-panel px-3 py-3 text-left transition-colors hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-400"
              >
                <span
                  className={`block truncate text-ink-900 ${PREVIEW_STYLE[preset.variant]}`}
                >
                  {copy[preset.variant as keyof typeof copy].label}
                </span>
                <span className="mt-0.5 block text-[11px] text-ink-400">
                  {copy[preset.variant as keyof typeof copy].hint}
                </span>
              </button>
            </li>
          ),
        )}
      </ul>

      <p className="px-1 text-[11px] leading-relaxed text-ink-400">
        {t.editHint}
      </p>
    </div>
  );
}
