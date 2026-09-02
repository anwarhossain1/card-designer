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
import { getMeta } from "@/lib/canvas/meta";
import { DEFAULT_QR_CONFIG, type QrConfig } from "@/lib/qr/config";
import type { FabricObject } from "fabric";
import {
  applyBackground,
  type BackgroundSpec,
} from "@/lib/canvas/elements/background";
import { applyTemplate } from "@/lib/templates/apply";
import type { CardTemplate } from "@/types/template";
import { loadFont } from "@/lib/fonts/loader";
import { DEFAULT_FONT_FAMILY } from "@/config/fonts";
import type { UploadedAsset } from "@/lib/uploads/readFile";
import type { ShapeVariant, TextVariant } from "@/types/element";
import { useEditorStore } from "@/store/editorStore";

/**
 * Element operations bound to the live canvas. Components call these instead of
 * touching Fabric, so every mutation goes through one audited path.
 */
export function useCanvasActions() {
  const { canvasRef, refresh } = useCanvas();
  const setTemplateId = useEditorStore((state) => state.setTemplateId);

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

  /**
   * A text element bound to a roster column for batch generation. The chip
   * text `{{key}}` is real, styleable text — what you style is what every
   * generated card gets.
   */
  const addDataField = useCallback(
    async (key: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await loadFont(DEFAULT_FONT_FAMILY);

      const element = createTextElement("custom", `{{${key}}}`);
      const meta = getMeta(element);
      if (meta) {
        meta.fieldKey = key;
        meta.name = key;
      }
      addElement(canvas, element);
      element.initDimensions();
      canvas.requestRenderAll();
      refresh();
    },
    [canvasRef, refresh],
  );

  /** A QR whose payload becomes each row's value — the scannable student id. */
  const addDataQr = useCallback(
    async (key: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const element = await createQrElement({
        ...DEFAULT_QR_CONFIG,
        website: `{{${key}}}`,
        transparentBackground: true,
      });
      if (!element) return;

      const meta = getMeta(element);
      if (meta) {
        meta.fieldKey = key;
        meta.name = key;
      }
      addElement(canvas, element);
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
    async (spec: BackgroundSpec) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await applyBackground(canvas, spec);
      refresh();
    },
    [canvasRef, refresh],
  );

  /* Named `selectTemplate`, not `useTemplate` — a use* action reads as a hook. */
  const selectTemplate = useCallback(
    async (template: CardTemplate) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await applyTemplate(canvas, template);
      setTemplateId(template.id);
      refresh();
    },
    [canvasRef, refresh, setTemplateId],
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
    addDataField,
    addDataQr,
    addShape,
    addIcon,
    addImage,
    addQr,
    updateQr,
    setBackground,
    selectTemplate,
    setIconStyle,
    update,
    updateFontFamily,
    remove,
    duplicate,
    nudge,
    deselect,
  };
}
