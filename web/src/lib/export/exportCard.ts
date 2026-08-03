import { StaticCanvas } from "fabric";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CARD_SIZE_IN,
  DESIGN_DPI,
} from "@/config/document";
import { collectFontFamilies } from "@/lib/canvas/persistence";
import { loadFont } from "@/lib/fonts/loader";
import { getMeta } from "@/lib/canvas/meta";
import type { SceneJSON } from "@/types/document";

export type ExportFormat = "png" | "jpeg" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  /** Output resolution; 300 is print quality. */
  dpi: number;
  /** PNG only: omit the backdrop and the white backing. */
  transparent: boolean;
  fileName: string;
}

/** `labelKey` indexes the download dictionary, so presets stay translatable. */
export const DPI_PRESETS = [
  { dpi: DESIGN_DPI, labelKey: "dpiStandard" },
  { dpi: DESIGN_DPI * 2, labelKey: "dpiLarge" },
  { dpi: 300, labelKey: "dpiPrint" },
] as const;

const sanitizeFileName = (name: string) =>
  name
    .trim()
    .replace(/[^\w\- ]+/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase() || "business-card";

/**
 * Renders the scene on a fresh card-sized canvas.
 *
 * Exporting from a throwaway canvas — never the live one — guarantees that
 * guides, selection handles and viewport zoom can not leak into the file, and
 * that anything hanging over the card edge is trimmed exactly at the bounds.
 */
async function renderScene(
  scene: SceneJSON,
  options: ExportOptions,
): Promise<StaticCanvas> {
  await Promise.all(collectFontFamilies(scene).map(loadFont));

  const canvas = new StaticCanvas(undefined, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    renderOnAddRemove: false,
  });

  await canvas.loadFromJSON(scene);

  if (options.transparent && options.format === "png") {
    canvas.remove(
      ...canvas.getObjects().filter((o) => getMeta(o)?.kind === "background"),
    );
    canvas.backgroundColor = "";
  } else {
    // The card is physically white paper; JPEG has no alpha at all.
    canvas.backgroundColor = canvas
      .getObjects()
      .some((o) => getMeta(o)?.kind === "background")
      ? ""
      : "#ffffff";
  }

  canvas.renderAll();
  return canvas;
}

function triggerDownload(url: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
}

export async function exportCard(scene: SceneJSON, options: ExportOptions) {
  const fileName = sanitizeFileName(options.fileName);
  // PDF embeds a raster; render it at print resolution regardless of preset.
  const dpi = options.format === "pdf" ? 300 : options.dpi;
  const canvas = await renderScene(scene, options);

  try {
    const dataUrl = canvas.toDataURL({
      format: options.format === "jpeg" ? "jpeg" : "png",
      quality: 0.92,
      multiplier: dpi / DESIGN_DPI,
    });

    if (options.format === "pdf") {
      // Loaded on demand — most sessions never export a PDF.
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        unit: "in",
        format: [CARD_SIZE_IN.width, CARD_SIZE_IN.height],
        orientation: "landscape",
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, CARD_SIZE_IN.width, CARD_SIZE_IN.height);
      pdf.save(`${fileName}.pdf`);
      return;
    }

    triggerDownload(dataUrl, `${fileName}.${options.format === "jpeg" ? "jpg" : "png"}`);
  } finally {
    void canvas.dispose();
  }
}
