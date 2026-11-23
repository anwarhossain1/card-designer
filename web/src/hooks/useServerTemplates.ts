"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { getSideScene, isSceneEmpty } from "@/lib/document/sides";
import { fetchServerTemplate, listServerTemplates } from "@/lib/api/templates";
import { applySceneTemplate } from "@/lib/templates/applyScene";
import { useEditorStore } from "@/store/editorStore";

export const SERVER_TEMPLATES_KEY = ["server-templates"] as const;

/**
 * Published admin-made templates. Failure is quiet on purpose: the bundled
 * templates are already on screen, and an editor with the API down should
 * look like an editor with five templates, not one with an error.
 */
export function useServerTemplateList() {
  return useQuery({
    queryKey: SERVER_TEMPLATES_KEY,
    queryFn: listServerTemplates,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

/**
 * Applies a server template by slug; resolves false if it no longer exists.
 *
 * The front replaces the card the way a bundled template does — one undoable
 * step. A template that carries a back also replaces the back side; one
 * without leaves the back alone, which is what bundled templates do too.
 * The back swap is not part of undo history: history is per side, and the
 * back is not on the canvas to record.
 */
export function useApplyServerTemplate() {
  const { canvasRef, switchSide, collectSides, seedSides, refresh } = useCanvas();

  return useCallback(
    async (slug: string): Promise<boolean> => {
      const canvas = canvasRef.current;
      if (!canvas) return false;

      const template = await fetchServerTemplate(slug);
      const front = template ? getSideScene(template.sides, "front") : null;
      if (!template || !front) return false;

      // The template's front belongs on the front, whichever side is showing.
      if (useEditorStore.getState().activeSide !== "front") {
        await switchSide("front");
      }

      await applySceneTemplate(canvas, front);

      const back = getSideScene(template.sides, "back");
      if (!isSceneEmpty(back)) {
        const [currentFront] = collectSides();
        seedSides([currentFront ?? { id: "front", scene: null }, { id: "back", scene: back }]);
      }

      useEditorStore.getState().setTemplateId(template.slug);
      refresh();
      return true;
    },
    [canvasRef, switchSide, collectSides, seedSides, refresh],
  );
}
