"use client";

import { useState, type DragEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { useUploads } from "@/hooks/useUploads";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { useCanvas } from "./CanvasProvider";
import { ZoomBar } from "./ZoomBar";

/**
 * The workspace. Three layers share the same box:
 *   0 — paper underlay (card sheet + shadow)
 *   1 — Fabric artwork canvas (the only layer that is ever exported)
 *   2 — guide overlay (bleed, trim, safe area, grid)
 */
export function CanvasStage() {
  const { containerRef, canvasElRef, underlayRef, overlayRef, isReady } =
    useCanvas();
  const { ingest } = useUploads();
  const { addImage } = useCanvasActions();
  const [isDropping, setIsDropping] = useState(false);

  /** Dropping artwork straight onto the card adds it in one step. */
  const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    setIsDropping(false);

    const files = event.dataTransfer.files;
    if (!files.length) return;

    const assets = await ingest(files);
    for (const asset of assets) await addImage(asset);
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-workspace">
      <div
        ref={containerRef}
        data-canvas-layers
        className="relative flex-1 overflow-hidden"
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          setIsDropping(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setIsDropping(false);
        }}
        onDrop={(event) => void handleDrop(event)}
      >
        <canvas
          ref={underlayRef}
          className="pointer-events-none absolute inset-0 z-0"
        />
        {/* Fabric wraps this element in .canvas-container — positioned in CSS. */}
        <canvas ref={canvasElRef} />
        <canvas
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 z-20"
        />

        <div
          className={cn(
            "pointer-events-none absolute inset-3 z-30 grid place-items-center rounded-xl border-2 border-dashed border-brand-400 bg-brand-50/70 text-sm font-medium text-brand-700 transition-opacity",
            isDropping ? "opacity-100" : "opacity-0",
          )}
        >
          Drop to add to the card
        </div>

        {!isReady ? (
          <div className="absolute inset-0 grid place-items-center text-sm text-ink-400">
            Preparing canvas…
          </div>
        ) : null}
      </div>

      <ZoomBar />
    </div>
  );
}
