"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type RefObject,
} from "react";
import type { Canvas } from "fabric";
import { HistoryManager } from "@/lib/canvas/history";
import type { SideId } from "@/types/document";

/** Merges rapid-fire events (slider drags, typing) into one undo step. */
const CAPTURE_DEBOUNCE_MS = 200;

export interface HistoryState {
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Binds the history manager to canvas mutation events. Everything that changes
 * the scene — adds, removes, transforms, property edits, reorders — funnels
 * through `object:*`/`text:changed`, so capturing here catches all of it.
 *
 * Each side keeps its own manager. One shared stack would let an undo on the
 * back restore a snapshot of the front, because a snapshot is the whole canvas
 * and the canvas is whichever side is showing.
 */
export function useHistory(
  canvasRef: RefObject<Canvas | null>,
  isReady: boolean,
  refresh: () => void,
  side: SideId,
): HistoryState {
  const managersRef = useRef(new Map<SideId, HistoryManager>());

  let manager = managersRef.current.get(side);
  if (!manager) {
    manager = new HistoryManager();
    managersRef.current.set(side, manager);
  }

  const [, bump] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;

    manager.onChange = bump;
    // A first visit needs the loaded scene as its baseline; a return visit
    // already has one, and resetting would throw away that side's undo stack.
    if (manager.hasBaseline) bump();
    else manager.reset(canvas);

    let timer: number | undefined;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => manager.capture(canvas), CAPTURE_DEBOUNCE_MS);
    };

    canvas.on("object:added", schedule);
    canvas.on("object:removed", schedule);
    canvas.on("object:modified", schedule);
    canvas.on("text:changed", schedule);

    return () => {
      window.clearTimeout(timer);
      canvas.off("object:added", schedule);
      canvas.off("object:removed", schedule);
      canvas.off("object:modified", schedule);
      canvas.off("text:changed", schedule);
      manager.onChange = undefined;
    };
  }, [canvasRef, isReady, manager]);

  const undo = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await manager.undo(canvas);
    refresh();
  }, [canvasRef, manager, refresh]);

  const redo = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await manager.redo(canvas);
    refresh();
  }, [canvasRef, manager, refresh]);

  return { undo, redo, canUndo: manager.canUndo, canRedo: manager.canRedo };
}
