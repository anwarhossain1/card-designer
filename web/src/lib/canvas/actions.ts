import { ActiveSelection, type Canvas, type FabricObject } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/config/document";
import { createId } from "@/lib/utils/id";
import { getMeta, isLocked, SERIALIZED_PROPERTIES, type ElementObject } from "./meta";

/** Offset applied to each new element so stacked additions stay visible. */
const CASCADE = 10;

function cascadeOffset(canvas: Canvas) {
  const step = canvas.getObjects().length % 5;
  return step * CASCADE;
}

/** Adds an element centred on the card and selects it. */
export function addElement(canvas: Canvas, object: FabricObject) {
  const offset = cascadeOffset(canvas);

  object.set({
    left: (CANVAS_WIDTH - object.getScaledWidth()) / 2 + offset,
    top: (CANVAS_HEIGHT - object.getScaledHeight()) / 2 + offset,
  });

  canvas.add(object);
  canvas.setActiveObject(object);
  canvas.requestRenderAll();
  return object;
}

export function getEditableSelection(canvas: Canvas): FabricObject[] {
  return canvas.getActiveObjects().filter((object) => !isLocked(object));
}

export function deleteSelected(canvas: Canvas) {
  const targets = getEditableSelection(canvas);
  if (targets.length === 0) return;

  canvas.discardActiveObject();
  canvas.remove(...targets);
  canvas.requestRenderAll();
}

/** Clones the selection with fresh element ids, offset like Canva does. */
export async function duplicateSelected(canvas: Canvas) {
  const targets = getEditableSelection(canvas);
  if (targets.length === 0) return;

  const clones = await Promise.all(
    targets.map((object) => object.clone(SERIALIZED_PROPERTIES)),
  );

  canvas.discardActiveObject();

  clones.forEach((clone) => {
    const meta = getMeta(clone);
    if (meta) (clone as ElementObject).meta = { ...meta, id: createId(meta.kind) };

    clone.set({
      left: (clone.left ?? 0) + CASCADE,
      top: (clone.top ?? 0) + CASCADE,
    });
    canvas.add(clone);
  });

  canvas.setActiveObject(
    clones.length === 1 && clones[0]
      ? clones[0]
      : new ActiveSelection(clones, { canvas }),
  );
  canvas.requestRenderAll();
}

export function nudgeSelected(canvas: Canvas, dx: number, dy: number) {
  const targets = getEditableSelection(canvas);
  if (targets.length === 0) return;

  targets.forEach((object) => {
    object.set({ left: (object.left ?? 0) + dx, top: (object.top ?? 0) + dy });
    object.setCoords();
  });

  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: targets[0] });
}

/** Applies property changes to every selected object. */
export function updateSelected(
  canvas: Canvas,
  properties: Record<string, unknown>,
) {
  const targets = getEditableSelection(canvas);
  if (targets.length === 0) return;

  targets.forEach((object) => {
    object.set(properties);
    object.setCoords();
  });

  canvas.requestRenderAll();
  // Property edits do not fire Fabric events on their own; history needs one.
  canvas.fire("object:modified", { target: targets[0] });
}
