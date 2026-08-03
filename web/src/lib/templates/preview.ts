import { StaticCanvas } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/config/document";
import { applyBackground } from "@/lib/canvas/elements/background";
import { loadFont } from "@/lib/fonts/loader";
import type { CardTemplate } from "@/types/template";

const cache = new Map<string, Promise<string>>();

/**
 * Renders a template offscreen and returns a data URL.
 *
 * The preview is the real scene rather than a hand-written CSS mock, so what a
 * user picks is exactly what lands on their card. Results are cached per
 * session — each render costs one throwaway canvas.
 */
export function renderTemplatePreview(template: CardTemplate): Promise<string> {
  const cached = cache.get(template.id);
  if (cached) return cached;

  const pending = (async () => {
    await Promise.all(template.fonts.map(loadFont));

    const canvas = new StaticCanvas(undefined, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      renderOnAddRemove: false,
    });

    try {
      const { background, objects } = template.build();
      await applyBackground(canvas, background);
      objects.forEach((object) => canvas.add(object));
      canvas.renderAll();

      return canvas.toDataURL({ format: "png", multiplier: 2 });
    } finally {
      void canvas.dispose();
    }
  })();

  cache.set(template.id, pending);
  return pending;
}
