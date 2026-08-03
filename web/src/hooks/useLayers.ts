"use client";

import { useCallback, useMemo } from "react";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useCanvasActions } from "./useCanvasActions";
import {
  applyLock,
  applyVisibility,
  findObjectById,
  getLayers,
  moveObject,
  reorderByListIndex,
  type LayerItem,
  type MoveDirection,
} from "@/lib/canvas/layers";
import { getMetaId } from "@/lib/canvas/meta";

/**
 * Layer list and the operations on it. Reordering and lock/visibility changes
 * do not fire Fabric mutation events, so each one refreshes explicitly.
 */
export function useLayers() {
  const { canvasRef, selected, revision, refresh } = useCanvas();
  const { duplicate } = useCanvasActions();

  const layers: LayerItem[] = useMemo(() => {
    const canvas = canvasRef.current;
    return canvas ? getLayers(canvas) : [];
    // The canvas is a ref, so `revision` is the only signal that the scene
    // changed — it is the dependency, even though it is unused in the body.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, revision]);

  const selectedIds = useMemo(
    () =>
      new Set(
        selected
          .map((object) => getMetaId(object))
          .filter((id): id is string => Boolean(id)),
      ),
    [selected],
  );

  const withObject = useCallback(
    (id: string, action: (object: NonNullable<ReturnType<typeof findObjectById>>) => void) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const object = findObjectById(canvas, id);
      if (!object) return;

      action(object);
      canvas.requestRenderAll();
      refresh();
    },
    [canvasRef, refresh],
  );

  const select = useCallback(
    (id: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const object = findObjectById(canvas, id);
      if (!object || object.visible === false) return;

      canvas.setActiveObject(object);
      canvas.requestRenderAll();
    },
    [canvasRef],
  );

  const toggleLock = useCallback(
    (id: string) =>
      withObject(id, (object) => {
        const canvas = canvasRef.current;
        applyLock(object, !object.lockMovementX);
        if (object.lockMovementX && canvas?.getActiveObject() === object) {
          canvas.discardActiveObject();
        }
      }),
    [canvasRef, withObject],
  );

  const toggleVisibility = useCallback(
    (id: string) =>
      withObject(id, (object) => {
        const canvas = canvasRef.current;
        if (canvas) applyVisibility(canvas, object, object.visible === false);
      }),
    [canvasRef, withObject],
  );

  const move = useCallback(
    (id: string, direction: MoveDirection) =>
      withObject(id, (object) => {
        const canvas = canvasRef.current;
        if (canvas) moveObject(canvas, object, direction);
      }),
    [canvasRef, withObject],
  );

  const reorder = useCallback(
    (fromListIndex: number, toListIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas || fromListIndex === toListIndex) return;

      reorderByListIndex(canvas, fromListIndex, toListIndex);
      canvas.requestRenderAll();
      refresh();
    },
    [canvasRef, refresh],
  );

  /** Works on hidden layers too, so selection is set directly here. */
  const duplicateLayer = useCallback(
    async (id: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const object = findObjectById(canvas, id);
      if (!object) return;

      canvas.setActiveObject(object);
      await duplicate();
    },
    [canvasRef, duplicate],
  );

  const deleteLayer = useCallback(
    (id: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const object = findObjectById(canvas, id);
      if (!object) return;

      if (canvas.getActiveObject() === object) canvas.discardActiveObject();
      canvas.remove(object);
      canvas.requestRenderAll();
      refresh();
    },
    [canvasRef, refresh],
  );

  return {
    layers,
    selectedIds,
    select,
    toggleLock,
    toggleVisibility,
    move,
    reorder,
    duplicateLayer,
    deleteLayer,
  };
}
