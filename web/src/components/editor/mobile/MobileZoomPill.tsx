"use client";

import { Maximize, Minus, Plus } from "lucide-react";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useT } from "@/components/i18n/I18nProvider";
import { ZOOM } from "@/config/document";

/**
 * Floating zoom control. Sits over the canvas rather than in a bar of its own,
 * because vertical space is the scarce resource on a phone.
 */
export function MobileZoomPill() {
  const t = useT().editor.zoom;
  const { zoom, zoomIn, zoomOut, fitToScreen } = useCanvas();

  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-hairline bg-panel/95 px-1 py-1 shadow-panel backdrop-blur">
        <button
          type="button"
          aria-label={t.zoomOut}
          disabled={zoom <= ZOOM.min}
          onClick={zoomOut}
          className="grid h-10 w-10 place-items-center rounded-full text-ink-700 active:bg-ink-100 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>

        <span className="min-w-[3.5rem] text-center text-xs font-medium tabular-nums text-ink-600">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          aria-label={t.zoomIn}
          disabled={zoom >= ZOOM.max}
          onClick={zoomIn}
          className="grid h-10 w-10 place-items-center rounded-full text-ink-700 active:bg-ink-100 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>

        <span aria-hidden className="mx-0.5 h-5 w-px bg-hairline" />

        <button
          type="button"
          aria-label={t.fit}
          onClick={fitToScreen}
          className="grid h-10 w-10 place-items-center rounded-full text-ink-700 active:bg-ink-100"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
