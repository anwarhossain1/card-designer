"use client";

import { Grid3x3, Maximize, Minus, Plus, Ruler, Square } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useUiStore } from "@/store/uiStore";
import { ZOOM } from "@/config/document";
import { useCanvas } from "./CanvasProvider";

const PRESETS = [0.5, 1, 2, 4];

export function ZoomBar() {
  const { zoom, zoomIn, zoomOut, setZoom, fitToScreen } = useCanvas();
  const view = useUiStore((state) => state.view);
  const toggleView = useUiStore((state) => state.toggleView);

  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-4 border-t border-hairline bg-panel px-3">
      <div className="flex items-center gap-1">
        <IconButton
          size="sm"
          label="Show grid"
          active={view.grid}
          onClick={() => toggleView("grid")}
        >
          <Grid3x3 className="h-4 w-4" />
        </IconButton>
        <IconButton
          size="sm"
          label="Show safe area"
          active={view.safeArea}
          onClick={() => toggleView("safeArea")}
        >
          <Square className="h-4 w-4" />
        </IconButton>
        <IconButton
          size="sm"
          label="Show bleed"
          active={view.bleed}
          onClick={() => toggleView("bleed")}
        >
          <Ruler className="h-4 w-4" />
        </IconButton>
        <span className="ml-2 hidden text-xs text-ink-400 lg:inline">
          3.5 × 2 in · 300 DPI ready
        </span>
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          size="sm"
          label="Zoom out"
          onClick={zoomOut}
          disabled={zoom <= ZOOM.min}
        >
          <Minus className="h-4 w-4" />
        </IconButton>

        <input
          type="range"
          aria-label="Zoom level"
          min={ZOOM.min * 100}
          max={ZOOM.max * 100}
          value={Math.round(zoom * 100)}
          onChange={(event) => setZoom(Number(event.target.value) / 100)}
          className="h-1 w-28 cursor-pointer appearance-none rounded-full bg-ink-200 accent-brand-600"
        />

        <IconButton
          size="sm"
          label="Zoom in"
          onClick={zoomIn}
          disabled={zoom >= ZOOM.max}
        >
          <Plus className="h-4 w-4" />
        </IconButton>

        <select
          aria-label="Zoom preset"
          value={PRESETS.includes(round(zoom)) ? round(zoom) : ""}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="ml-1 h-7 w-[4.5rem] rounded-md border border-hairline bg-panel px-1.5 text-xs text-ink-700 outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <option value="" disabled hidden>
            {Math.round(zoom * 100)}%
          </option>
          {PRESETS.map((preset) => (
            <option key={preset} value={preset}>
              {preset * 100}%
            </option>
          ))}
        </select>

        <IconButton size="sm" label="Fit to screen" onClick={fitToScreen}>
          <Maximize className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}

const round = (value: number) => Math.round(value * 100) / 100;
