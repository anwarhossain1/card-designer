"use client";

import { useCallback } from "react";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import {
  addElement,
  deleteSelected,
  duplicateSelected,
  nudgeSelected,
  updateSelected,
} from "@/lib/canvas/actions";
import { createTextElement } from "@/lib/canvas/elements/text";
import { loadFont } from "@/lib/fonts/loader";
import { DEFAULT_FONT_FAMILY } from "@/config/fonts";
import type { TextVariant } from "@/types/element";

/**
 * Element operations bound to the live canvas. Components call these instead of
 * touching Fabric, so every mutation goes through one audited path.
 */
export function useCanvasActions() {
  const { canvasRef, refresh } = useCanvas();

  const addText = useCallback(
    async (variant: TextVariant) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Fabric measures text against the loaded font, so wait for it first.
      await loadFont(DEFAULT_FONT_FAMILY);

      const element = createTextElement(variant);
      addElement(canvas, element);
      element.initDimensions();
      canvas.requestRenderAll();
      refresh();
    },
    [canvasRef, refresh],
  );

  const update = useCallback(
    (properties: Record<string, unknown>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      updateSelected(canvas, properties);
      refresh();
    },
    [canvasRef, refresh],
  );

  /** Font changes need the family available before the box is remeasured. */
  const updateFontFamily = useCallback(
    async (family: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await loadFont(family);
      updateSelected(canvas, { fontFamily: family });
      canvas.getActiveObjects().forEach((object) => {
        if ("initDimensions" in object) {
          (object as { initDimensions: () => void }).initDimensions();
        }
      });
      canvas.requestRenderAll();
      refresh();
    },
    [canvasRef, refresh],
  );

  const remove = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    deleteSelected(canvas);
    refresh();
  }, [canvasRef, refresh]);

  const duplicate = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await duplicateSelected(canvas);
    refresh();
  }, [canvasRef, refresh]);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      nudgeSelected(canvas, dx, dy);
      refresh();
    },
    [canvasRef, refresh],
  );

  const deselect = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, [canvasRef]);

  return { addText, update, updateFontFamily, remove, duplicate, nudge, deselect };
}
