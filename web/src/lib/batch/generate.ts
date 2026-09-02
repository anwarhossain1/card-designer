import type { StaticCanvas, Textbox } from "fabric";
import { PRINT_DPI, DESIGN_DPI } from "@/config/document";
import { buildQrArtwork } from "@/lib/canvas/elements/qr";
import { getMeta } from "@/lib/canvas/meta";
import { renderScene } from "@/lib/export/exportCard";
import type { CardSide, SceneJSON } from "@/types/document";
import {
  elementMatchesField,
  sceneObjects,
  type MergeField,
} from "./fields";

/**
 * Batch rendering: one design, N rows, N cards.
 *
 * Each card is a throwaway clone of the scene JSON with field text swapped
 * in, pushed through the same StaticCanvas pipeline every single-card export
 * already uses — so batch output is pixel-identical to what the editor's own
 * download produces.
 */

export interface BatchRow {
  /** Field key → value for this card. */
  values: Record<string, string>;
  /** Base file name, already unique across the batch. */
  fileName: string;
}

export interface RenderedCard {
  fileName: string;
  sides: { id: CardSide["id"]; dataUrl: string }[];
}

/** Long names shrink to fit; below this fraction the row was flagged upstream. */
const MIN_FONT_RATIO = 0.6;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * Returns the sides with `fields` replaced by `values`, plus the element ids
 * that changed — the renderer needs those to fit and to rebuild QRs.
 */
function substituteSides(
  sides: readonly CardSide[],
  fields: readonly MergeField[],
  values: Record<string, string>,
): { sides: CardSide[]; textIds: Set<string>; qrIds: Map<string, string> } {
  const copies = clone([...sides]);
  const textIds = new Set<string>();
  const qrIds = new Map<string, string>();

  for (const side of copies) {
    for (const object of sceneObjects(side.scene)) {
      const meta = object.meta;
      if (!meta) continue;

      const field = fields.find((f) => elementMatchesField(meta, f));
      if (!field) continue;
      const value = values[field.key];
      if (value === undefined) continue;

      if (meta.kind === "text") {
        object.text = value;
        textIds.add(meta.id);
      } else if (meta.kind === "qr" && value.trim()) {
        // Rebuilt on the canvas after load — JSON has no QR artwork to edit.
        qrIds.set(meta.id, value.trim());
      }
    }
  }

  return { sides: copies, textIds, qrIds };
}

/**
 * Shrinks substituted text that no longer fits its box.
 *
 * The designed layout is the contract: a long name may not push into a second
 * line the designer never planned for. Font size steps down until the line
 * count is back to the design's, or the floor is reached — at which point the
 * card still renders and the review step has already warned about the row.
 */
function fitSubstitutedText(canvas: StaticCanvas, textIds: Set<string>) {
  for (const object of canvas.getObjects()) {
    const meta = getMeta(object);
    if (!meta || !textIds.has(meta.id)) continue;
    // textIds only ever holds text elements; guard on capability, not on
    // `type`, whose casing changed across Fabric majors.
    if (!("initDimensions" in object)) continue;

    const textbox = object as Textbox;
    const designedLines = 1;
    const floor = (textbox.fontSize ?? 12) * MIN_FONT_RATIO;

    while (
      textbox.textLines.length > designedLines &&
      (textbox.fontSize ?? 0) > floor
    ) {
      textbox.set({ fontSize: (textbox.fontSize ?? 12) - 0.5 });
      textbox.initDimensions();
    }
  }
}

/**
 * Swaps bound QR artwork for codes carrying this row's value, verbatim — a
 * student id stays a student id, with no URL scheme guessed onto it.
 */
async function rebuildBoundQrs(canvas: StaticCanvas, qrIds: Map<string, string>) {
  for (const object of canvas.getObjects()) {
    const meta = getMeta(object);
    const value = meta ? qrIds.get(meta.id) : undefined;
    if (!meta || value === undefined) continue;

    // Encoded verbatim, styled like the template's QR so the swap is invisible.
    const replacement = await buildQrArtwork(value, qrStyle(object));
    if (!replacement) continue;

    const index = canvas.getObjects().indexOf(object);
    const scale =
      (object.getScaledWidth() || 1) / (replacement.width || 1);
    replacement.set({
      left: object.left,
      top: object.top,
      angle: object.angle,
      opacity: object.opacity,
      scaleX: scale,
      scaleY: scale,
      objectCaching: false,
    });
    (replacement as { meta?: unknown }).meta = { ...meta };

    canvas.remove(object);
    canvas.add(replacement);
    if (index >= 0) canvas.moveObjectTo(replacement, index);
  }
}

interface QrStyleSource {
  qr?: {
    darkColor?: string;
    lightColor?: string;
    transparentBackground?: boolean;
    margin?: number;
  };
}

function qrStyle(object: unknown) {
  const qr = (object as QrStyleSource).qr;
  return {
    darkColor: qr?.darkColor ?? "#11141c",
    lightColor: qr?.lightColor ?? "#ffffff",
    transparentBackground: qr?.transparentBackground ?? true,
    margin: qr?.margin ?? 0,
  };
}

export interface GenerateOptions {
  sides: readonly CardSide[];
  fields: readonly MergeField[];
  rows: readonly BatchRow[];
  /** "png" for the ZIP path, "pdf" collects pages. */
  format: "png" | "pdf";
  onProgress?: (done: number, total: number) => void;
  /** Lets a cancelled wizard stop mid-batch instead of finishing invisibly. */
  isCancelled?: () => boolean;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function renderBatch({
  sides,
  fields,
  rows,
  format,
  onProgress,
  isCancelled,
}: GenerateOptions): Promise<RenderedCard[]> {
  const multiplier = PRINT_DPI / DESIGN_DPI;
  const cards: RenderedCard[] = [];

  for (const [index, row] of rows.entries()) {
    if (isCancelled?.()) break;

    const { sides: merged, textIds, qrIds } = substituteSides(
      sides,
      fields,
      row.values,
    );

    const rendered: RenderedCard = { fileName: row.fileName, sides: [] };

    for (const side of merged) {
      // A never-drawn back adds nothing to a batch; skip instead of
      // shipping N copies of blank paper.
      if (!side.scene) continue;

      const canvas = await renderScene(side.scene, {
        transparent: false,
        format,
      });
      try {
        fitSubstitutedText(canvas, textIds);
        await rebuildBoundQrs(canvas, qrIds);
        canvas.renderAll();

        rendered.sides.push({
          id: side.id,
          dataUrl: canvas
            .toCanvasElement(multiplier)
            .toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.92),
        });
      } finally {
        void canvas.dispose();
      }
    }

    cards.push(rendered);
    onProgress?.(index + 1, rows.length);
    // Yield so the progress bar paints and the tab stays responsive.
    await wait(0);
  }

  return cards;
}

/** scene helper re-exported for the wizard's single-row preview. */
export function previewSides(
  sides: readonly CardSide[],
  fields: readonly MergeField[],
  values: Record<string, string>,
): CardSide[] {
  return substituteSides(sides, fields, values).sides;
}

export type { SceneJSON };
