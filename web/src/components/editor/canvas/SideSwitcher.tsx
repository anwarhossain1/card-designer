"use client";

import { cn } from "@/lib/utils/cn";
import { SIDE_IDS } from "@/config/document";
import { useT } from "@/components/i18n/I18nProvider";
import { useCanvas } from "./CanvasProvider";

/**
 * Front / back segmented control.
 *
 * Two sides is few enough that a segmented control beats the page thumbnails a
 * multi-page editor needs: both destinations are always visible and one tap
 * away, and it costs a fraction of the space a thumbnail strip would.
 */
export function SideSwitcher({
  variant = "bar",
}: {
  /** "floating" positions itself over the canvas, for the compact shell. */
  variant?: "bar" | "floating";
}) {
  const t = useT().editor.sides;
  const { activeSide, switchSide, isSwitchingSide } = useCanvas();
  const isFloating = variant === "floating";

  const control = (
    <div
      role="group"
      aria-label={t.label}
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-hairline",
        isFloating
          ? "pointer-events-auto bg-panel/95 p-1 shadow-panel backdrop-blur"
          : "bg-workspace p-0.5",
      )}
    >
      {SIDE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={activeSide === id}
          disabled={isSwitchingSide}
          onClick={() => void switchSide(id)}
          className={cn(
            "rounded-full font-medium transition-colors disabled:cursor-default disabled:opacity-60",
            isFloating ? "h-9 px-4 text-sm" : "h-6 px-2.5 text-xs",
            activeSide === id
              ? "bg-brand-600 text-white"
              : "text-ink-600 hover:text-ink-900",
          )}
        >
          {t[id]}
        </button>
      ))}
    </div>
  );

  if (!isFloating) return control;

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2">
      {control}
    </div>
  );
}
