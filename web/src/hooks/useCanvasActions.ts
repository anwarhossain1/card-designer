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
import { createShapeElement } from "@/lib/canvas/elements/shape";
import {
  createIconElement,
  setIconColor,
  setIconStrokeWidth,
} from "@/lib/canvas/elements/icon";
import { createImageElement } from "@/lib/canvas/elements/image";
import { createQrElement, updateQrElement } from "@/lib/canvas/elements/qr";
import type { QrConfig } from "@/lib/qr/config";
import type { FabricObject } from "fabric";
import {
  clearBackground,
  setGradientBackground,
  setImageBackground,
  setPatternBackground,
  setSolidBackground,
} from "@/lib/canvas/elements/background";
import { loadFont } from "@/lib/fonts/loader";
import { DEFAULT_FONT_FAMILY } from "@/config/fonts";
import type { UploadedAsset } from "@/lib/uploads/readFile";
import type { PatternId } from "@/lib/canvas/patterns";
import type { ShapeVariant, TextVariant } from "@/types/element";

export type BackgroundRequest =
  | { kind: "none" }
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number }
  | { kind: "image"; dataUrl: string }
  | { kind: "pattern"; id: PatternId; background: string; foreground: string };

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

  const addShape = useCallback(
    (variant: ShapeVariant) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      addElement(canvas, createShapeElement(variant));
      refresh();
    },
    [canvasRef, refresh],
  );

  const addIcon = useCallback(
    async (iconId: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const element = await createIconElement(iconId);
      if (!element) return;

      addElement(canvas, element);
      refresh();
    },
    [canvasRef, refresh],
  );

  const addImage = useCallback(
    async (asset: UploadedAsset) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const element = await createImageElement(asset);
      if (!element) return;

      addElement(canvas, element);
      refresh();
    },
    [canvasRef, refresh],
  );

  const addQr = useCallback(
    async (config: QrConfig) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const element = await createQrElement(config);
      if (!element) return;

      addElement(canvas, element);
      refresh();
    },
    [canvasRef, refresh],
  );

  const updateQr = useCallback(
    async (target: FabricObject, config: QrConfig) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await updateQrElement(canvas, target, config);
      refresh();
    },
    [canvasRef, refresh],
  );

  const setBackground = useCallback(
    async (request: BackgroundRequest) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      switch (request.kind) {
        case "none":
          clearBackground(canvas);
          canvas.requestRenderAll();
          break;
        case "solid":
          setSolidBackground(canvas, request.color);
          break;
        case "gradient":
          setGradientBackground(canvas, request);
          break;
        case "pattern":
          setPatternBackground(canvas, request);
          break;
        case "image":
          await setImageBackground(canvas, request.dataUrl);
          break;
      }

      refresh();
    },
    [canvasRef, refresh],
  );

  /** Icons are stroke-drawn groups, so style changes walk their parts. */
  const setIconStyle = useCallback(
    ({ color, strokeWidth }: { color?: string; strokeWidth?: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const targets = canvas.getActiveObjects();
      targets.forEach((object) => {
        if (color) setIconColor(object, color);
        if (strokeWidth !== undefined) setIconStrokeWidth(object, strokeWidth);
      });

      canvas.requestRenderAll();
      if (targets[0]) canvas.fire("object:modified", { target: targets[0] });
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

  return {
    addText,
    addShape,
    addIcon,
    addImage,
    addQr,
    updateQr,
    setBackground,
    setIconStyle,
    update,
    updateFontFamily,
    remove,
    duplicate,
    nudge,
    deselect,
  };
}
