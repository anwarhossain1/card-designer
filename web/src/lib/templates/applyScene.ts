import { util, type Canvas, type FabricObject } from "fabric";
import { collectFontFamilies } from "@/lib/canvas/persistence";
import { rehydrateScene } from "@/lib/canvas/history";
import { loadFont } from "@/lib/fonts/loader";
import type { SceneJSON } from "@/types/document";

/**
 * Replaces the card with a serialized scene — how an admin-made template is
 * applied, where a bundled one is built by code.
 *
 * Objects are revived and added one by one rather than through loadFromJSON,
 * so the canvas fires the same add/remove events a bundled template does.
 * History and autosave listen for those: the swap becomes one undoable step
 * and is saved, exactly like picking a bundled template.
 */
export async function applySceneTemplate(canvas: Canvas, scene: SceneJSON) {
  // Fonts first, for the reason applyTemplate gives.
  await Promise.all(collectFontFamilies(scene).map(loadFont));

  const serialized = Array.isArray((scene as { objects?: unknown }).objects)
    ? ((scene as { objects: object[] }).objects)
    : [];
  const objects = await util.enlivenObjects<FabricObject>(serialized);

  canvas.discardActiveObject();
  canvas.remove(...canvas.getObjects());
  objects.forEach((object) => canvas.add(object));

  // Locks and the background's passivity are not part of the JSON itself.
  rehydrateScene(canvas);
  objects.forEach((object) => {
    if ("initDimensions" in object) {
      (object as { initDimensions: () => void }).initDimensions();
    }
    object.setCoords();
  });

  canvas.requestRenderAll();
}
