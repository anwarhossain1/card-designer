import type { Canvas } from "fabric";
import type { SceneJSON } from "@/types/document";
import { SERIALIZED_PROPERTIES } from "./meta";
import { rehydrateScene } from "./history";
import { createCardClipPath } from "./setup";

/** The scene as it goes into autosave, exports metadata and templates. */
export function serializeScene(canvas: Canvas): SceneJSON {
  return canvas.toObject(SERIALIZED_PROPERTIES) as SceneJSON;
}

/**
 * Loads a scene into the live canvas — the same round-trip a history restore
 * makes, so locks, background passivity and the card clip are re-applied.
 */
export async function loadScene(canvas: Canvas, scene: SceneJSON): Promise<void> {
  canvas.discardActiveObject();
  await canvas.loadFromJSON(scene);
  canvas.clipPath = createCardClipPath();
  rehydrateScene(canvas);
  canvas.requestRenderAll();
}

/**
 * Font families referenced by a serialized scene. Loaded before the scene is,
 * so restored text is measured against the real face and never a fallback.
 */
export function collectFontFamilies(scene: SceneJSON): string[] {
  const families = new Set<string>();

  const visit = (node: unknown) => {
    if (typeof node !== "object" || node === null) return;
    const record = node as Record<string, unknown>;

    if (typeof record.fontFamily === "string") families.add(record.fontFamily);
    if (Array.isArray(record.objects)) record.objects.forEach(visit);
  };

  visit(scene);
  return [...families];
}
