import { StaticCanvas } from "fabric";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CARD_SIZE_IN,
  DESIGN_DPI,
  PRINT_DPI,
} from "@/config/document";
import { collectFontFamilies } from "@/lib/canvas/persistence";
import { loadFont } from "@/lib/fonts/loader";
import { getMeta } from "@/lib/canvas/meta";
import type { CardSide, SceneJSON } from "@/types/document";

export type ExportFormat = "png" | "jpeg" | "pdf";

/** Which sides one download covers. */
export type ExportScope = "front" | "back" | "both";

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

/** Browsers drop downloads fired in the same tick as the one before. */
const DOWNLOAD_GAP_MS = 250;

/** Revoking while the download is still being handed off cancels it. */
const REVOKE_DELAY_MS = 60_000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeFileName = (name: string) =>
  name
    .trim()
    .replace(/[^\w\- ]+/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase() || "business-card";

export function selectSides(
  sides: readonly CardSide[],
  scope: ExportScope,
): CardSide[] {
  return scope === "both"
    ? [...sides]
    : sides.filter((side) => side.id === scope);
}

/**
 * Renders one side on a fresh card-sized canvas.
 *
 * Exporting from a throwaway canvas — never the live one — guarantees that
 * guides, selection handles and viewport zoom can not leak into the file, that
 * anything hanging over the card edge is trimmed exactly at the bounds, and
 * that the side the user is *not* looking at can be exported at all.
 *
 * A null scene is a side that was never drawn on. It still renders: a blank
 * back is a legitimate thing to send to a printer.
 */
async function renderScene(
  scene: SceneJSON | null,
  options: ExportOptions,
): Promise<StaticCanvas> {
  if (scene) await Promise.all(collectFontFamilies(scene).map(loadFont));

  const canvas = new StaticCanvas(undefined, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    renderOnAddRemove: false,
  });

  if (scene) await canvas.loadFromJSON(scene);

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

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, encoded] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(header)?.[1] ?? "image/png";
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Hands one file to the browser.
 *
 * The URL has to be a blob rather than the `data:` URL the canvas produces:
 * browsers cap `data:` downloads at a few megabytes, which one 300 DPI card
 * carrying a photo background clears comfortably, and past that the download
 * is simply dropped. The anchor also has to be in the document, because a
 * click on a detached one is silently ignored in some browsers.
 */
function triggerDownload(dataUrl: string, fileName: string) {
  const url = URL.createObjectURL(dataUrlToBlob(dataUrl));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";

  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

/**
 * Writes the given sides out. PDF collects them as pages of one file; the image
 * formats have no such container, so each side becomes its own download.
 */
export async function exportCard(sides: CardSide[], options: ExportOptions) {
  if (sides.length === 0) return;

  const fileName = sanitizeFileName(options.fileName);
  // PDF embeds a raster; render it at print resolution regardless of preset.
  const multiplier =
    (options.format === "pdf" ? PRINT_DPI : options.dpi) / DESIGN_DPI;

  const pages: { id: CardSide["id"]; dataUrl: string }[] = [];
  for (const side of sides) {
    const canvas = await renderScene(side.scene, options);
    try {
      pages.push({
        id: side.id,
        dataUrl: canvas.toDataURL({
          format: options.format === "jpeg" ? "jpeg" : "png",
          quality: 0.92,
          multiplier,
        }),
      });
    } finally {
      void canvas.dispose();
    }
  }

  if (options.format === "pdf") {
    // Loaded on demand — most sessions never export a PDF.
    const { jsPDF } = await import("jspdf");
    const size: [number, number] = [CARD_SIZE_IN.width, CARD_SIZE_IN.height];
    const pdf = new jsPDF({ unit: "in", format: size, orientation: "landscape" });

    pages.forEach((page, index) => {
      if (index > 0) pdf.addPage(size, "landscape");
      pdf.addImage(page.dataUrl, "PNG", 0, 0, size[0], size[1]);
    });

    pdf.save(`${fileName}.pdf`);
    return;
  }

  const extension = options.format === "jpeg" ? "jpg" : "png";
  for (const [index, page] of pages.entries()) {
    // The suffix only earns its place when there is more than one file.
    const suffix = pages.length > 1 ? `-${page.id}` : "";
    if (index > 0) await wait(DOWNLOAD_GAP_MS);
    triggerDownload(page.dataUrl, `${fileName}${suffix}.${extension}`);
  }
}
