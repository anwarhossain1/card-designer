import { CARD_SIZE_IN } from "@/config/document";
import type { RenderedCard } from "./generate";

/**
 * Batch outputs: a ZIP of images, or one PDF a print shop can run as-is.
 * Both build fully in memory and leave through a single browser download.
 */

const sanitize = (name: string) =>
  name
    .trim()
    .replace(/[^\p{L}\p{N}\- ]+/gu, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

/**
 * File names from a roster column, made unique. Two students named Rahim
 * must not overwrite each other inside the ZIP.
 */
export function buildFileNames(
  values: readonly string[],
  fallbackPrefix: string,
): string[] {
  const used = new Map<string, number>();

  return values.map((value, index) => {
    const base = sanitize(value) || `${fallbackPrefix}-${index + 1}`;
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  });
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

const stripDataUrl = (dataUrl: string) => dataUrl.split(",")[1] ?? "";

export async function downloadZip(cards: RenderedCard[], zipName: string) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  for (const card of cards) {
    for (const side of card.sides) {
      const suffix = card.sides.length > 1 ? `-${side.id}` : "";
      zip.file(`${card.fileName}${suffix}.png`, stripDataUrl(side.dataUrl), {
        base64: true,
      });
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, `${sanitize(zipName) || "cards"}.zip`);
}

/** One card per page, front then back, so duplex printing pairs correctly. */
export async function downloadPdf(cards: RenderedCard[], pdfName: string) {
  const { jsPDF } = await import("jspdf");
  const size: [number, number] = [CARD_SIZE_IN.width, CARD_SIZE_IN.height];
  const pdf = new jsPDF({ unit: "in", format: size, orientation: "landscape" });

  let first = true;
  for (const card of cards) {
    for (const side of card.sides) {
      if (!first) pdf.addPage(size, "landscape");
      first = false;
      pdf.addImage(side.dataUrl, "JPEG", 0, 0, size[0], size[1]);
    }
  }

  pdf.save(`${sanitize(pdfName) || "cards"}.pdf`);
}
