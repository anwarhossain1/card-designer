"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import type { Canvas, FabricObject } from "fabric";
import { getMetaId, setMetaName } from "@/lib/canvas/meta";
import { useEditorStore } from "@/store/editorStore";

export interface SelectionState {
  selected: FabricObject[];
  /** Increments whenever the selection's properties change. */
  revision: number;
  /** Call after programmatic edits so property inputs re-read the object. */
  refresh: () => void;
}

/**
 * Bridges Fabric's imperative selection events into React state, and mirrors
 * the selected element ids into the editor store for the rest of the chrome.
 */
export function useCanvasSelection(
  canvasRef: RefObject<Canvas | null>,
  isReady: boolean,
): SelectionState {
  const [selected, setSelected] = useState<FabricObject[]>([]);
  const [revision, setRevision] = useState(0);
  const setSelection = useEditorStore((state) => state.setSelection);
  const markDirty = useEditorStore((state) => state.markDirty);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;

    const syncSelection = () => {
      const objects = canvas.getActiveObjects();
      setSelected(objects);
      setSelection(
        objects
          .map((object) => getMetaId(object))
          .filter((id): id is string => Boolean(id)),
      );
    };

    const onModified = () => {
      refresh();
      markDirty();
    };

    /** Keep the layer label in step with the text a user types. */
    const onTextChanged = ({ target }: { target?: FabricObject }) => {
      if (target && "text" in target) {
        setMetaName(target, String(target.text).slice(0, 24) || "Text");
      }
      onModified();
    };

    canvas.on("selection:created", syncSelection);
    canvas.on("selection:updated", syncSelection);
    canvas.on("selection:cleared", syncSelection);
    canvas.on("object:added", onModified);
    canvas.on("object:removed", onModified);
    canvas.on("object:modified", onModified);
    canvas.on("text:changed", onTextChanged);

    return () => {
      canvas.off("selection:created", syncSelection);
      canvas.off("selection:updated", syncSelection);
      canvas.off("selection:cleared", syncSelection);
      canvas.off("object:added", onModified);
      canvas.off("object:removed", onModified);
      canvas.off("object:modified", onModified);
      canvas.off("text:changed", onTextChanged);
    };
  }, [canvasRef, isReady, markDirty, refresh, setSelection]);

  return { selected, revision, refresh };
}
