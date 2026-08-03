import type { Canvas } from "fabric";
import type { CardTemplate } from "@/types/template";
import { applyBackground } from "@/lib/canvas/elements/background";
import { loadFont } from "@/lib/fonts/loader";

/**
 * Replaces the card with a template.
 *
 * Fonts load first: Fabric measures text against whatever face is ready, so
 * building a layout before its fonts arrive produces boxes sized for a
 * fallback that never quite recover.
 */
export async function applyTemplate(canvas: Canvas, template: CardTemplate) {
  await Promise.all(template.fonts.map(loadFont));

  const { background, objects } = template.build();

  canvas.discardActiveObject();
  canvas.remove(...canvas.getObjects());

  await applyBackground(canvas, background);
  objects.forEach((object) => canvas.add(object));

  // Text boxes measured during construction may predate the loaded font.
  objects.forEach((object) => {
    if ("initDimensions" in object) {
      (object as { initDimensions: () => void }).initDimensions();
    }
    object.setCoords();
  });

  canvas.requestRenderAll();
}
