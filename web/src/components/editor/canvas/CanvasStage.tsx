"use client";

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

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-workspace">
      <div
        ref={containerRef}
        data-canvas-layers
        className="relative flex-1 overflow-hidden"
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
