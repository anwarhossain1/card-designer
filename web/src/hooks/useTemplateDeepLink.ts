"use client";

import { useEffect, useRef } from "react";
import type { Canvas } from "fabric";
import { findTemplate } from "@/lib/templates";
import { applyTemplate } from "@/lib/templates/apply";
import { useEditorStore } from "@/store/editorStore";
import { useUiStore } from "@/store/uiStore";
import { useApplyServerTemplate } from "./useServerTemplates";

/**
 * Applies `/editor?template=<id>` once the canvas has hydrated.
 *
 * The id is looked up among the bundled templates first, then on the server,
 * so a link to an admin-made template works the same way. Bundled slugs are
 * reserved on the server, so the two can never name different templates.
 *
 * An existing design is never overwritten: the landing page links here for a
 * fresh start, but someone returning to saved work should find it intact. In
 * that case the Templates panel simply opens so the choice is one click away.
 *
 * Reads `location.search` directly rather than `useSearchParams`, so the
 * client-only editor needs no Suspense boundary.
 */
export function useTemplateDeepLink(
  canvasRef: React.RefObject<Canvas | null>,
  isHydrated: boolean,
) {
  const handled = useRef(false);
  const applyServerTemplate = useApplyServerTemplate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isHydrated || handled.current) return;

    handled.current = true;

    const id = new URLSearchParams(window.location.search).get("template");
    if (!id) return;

    if (canvas.getObjects().length > 0) {
      useUiStore.getState().openPanel("templates");
      return;
    }

    const template = findTemplate(id);
    if (template) {
      void applyTemplate(canvas, template).then(() => {
        useEditorStore.getState().setTemplateId(template.id);
      });
      return;
    }

    // Unknown, unpublished or unreachable: the editor just opens blank.
    void applyServerTemplate(id).catch(() => undefined);
  }, [canvasRef, isHydrated, applyServerTemplate]);
}
