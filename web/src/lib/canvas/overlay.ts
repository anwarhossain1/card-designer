import { BLEED_PX, SAFE_AREA_PX, SNAP } from "@/config/document";
import type { ViewOptions } from "@/store/uiStore";

export interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

const COLORS = {
  paper: "#ffffff",
  paperEdge: "rgba(17, 20, 28, 0.12)",
  bleed: "#f0616a",
  safeArea: "#2f9bff",
  grid: "rgba(17, 20, 28, 0.07)",
};

/** Sizes a plain 2D layer to the workspace, accounting for device pixel ratio. */
export function resizeLayer(
  element: HTMLCanvasElement,
  size: { width: number; height: number },
  dpr: number,
): CanvasRenderingContext2D | null {
  element.width = Math.round(size.width * dpr);
  element.height = Math.round(size.height * dpr);
  element.style.width = `${size.width}px`;
  element.style.height = `${size.height}px`;

  const ctx = element.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function clearLayer(ctx: CanvasRenderingContext2D) {
  const { a: dpr } = ctx.getTransform();
  ctx.clearRect(0, 0, ctx.canvas.width / dpr, ctx.canvas.height / dpr);
}

/** Half-pixel offset keeps 1px strokes from smearing across two pixels. */
const crisp = (value: number) => Math.round(value) + 0.5;

function strokeRect(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  color: string,
  dash: number[] = [],
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash(dash);
  ctx.strokeRect(
    crisp(rect.x),
    crisp(rect.y),
    Math.round(rect.width),
    Math.round(rect.height),
  );
  ctx.restore();
}

/** The card itself: a white sheet with a soft drop shadow, drawn under artwork. */
export function drawPaper(ctx: CanvasRenderingContext2D, rect: ScreenRect) {
  clearLayer(ctx);

  ctx.save();
  ctx.shadowColor = "rgba(17, 20, 28, 0.22)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(
    Math.round(rect.x),
    Math.round(rect.y),
    Math.round(rect.width),
    Math.round(rect.height),
  );
  ctx.restore();
}

/** Print guides and grid, drawn above artwork and never exported. */
export function drawGuides(
  ctx: CanvasRenderingContext2D,
  rect: ScreenRect,
  view: ViewOptions,
) {
  clearLayer(ctx);

  if (view.grid) drawGrid(ctx, rect);

  if (view.bleed) {
    const bleed = BLEED_PX * rect.zoom;
    strokeRect(
      ctx,
      {
        x: rect.x - bleed,
        y: rect.y - bleed,
        width: rect.width + bleed * 2,
        height: rect.height + bleed * 2,
      },
      COLORS.bleed,
      [4, 4],
    );
  }

  strokeRect(ctx, rect, COLORS.paperEdge);

  if (view.safeArea) {
    const safe = SAFE_AREA_PX * rect.zoom;
    strokeRect(
      ctx,
      {
        x: rect.x + safe,
        y: rect.y + safe,
        width: rect.width - safe * 2,
        height: rect.height - safe * 2,
      },
      COLORS.safeArea,
      [4, 4],
    );
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, rect: ScreenRect) {
  const step = SNAP.gridSize * rect.zoom;
  if (step < 4) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = rect.x + step; x < rect.x + rect.width; x += step) {
    ctx.moveTo(crisp(x), rect.y);
    ctx.lineTo(crisp(x), rect.y + rect.height);
  }
  for (let y = rect.y + step; y < rect.y + rect.height; y += step) {
    ctx.moveTo(rect.x, crisp(y));
    ctx.lineTo(rect.x + rect.width, crisp(y));
  }

  ctx.stroke();
  ctx.restore();
}
