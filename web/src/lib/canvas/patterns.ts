export type PatternId = "dots" | "stripes" | "grid" | "diagonal";

export interface PatternDefinition {
  id: PatternId;
  label: string;
  tile: number;
}

export const PATTERNS: PatternDefinition[] = [
  { id: "dots", label: "Dots", tile: 16 },
  { id: "stripes", label: "Stripes", tile: 16 },
  { id: "grid", label: "Grid", tile: 16 },
  { id: "diagonal", label: "Diagonal", tile: 16 },
];

/**
 * Draws a repeatable tile on an offscreen canvas for Fabric's Pattern fill.
 * Tiles are generated rather than shipped as assets so any colour pair works.
 */
export function createPatternTile(
  id: PatternId,
  background: string,
  foreground: string,
  tile = 16,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = tile;
  canvas.height = tile;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, tile, tile);
  ctx.fillStyle = foreground;
  ctx.strokeStyle = foreground;
  ctx.lineWidth = 1.5;

  switch (id) {
    case "dots":
      ctx.beginPath();
      ctx.arc(tile / 2, tile / 2, tile * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "stripes":
      ctx.fillRect(0, 0, tile, tile * 0.25);
      break;

    case "grid":
      ctx.beginPath();
      ctx.moveTo(0.5, 0);
      ctx.lineTo(0.5, tile);
      ctx.moveTo(0, 0.5);
      ctx.lineTo(tile, 0.5);
      ctx.stroke();
      break;

    case "diagonal":
      ctx.beginPath();
      // Draw the wrap-around segments too so the tile repeats seamlessly.
      ctx.moveTo(-tile, tile);
      ctx.lineTo(tile, -tile);
      ctx.moveTo(0, tile * 2);
      ctx.lineTo(tile * 2, 0);
      ctx.stroke();
      break;
  }

  return canvas;
}
