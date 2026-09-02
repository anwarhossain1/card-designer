import { StaticCanvas } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/config/document";
import { collectFontFamilies } from "@/lib/canvas/persistence";
import { loadFont } from "@/lib/fonts/loader";
import type { SceneJSON } from "@/types/document";

/** 336 design px x 0.75 lands at 252 wide — legible in a grid, cheap to store. */
const MULTIPLIER = 0.75;
const QUALITY = 0.6;

/**
 * Renders the front of a card as a small JPEG data URL.
 *
 * The designs list needs to show cards, not filenames, and shipping every
 * scene to draw them would defeat the point of a summary. Rendering once at
 * save time and storing the result is what keeps the list one small request.
 *
 * Offscreen and throwaway, like the export and template previews: the live
 * canvas is never borrowed, so guides and selection handles cannot leak in.
 */
export async function renderThumbnail(
  scene: SceneJSON | null,
): Promise<string | null> {
  if (!scene) return null;

  const canvas = new StaticCanvas(undefined, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    renderOnAddRemove: false,
  });

  try {
    await Promise.all(collectFontFamilies(scene).map(loadFont));
    await canvas.loadFromJSON(scene);

    // JPEG has no alpha, so a card with no backdrop of its own would come out
    // black. Paper is white.
    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();

    return canvas.toDataURL({
      format: "jpeg",
      quality: QUALITY,
      multiplier: MULTIPLIER,
    });
  } catch {
    // A thumbnail is a nicety; never let one fail a save.
    return null;
  } finally {
    void canvas.dispose();
  }
}
