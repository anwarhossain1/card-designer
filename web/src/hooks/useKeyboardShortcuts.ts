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
 * Editor shortcuts. Everything yields while a form field has focus or a text
 * element is being edited in place, so typing always wins.
 */
export function useKeyboardShortcuts() {
  const { canvasRef, undo, redo, copy, cut, paste, switchSide } = useCanvas();
  const { remove, duplicate, nudge, deselect } = useCanvasActions();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || isTypingTarget(event.target)) return;

      // Never hijack keys while text is being edited in place.
      const active = canvas.getActiveObject();
      if (active && "isEditing" in active && active.isEditing) return;

      const modifier = event.ctrlKey || event.metaKey;
      const hasSelection = canvas.getActiveObjects().length > 0;
      const step = event.shiftKey ? NUDGE_LARGE : NUDGE;

      // Ctrl+PageUp/PageDown moves between pages elsewhere; with two sides it
      // reads as "the one before" and "the one after".
      if (modifier && (event.key === "PageUp" || event.key === "PageDown")) {
        event.preventDefault();
        void switchSide(event.key === "PageUp" ? "front" : "back");
        return;
      }

      if (modifier) {
        switch (event.key.toLowerCase()) {
          case "z":
            event.preventDefault();
            void (event.shiftKey ? redo() : undo());
            return;
          case "y":
            event.preventDefault();
            void redo();
            return;
          case "c":
            if (!hasSelection) return;
            event.preventDefault();
            void copy();
            return;
          case "x":
            if (!hasSelection) return;
            event.preventDefault();
            void cut();
            return;
          case "v":
            event.preventDefault();
            void paste();
            return;
          case "d":
            event.preventDefault();
            void duplicate();
            return;
          default:
            return;
        }
      }

      switch (event.key) {
        case "Delete":
        case "Backspace":
          if (!hasSelection) return;
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
          if (!hasSelection) return;
          event.preventDefault();
          const dx =
            event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
          const dy =
            event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
          nudge(dx, dy);
          return;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    canvasRef,
    copy,
    cut,
    deselect,
    duplicate,
    nudge,
    paste,
    redo,
    remove,
    switchSide,
    undo,
  ]);
}
