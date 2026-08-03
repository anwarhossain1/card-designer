"use client";

import { useCallback, useRef, useState, type RefObject } from "react";
import { ActiveSelection, type Canvas, type FabricObject } from "fabric";
import {
  getMeta,
  SERIALIZED_PROPERTIES,
  type ElementObject,
} from "@/lib/canvas/meta";
import { applyLock } from "@/lib/canvas/layers";
import { deleteSelected } from "@/lib/canvas/actions";
import { createId } from "@/lib/utils/id";

const PASTE_OFFSET = 10;

export interface ClipboardState {
  copy: () => Promise<void>;
  cut: () => Promise<void>;
  paste: () => Promise<void>;
  hasClipboard: boolean;
}

/** Fresh element ids for a pasted object (or every child of a selection). */
function reassignIds(object: FabricObject) {
  const targets =
    object instanceof ActiveSelection ? object.getObjects() : [object];

  targets.forEach((target) => {
    const meta = getMeta(target);
    if (meta) {
      (target as ElementObject).meta = { ...meta, id: createId(meta.kind) };
    }
  });
}

/** Locked state survives copy in meta; re-apply the live transform locks. */
function relockPasted(object: FabricObject) {
  const targets =
    object instanceof ActiveSelection ? object.getObjects() : [object];

  targets.forEach((target) => {
    if (getMeta(target)?.locked) applyLock(target, true);
  });
}

/**
 * Internal clipboard, Canva-style: copy holds a clone, each paste clones the
 * clone and cascades. The OS clipboard is untouched — canvas elements are not
 * meaningful outside the editor.
 */
export function useClipboard(
  canvasRef: RefObject<Canvas | null>,
  refresh: () => void,
): ClipboardState {
  const clipboardRef = useRef<FabricObject | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);

  const copy = useCallback(async () => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;

    clipboardRef.current = await active.clone(SERIALIZED_PROPERTIES);
    setHasClipboard(true);
  }, [canvasRef]);

  const paste = useCallback(async () => {
    const canvas = canvasRef.current;
    const stored = clipboardRef.current;
    if (!canvas || !stored) return;

    const cloned = await stored.clone(SERIALIZED_PROPERTIES);
    canvas.discardActiveObject();

    reassignIds(cloned);
    cloned.set({
      left: (cloned.left ?? 0) + PASTE_OFFSET,
      top: (cloned.top ?? 0) + PASTE_OFFSET,
      evented: true,
    });

    if (cloned instanceof ActiveSelection) {
      // Official Fabric pattern: adopt the canvas, add children, then select.
      cloned.canvas = canvas;
      cloned.forEachObject((object) => canvas.add(object));
      cloned.setCoords();
    } else {
      canvas.add(cloned);
    }

    relockPasted(cloned);

    // Cascade the stored copy so repeated pastes stagger like Canva's.
    stored.set({
      left: (stored.left ?? 0) + PASTE_OFFSET,
      top: (stored.top ?? 0) + PASTE_OFFSET,
    });

    canvas.setActiveObject(cloned);
    canvas.requestRenderAll();
    refresh();
  }, [canvasRef, refresh]);

  const cut = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.getActiveObject()) return;

    await copy();
    deleteSelected(canvas);
    refresh();
  }, [canvasRef, copy, refresh]);

  return { copy, cut, paste, hasClipboard };
}
