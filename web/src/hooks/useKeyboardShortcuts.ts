"use client";

import { useEffect } from "react";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useCanvasActions } from "./useCanvasActions";

const NUDGE = 1;
const NUDGE_LARGE = 10;

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Element-level shortcuts. Undo/redo and clipboard arrive with the history
 * feature; these are the ones the element system already supports.
 */
export function useKeyboardShortcuts() {
  const { canvasRef } = useCanvas();
  const { remove, duplicate, nudge, deselect } = useCanvasActions();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || isTypingTarget(event.target)) return;

      // Never hijack keys while text is being edited in place.
      const active = canvas.getActiveObject();
      if (active && "isEditing" in active && active.isEditing) return;

      const modifier = event.ctrlKey || event.metaKey;
      const step = event.shiftKey ? NUDGE_LARGE : NUDGE;

      switch (event.key) {
        case "Delete":
        case "Backspace":
          if (canvas.getActiveObjects().length === 0) return;
          event.preventDefault();
          remove();
          return;

        case "Escape":
          deselect();
          return;

        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown": {
          if (canvas.getActiveObjects().length === 0) return;
          event.preventDefault();
          const dx =
            event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
          const dy =
            event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
          nudge(dx, dy);
          return;
        }

        default:
          if (modifier && event.key.toLowerCase() === "d") {
            event.preventDefault();
            void duplicate();
          }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canvasRef, deselect, duplicate, nudge, remove]);
}
