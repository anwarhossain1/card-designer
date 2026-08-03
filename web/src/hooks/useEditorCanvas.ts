"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Point, type Canvas, type TPointerEvent } from "fabric";
import { ZOOM } from "@/config/document";
import { createArtworkCanvas } from "@/lib/canvas/setup";
import {
  clampZoom,
  fitToScreen as fitCanvasToScreen,
  getCardScreenRect,
  panBy,
  preserveCenterOnResize,
  zoomTo,
} from "@/lib/canvas/viewport";
import { drawGuides, drawPaper, resizeLayer } from "@/lib/canvas/overlay";
import { useUiStore } from "@/store/uiStore";

/**
 * Owns the Fabric canvas lifecycle and every viewport interaction.
 *
 * Three stacked layers share one workspace: the paper underlay, the Fabric
 * artwork canvas, and the guides overlay. Only the middle layer is ever
 * exported, so guides can never end up in a print file.
 */
export function useEditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const underlayRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const canvasRef = useRef<Canvas | null>(null);
  /** Resolves once the previous canvas instance has fully torn down. */
  const teardownRef = useRef<Promise<unknown>>(Promise.resolve());
  const underlayCtx = useRef<CanvasRenderingContext2D | null>(null);
  const overlayCtx = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  const isSpaceDown = useRef(false);
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const [zoom, setZoomState] = useState<number>(ZOOM.default);
  const [isReady, setIsReady] = useState(false);

  const view = useUiStore((state) => state.view);
  const viewRef = useRef(view);
  viewRef.current = view;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = getCardScreenRect(canvas);
    if (underlayCtx.current) drawPaper(underlayCtx.current, rect);
    if (overlayCtx.current) drawGuides(overlayCtx.current, rect, viewRef.current);
  }, []);

  const syncLayers = useCallback(
    (size: { width: number; height: number }) => {
      const dpr = window.devicePixelRatio || 1;
      if (underlayRef.current) {
        underlayCtx.current = resizeLayer(underlayRef.current, size, dpr);
      }
      if (overlayRef.current) {
        overlayCtx.current = resizeLayer(overlayRef.current, size, dpr);
      }
      draw();
    },
    [draw],
  );

  /* ---------------------------------------------------------------- actions */

  const fitToScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setZoomState(fitCanvasToScreen(canvas, sizeRef.current));
  }, []);

  const setZoom = useCallback((value: number, focus?: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setZoomState(zoomTo(canvas, value, focus));
  }, []);

  const zoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setZoomState(zoomTo(canvas, canvas.getZoom() * (1 + ZOOM.step * 2)));
  }, []);

  const zoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setZoomState(zoomTo(canvas, canvas.getZoom() / (1 + ZOOM.step * 2)));
  }, []);

  /* ----------------------------------------------------------------- mount */

  useEffect(() => {
    const container = containerRef.current;
    const element = canvasElRef.current;
    if (!container || !element) return;

    let canvas: Canvas | null = null;
    let observer: ResizeObserver | null = null;
    let cancelled = false;

    const mount = async () => {
      /*
       * Fabric's dispose() finishes on the next animation frame. Re-initialising
       * the same element before that lands leaves a canvas that holds objects
       * but paints nothing — so always wait for the previous teardown. Strict
       * Mode's double-mount and client-side navigation both hit this path.
       */
      await teardownRef.current;
      if (cancelled) return;

      const size = {
        width: container.clientWidth,
        height: container.clientHeight,
      };
      sizeRef.current = size;

      canvas = createArtworkCanvas(element, size);
      canvasRef.current = canvas;

      canvas.on("after:render", draw);
      syncLayers(size);
      setZoomState(fitCanvasToScreen(canvas, size));
      setIsReady(true);

      observer = new ResizeObserver(([entry]) => {
        if (!entry || !canvas) return;
        const next = {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        };
        if (next.width === 0 || next.height === 0) return;

        preserveCenterOnResize(canvas, sizeRef.current, next);
        sizeRef.current = next;
        canvas.setDimensions(next);
        syncLayers(next);
      });
      observer.observe(container);
    };

    void mount();

    return () => {
      cancelled = true;
      observer?.disconnect();
      canvasRef.current = null;
      setIsReady(false);

      if (canvas) {
        canvas.off("after:render", draw);
        teardownRef.current = canvas.dispose().catch(() => undefined);
      }
    };
  }, [draw, syncLayers]);

  /* ------------------------------------------------------- pan interactions */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;

    const startPan = (clientX: number, clientY: number) => {
      isPanning.current = true;
      lastPointer.current = { x: clientX, y: clientY };
      canvas.selection = false;
      canvas.setCursor("grabbing");
    };

    const onMouseDown = ({ e }: { e: TPointerEvent }) => {
      const event = e as MouseEvent;
      if (!isSpaceDown.current && event.button !== 1) return;
      event.preventDefault();
      startPan(event.clientX, event.clientY);
    };

    const onMouseMove = ({ e }: { e: TPointerEvent }) => {
      if (!isPanning.current) return;
      const event = e as MouseEvent;
      panBy(
        canvas,
        event.clientX - lastPointer.current.x,
        event.clientY - lastPointer.current.y,
      );
      lastPointer.current = { x: event.clientX, y: event.clientY };
      canvas.setCursor("grabbing");
    };

    const endPan = () => {
      if (!isPanning.current) return;
      isPanning.current = false;
      canvas.selection = true;
      canvas.setCursor(isSpaceDown.current ? "grab" : "default");
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", endPan);

    return () => {
      canvas.off("mouse:down", onMouseDown);
      canvas.off("mouse:move", onMouseMove);
      canvas.off("mouse:up", endPan);
    };
  }, [isReady]);

  /* ----------------------------------------------------- wheel zoom and pan */

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isReady) return;

    const onWheel = (event: WheelEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      event.preventDefault();

      if (event.ctrlKey || event.metaKey) {
        const bounds = container.getBoundingClientRect();
        const focus = new Point(
          event.clientX - bounds.left,
          event.clientY - bounds.top,
        );
        const factor = 0.999 ** event.deltaY;
        setZoomState(zoomTo(canvas, clampZoom(canvas.getZoom() * factor), focus));
        return;
      }

      const [dx, dy] = event.shiftKey
        ? [-event.deltaY, 0]
        : [-event.deltaX, -event.deltaY];
      panBy(canvas, dx, dy);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [isReady]);

  /* -------------------------------------------------------- space-to-pan key */

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isTypingTarget(event.target)) return;
      event.preventDefault();
      if (isSpaceDown.current) return;
      isSpaceDown.current = true;
      canvasRef.current?.setCursor("grab");
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      isSpaceDown.current = false;
      canvasRef.current?.setCursor("default");
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  /* ------------------------------------------------- redraw on view changes */

  useEffect(() => {
    draw();
  }, [view, draw]);

  return {
    containerRef,
    canvasElRef,
    underlayRef,
    overlayRef,
    canvasRef,
    zoom,
    isReady,
    zoomIn,
    zoomOut,
    setZoom,
    fitToScreen,
  };
}

export type EditorCanvasApi = ReturnType<typeof useEditorCanvas>;
