"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Canvas } from "fabric";
import type { CardDocument } from "@/types/document";
import {
  BLEED_IN,
  CARD_SIZE_IN,
  SAFE_AREA_IN,
  SCHEMA_VERSION,
} from "@/config/document";
import { collectFontFamilies, loadScene } from "@/lib/canvas/persistence";
import { loadDocument, saveDocument } from "@/lib/storage/documentStorage";
import { getSideScene, normalizeSides } from "@/lib/document/sides";
import { loadFont } from "@/lib/fonts/loader";
import { useEditorStore } from "@/store/editorStore";
import type { CardSidesState } from "./useCardSides";

/** Long enough to merge a burst of edits, short enough to survive a tab close. */
const AUTOSAVE_DEBOUNCE_MS = 800;

export interface PersistenceState {
  /** True once the stored document (or a confirmed blank) is on the canvas. */
  isHydrated: boolean;
}

/**
 * Restores the previous design on mount, then autosaves every change.
 *
 * History and autosave both wait for `isHydrated`: the undo baseline must be
 * the restored scene (not the blank canvas), and an early autosave of that
 * blank canvas would wipe the stored design before it was ever read.
 *
 * The canvas only ever holds one side, so every save asks `sides` for both —
 * editing the back must never save a document whose front has gone missing.
 */
export function useDocumentPersistence(
  canvasRef: RefObject<Canvas | null>,
  isReady: boolean,
  sides: CardSidesState,
): PersistenceState {
  const [isHydrated, setIsHydrated] = useState(false);
  const createdAtRef = useRef<string>(new Date().toISOString());
  const timerRef = useRef<number | undefined>(undefined);

  const documentName = useEditorStore((state) => state.documentName);
  const { collectSides, seedSides } = sides;

  const persist = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { documentId, templateId } = useEditorStore.getState();
    const now = new Date().toISOString();

    const doc: CardDocument = {
      id: documentId,
      schemaVersion: SCHEMA_VERSION,
      kind: "business-card",
      name: useEditorStore.getState().documentName,
      size: CARD_SIZE_IN,
      bleed: BLEED_IN,
      safeArea: SAFE_AREA_IN,
      templateId,
      sides: collectSides(),
      createdAt: createdAtRef.current,
      updatedAt: now,
    };

    if (saveDocument(doc)) {
      useEditorStore.getState().markSaved(now);
    }
  }, [canvasRef, collectSides]);

  /* -------------------------------------------------------------- hydration */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;

    let cancelled = false;

    const hydrate = async () => {
      const stored = loadDocument();

      if (stored) {
        createdAtRef.current = stored.createdAt;

        /*
         * Both sides go into the cache, but only the front reaches the canvas:
         * a document always reopens on its front, so the store is pinned there
         * too rather than trusting an activeSide left over from a previous
         * mount of this same (module-level) store.
         */
        const restored = normalizeSides(stored.sides);
        seedSides(restored);
        useEditorStore.getState().setActiveSide("front");

        const scene = getSideScene(restored, "front");
        if (scene) {
          // Fonts first, so restored text lays out against the real face.
          await Promise.all(collectFontFamilies(scene).map(loadFont));
          if (cancelled) return;

          await loadScene(canvas, scene);
          if (cancelled) return;
        }

        useEditorStore.getState().hydrate({
          documentId: stored.id,
          documentName: stored.name,
          templateId: stored.templateId,
          lastSavedAt: stored.updatedAt,
        });
      }

      if (!cancelled) setIsHydrated(true);
    };

    void hydrate();
    return () => {
      cancelled = true;
      setIsHydrated(false);
    };
  }, [canvasRef, isReady, seedSides]);

  /* --------------------------------------------------------------- autosave */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isHydrated) return;

    const schedule = () => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        // Clearing the handle is what makes "is a save pending?" meaningful.
        timerRef.current = undefined;
        persist();
      }, AUTOSAVE_DEBOUNCE_MS);
    };

    /** LocalStorage writes are synchronous, so a closing tab can still save. */
    const flush = () => {
      if (timerRef.current === undefined) return;
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
      persist();
    };

    canvas.on("object:added", schedule);
    canvas.on("object:removed", schedule);
    canvas.on("object:modified", schedule);
    canvas.on("text:changed", schedule);
    window.addEventListener("beforeunload", flush);

    return () => {
      window.clearTimeout(timerRef.current);
      canvas.off("object:added", schedule);
      canvas.off("object:removed", schedule);
      canvas.off("object:modified", schedule);
      canvas.off("text:changed", schedule);
      window.removeEventListener("beforeunload", flush);
    };
  }, [canvasRef, isHydrated, persist]);

  /*
   * Renaming the design is a change worth saving, too — but only an actual
   * rename. Saving on the first run would overwrite stored data the moment the
   * editor opens, including a document that was deliberately not loaded.
   */
  const lastNameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;

    if (lastNameRef.current === null || lastNameRef.current === documentName) {
      lastNameRef.current = documentName;
      return;
    }

    lastNameRef.current = documentName;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      persist();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [documentName, isHydrated, persist]);

  return { isHydrated };
}
