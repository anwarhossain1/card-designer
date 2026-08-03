import { Point, type Canvas, type TMat2D } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH, ZOOM } from "@/config/document";
import { clamp } from "@/lib/utils/units";

export interface Size {
  width: number;
  height: number;
}

/** Space kept between the card and the workspace edges when fitting. */
const FIT_PADDING = 56;

export const clampZoom = (zoom: number) => clamp(zoom, ZOOM.min, ZOOM.max);

/** Largest zoom that keeps the whole card (plus padding) visible. */
export function getFitZoom(container: Size): number {
  const available = {
    width: Math.max(container.width - FIT_PADDING * 2, 40),
    height: Math.max(container.height - FIT_PADDING * 2, 40),
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
