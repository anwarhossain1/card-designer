"use client";

import { useCallback, useRef, useState } from "react";

/** Ignore a few pixels of finger tremor before treating a press as a drag. */
const DRAG_SLOP = 6;

export interface LayerDragState {
  /** Index being dragged, or null. */
  fromIndex: number | null;
  /** Index the row would drop into. */
  overIndex: number | null;
  startDrag: (index: number, event: React.PointerEvent) => void;
}

/**
 * Pointer-based row reordering.
 *
 * HTML5 drag-and-drop never fires on touch, so the layer list was
 * mouse-only. Pointer events cover mouse, touch and pen with one path, and
 * hit-testing with `elementFromPoint` keeps it independent of row heights.
 */
export function useLayerDrag(onReorder: (from: number, to: number) => void) {
  const [fromIndex, setFromIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const origin = useRef({ x: 0, y: 0 });
  const started = useRef(false);
  const current = useRef<{ from: number; to: number } | null>(null);

  const startDrag = useCallback(
    (index: number, event: React.PointerEvent) => {
      const handle = event.currentTarget as HTMLElement;

      /*
       * Capture keeps the drag alive when the finger leaves the grip, but it
       * throws if the browser no longer considers the pointer active. Losing
       * capture degrades the drag; letting it throw would cancel it outright.
       */
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        // Continue without capture.
      }

      origin.current = { x: event.clientX, y: event.clientY };
      started.current = false;
      current.current = { from: index, to: index };

      const onMove = (move: PointerEvent) => {
        if (!started.current) {
          const moved = Math.hypot(
            move.clientX - origin.current.x,
            move.clientY - origin.current.y,
          );
          if (moved < DRAG_SLOP) return;

          started.current = true;
          setFromIndex(index);
        }

        const row = document
          .elementFromPoint(move.clientX, move.clientY)
          ?.closest<HTMLElement>("[data-layer-index]");

        if (!row) return;

        const to = Number(row.dataset.layerIndex);
        if (Number.isNaN(to)) return;

        current.current = { from: index, to };
        setOverIndex(to);
      };

      const finish = () => {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", finish);
        handle.removeEventListener("pointercancel", finish);

        const drag = current.current;
        if (started.current && drag && drag.from !== drag.to) {
          onReorder(drag.from, drag.to);
        }

        started.current = false;
        current.current = null;
        setFromIndex(null);
        setOverIndex(null);
      };

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", finish);
      handle.addEventListener("pointercancel", finish);
    },
    [onReorder],
  );

  return { fromIndex, overIndex, startDrag };
}
