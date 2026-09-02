"use client";

import { useCallback, useRef, useState, type RefObject } from "react";
import type { Canvas } from "fabric";
import { SIDE_IDS } from "@/config/document";
import {
  collectFontFamilies,
  loadScene,
  serializeScene,
} from "@/lib/canvas/persistence";
import { loadFont } from "@/lib/fonts/loader";
import { normalizeSides } from "@/lib/document/sides";
import { useEditorStore } from "@/store/editorStore";
import type { CardSide, SceneJSON, SideId } from "@/types/document";

export interface CardSidesState {
  activeSide: SideId;
  /** True while a swap is in flight; history and autosave stand down. */
  isSwitchingSide: boolean;
  switchSide: (next: SideId) => Promise<void>;
  /** Both sides, with the live canvas serialized into the active slot. */
  collectSides: () => CardSide[];
  /** Fills the off-screen cache from a freshly loaded document. */
  seedSides: (sides: readonly CardSide[]) => void;
}

type SceneCache = Record<SideId, SceneJSON | null>;

/**
 * Holds the side the canvas is not showing.
 *
 * There is one Fabric canvas and two designs, so the inactive side lives here
 * as serialized JSON — the same format autosave and export already speak.
 * Switching is therefore a save-then-load round trip through that format,
 * which is exactly what reopening a document does, so a side survives a swap
 * with the same fidelity it survives a reload.
 */
export function useCardSides(
  canvasRef: RefObject<Canvas | null>,
  refresh: () => void,
): CardSidesState {
  const cacheRef = useRef<SceneCache>({ front: null, back: null });
  const [isSwitchingSide, setIsSwitchingSide] = useState(false);
  /*
   * The ref, not the state, is what collectSides consults: an autosave that
   * fires mid-swap would otherwise read a canvas that has been cleared but not
   * yet refilled, and write that emptiness over a real design.
   */
  const isSwitchingRef = useRef(false);

  const activeSide = useEditorStore((state) => state.activeSide);
  const activeSideRef = useRef(activeSide);
  activeSideRef.current = activeSide;

  const seedSides = useCallback((sides: readonly CardSide[]) => {
    const normalized = normalizeSides(sides);
    cacheRef.current = {
      front: normalized[0]?.scene ?? null,
      back: normalized[1]?.scene ?? null,
    };
  }, []);

  const collectSides = useCallback((): CardSide[] => {
    const canvas = canvasRef.current;
    if (canvas && !isSwitchingRef.current) {
      cacheRef.current[activeSideRef.current] = serializeScene(canvas);
    }
    return SIDE_IDS.map((id) => ({ id, scene: cacheRef.current[id] }));
  }, [canvasRef]);

  const switchSide = useCallback(
    async (next: SideId) => {
      const canvas = canvasRef.current;
      const current = activeSideRef.current;
      if (!canvas || next === current || isSwitchingRef.current) return;

      isSwitchingRef.current = true;
      setIsSwitchingSide(true);

      try {
        // Bank the outgoing side before anything can clear the canvas.
        cacheRef.current[current] = serializeScene(canvas);

        const scene = cacheRef.current[next];
        if (scene) {
          // Fonts first, for the same reason hydration loads them first.
          await Promise.all(collectFontFamilies(scene).map(loadFont));
          await loadScene(canvas, scene);
        } else {
          canvas.discardActiveObject();
          canvas.remove(...canvas.getObjects());
          canvas.requestRenderAll();
        }

        activeSideRef.current = next;
        useEditorStore.getState().setActiveSide(next);
      } finally {
        isSwitchingRef.current = false;
        setIsSwitchingSide(false);
        refresh();
      }
    },
    [canvasRef, refresh],
  );

  return { activeSide, isSwitchingSide, switchSide, collectSides, seedSides };
}
