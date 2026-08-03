import { Point, type Canvas, type TMat2D } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH, ZOOM } from "@/config/document";
import { clamp } from "@/lib/utils/units";

export interface Size {
  width: number;
  height: number;
}

/**
 * Space kept between the card and the workspace edges when fitting. A fixed
 * 56px would eat nearly a third of a 390px phone, so it scales down with the
 * viewport.
 */
const fitPadding = (container: Size) =>
  Math.min(56, Math.round(Math.min(container.width, container.height) * 0.07));

export const clampZoom = (zoom: number) => clamp(zoom, ZOOM.min, ZOOM.max);

/** Largest zoom that keeps the whole card (plus padding) visible. */
export function getFitZoom(container: Size): number {
  const padding = fitPadding(container);
  const available = {
    width: Math.max(container.width - padding * 2, 40),
    height: Math.max(container.height - padding * 2, 40),
  };

  return clampZoom(
    Math.min(available.width / CANVAS_WIDTH, available.height / CANVAS_HEIGHT),
  );
}

/** Viewport transform that renders the card centred at the given zoom. */
export function getCenteredTransform(container: Size, zoom: number): TMat2D {
  return [
    zoom,
    0,
    0,
    zoom,
    (container.width - CANVAS_WIDTH * zoom) / 2,
    (container.height - CANVAS_HEIGHT * zoom) / 2,
  ];
}

export function fitToScreen(canvas: Canvas, container: Size): number {
  const zoom = getFitZoom(container);
  canvas.setViewportTransform(getCenteredTransform(container, zoom));
  canvas.requestRenderAll();
  return zoom;
}

/** Zoom around a point in screen coordinates (defaults to the viewport centre). */
export function zoomTo(canvas: Canvas, zoom: number, focus?: Point): number {
  const next = clampZoom(zoom);
  const point =
    focus ??
    new Point(canvas.getWidth() / 2, canvas.getHeight() / 2);

  canvas.zoomToPoint(point, next);
  canvas.requestRenderAll();
  return next;
}

export function panBy(canvas: Canvas, dx: number, dy: number) {
  canvas.relativePan(new Point(dx, dy));
}

/** Card bounds in screen coordinates, derived from the viewport transform. */
export function getCardScreenRect(canvas: Canvas) {
  const [zoom, , , , offsetX, offsetY] = canvas.viewportTransform;

  return {
    x: offsetX,
    y: offsetY,
    width: CANVAS_WIDTH * zoom,
    height: CANVAS_HEIGHT * zoom,
    zoom,
  };
}

/**
 * Keeps the card visually anchored when the workspace resizes, instead of
 * letting it drift toward a corner.
 */
export function preserveCenterOnResize(
  canvas: Canvas,
  previous: Size,
  next: Size,
) {
  const vpt = [...canvas.viewportTransform] as TMat2D;
  vpt[4] += (next.width - previous.width) / 2;
  vpt[5] += (next.height - previous.height) / 2;
  canvas.setViewportTransform(vpt);
}

/** How much of the card must stay on screen, in pixels. */
const MIN_VISIBLE = 48;

/**
 * Pulls the card back if it has left the workspace.
 *
 * Panning can be over-shot, and a transient container size during mount can
 * throw the transform a full viewport off — after which the canvas looks
 * empty with no obvious way back. Clamping after every viewport change makes
 * losing the card impossible.
 *
 * Returns true when it had to intervene.
 */
export function clampViewportToCard(canvas: Canvas, container: Size): boolean {
  const { x, y, width, height } = getCardScreenRect(canvas);

  const dx =
    x + width < MIN_VISIBLE
      ? MIN_VISIBLE - (x + width)
      : x > container.width - MIN_VISIBLE
        ? container.width - MIN_VISIBLE - x
        : 0;

  const dy =
    y + height < MIN_VISIBLE
      ? MIN_VISIBLE - (y + height)
      : y > container.height - MIN_VISIBLE
        ? container.height - MIN_VISIBLE - y
        : 0;

  if (dx === 0 && dy === 0) return false;

  const vpt = [...canvas.viewportTransform] as TMat2D;
  vpt[4] += dx;
  vpt[5] += dy;
  canvas.setViewportTransform(vpt);
  canvas.requestRenderAll();
  return true;
}
