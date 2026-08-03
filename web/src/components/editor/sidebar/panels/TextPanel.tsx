"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCanvasActions } from "@/hooks/useCanvasActions";
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
  const { addText } = useCanvasActions();

  return (
    <div className="space-y-3">
      <Button
        size="sm"
        className="w-full"
        onClick={() => void addText("custom")}
      >
        <Plus className="h-4 w-4" />
        Add a text box
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
                  {preset.label}
                </span>
                <span className="mt-0.5 block text-[11px] text-ink-400">
                  {preset.hint}
                </span>
              </button>
            </li>
          ),
        )}
      </ul>

      <p className="px-1 text-[11px] leading-relaxed text-ink-400">
        Double-click any text on the card to edit it in place.
      </p>
    </div>
  );
}
