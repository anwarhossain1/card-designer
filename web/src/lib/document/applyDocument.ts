import type { Canvas } from "fabric";
import { collectFontFamilies, loadScene } from "@/lib/canvas/persistence";
import { loadFont } from "@/lib/fonts/loader";
import { getSideScene, normalizeSides } from "./sides";
import { useEditorStore } from "@/store/editorStore";
import type { CardDocument, CardSide } from "@/types/document";

/**
 * Puts a stored document on the canvas and adopts its identity.
 *
 * Two callers need exactly this: restoring from LocalStorage on mount, and
 * taking a newer copy down from the server. Sharing one implementation is what
 * makes "reopened here" and "arrived from another device" indistinguishable
 * once the card is on screen.
 *
 * Always opens on the front. The back is seeded into the side cache and loads
 * when it is switched to.
 */
export async function applyDocument(
  canvas: Canvas,
  doc: CardDocument,
  seedSides: (sides: readonly CardSide[]) => void,
): Promise<void> {
  const sides = normalizeSides(doc.sides);
  seedSides(sides);
  useEditorStore.getState().setActiveSide("front");

  const scene = getSideScene(sides, "front");

  if (scene) {
    // Fonts first, so restored text lays out against the real face.
    await Promise.all(collectFontFamilies(scene).map(loadFont));
    await loadScene(canvas, scene);
  } else {
    canvas.discardActiveObject();
    canvas.remove(...canvas.getObjects());
    canvas.requestRenderAll();
  }

  useEditorStore.getState().hydrate({
    documentId: doc.id,
    documentName: doc.name,
    documentCreatedAt: doc.createdAt,
    templateId: doc.templateId,
    lastSavedAt: doc.updatedAt,
  });
}
