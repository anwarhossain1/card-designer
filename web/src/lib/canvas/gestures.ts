import { Point, type Canvas } from "fabric";
import { clampViewportToCard, clampZoom, panBy, zoomTo, type Size } from "./viewport";

interface GestureOptions {
  container: HTMLElement;
  canvas: Canvas;
  /** Reports the zoom back to React after a pinch. */
  onZoom: (zoom: number) => void;
  onFit: () => void;
  getSize: () => Size;
}

/** Two taps closer together than this, in ms and px, count as a double tap. */
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP = 32;

const distance = (a: Touch, b: Touch) =>
  Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

const midpoint = (a: Touch, b: Touch) => ({
  x: (a.clientX + b.clientX) / 2,
  y: (a.clientY + b.clientY) / 2,
});

/**
 * Pinch-to-zoom, two-finger pan and double-tap-to-fit.
 *
 * Fabric v6 routes single touches through its pointer pipeline, so dragging
 * and resizing elements already work; it has no gesture support of its own
 * (v5's was dropped), which is what this adds.
 *
 * Listeners are attached in the capture phase on the container — an ancestor
 * of Fabric's canvases — so a second finger stops the event before Fabric sees
 * it. Otherwise a pinch would be interpreted as dragging whatever the first
 * finger landed on.
 */
export function attachTouchGestures({
  container,
  canvas,
  onZoom,
  onFit,
  getSize,
}: GestureOptions): () => void {
  let pinchDistance = 0;
  let pinchCentre = { x: 0, y: 0 };
  let isPinching = false;

  let lastTapAt = 0;
  let lastTapPoint = { x: 0, y: 0 };

  const localPoint = (x: number, y: number) => {
    const bounds = container.getBoundingClientRect();
    return new Point(x - bounds.left, y - bounds.top);
  };

  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length < 2) return;

    const [first, second] = [event.touches[0]!, event.touches[1]!];
    isPinching = true;
    pinchDistance = distance(first, second);
    pinchCentre = midpoint(first, second);

    event.preventDefault();
    event.stopPropagation();
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!isPinching || event.touches.length < 2) return;

    const [first, second] = [event.touches[0]!, event.touches[1]!];
    const nextDistance = distance(first, second);
    const nextCentre = midpoint(first, second);

    if (pinchDistance > 0) {
      const ratio = nextDistance / pinchDistance;
      const focus = localPoint(nextCentre.x, nextCentre.y);
      onZoom(zoomTo(canvas, clampZoom(canvas.getZoom() * ratio), focus));
    }

    // Moving both fingers together pans, exactly like a trackpad gesture.
    panBy(canvas, nextCentre.x - pinchCentre.x, nextCentre.y - pinchCentre.y);
    clampViewportToCard(canvas, getSize());

    pinchDistance = nextDistance;
    pinchCentre = nextCentre;

    event.preventDefault();
    event.stopPropagation();
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (isPinching && event.touches.length < 2) {
      isPinching = false;
      pinchDistance = 0;
      return;
    }

    if (event.touches.length > 0 || event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0]!;
    const now = Date.now();
    const isRepeat =
      now - lastTapAt < DOUBLE_TAP_MS &&
      Math.hypot(touch.clientX - lastTapPoint.x, touch.clientY - lastTapPoint.y) <
        DOUBLE_TAP_SLOP;

    lastTapAt = now;
    lastTapPoint = { x: touch.clientX, y: touch.clientY };

    if (!isRepeat) return;

    /*
     * Only fit when the tap misses every element — double-tapping a text box
     * has to keep meaning "edit this", which Fabric handles itself.
     */
    if (canvas.findTarget(event)) return;

    lastTapAt = 0;
    onFit();
  };

  const options = { passive: false, capture: true } as const;
  container.addEventListener("touchstart", onTouchStart, options);
  container.addEventListener("touchmove", onTouchMove, options);
  container.addEventListener("touchend", onTouchEnd, options);
  container.addEventListener("touchcancel", onTouchEnd, options);

  return () => {
    container.removeEventListener("touchstart", onTouchStart, options);
    container.removeEventListener("touchmove", onTouchMove, options);
    container.removeEventListener("touchend", onTouchEnd, options);
    container.removeEventListener("touchcancel", onTouchEnd, options);
  };
}
