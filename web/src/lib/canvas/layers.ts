import type { Canvas, FabricObject } from "fabric";
import type { ElementKind } from "@/types/element";
import { getMeta, getMetaId } from "./meta";

export interface LayerItem {
  id: string;
  name: string;
  kind: ElementKind;
  locked: boolean;
  visible: boolean;
  /** Index in Fabric's stacking order; 0 is the bottom-most element. */
  index: number;
}

/**
 * Layers are listed top-most first, the way every design tool shows them —
 * which is the reverse of Fabric's stacking order.
 */
export function getLayers(canvas: Canvas): LayerItem[] {
  return canvas
    .getObjects()
    .map((object, index) => {
      const meta = getMeta(object);
      // The backdrop is managed by the background panel, not the layer list.
      if (!meta || meta.kind === "background") return null;

      const item: LayerItem = {
        id: meta.id,
        name: meta.name,
        kind: meta.kind,
        locked: meta.locked,
        visible: object.visible !== false,
        index,
      };

      return item;
    })
    .filter((layer): layer is LayerItem => layer !== null)
    .reverse();
}

export function findObjectById(
  canvas: Canvas,
  id: string,
): FabricObject | undefined {
  return canvas.getObjects().find((object) => getMetaId(object) === id);
}

/**
 * Locked elements stay selectable — otherwise there would be no way to unlock
 * one from the canvas — but every transform is disabled.
 */
export function applyLock(object: FabricObject, locked: boolean) {
  const meta = getMeta(object);
  if (meta) meta.locked = locked;

  object.set({
    lockMovementX: locked,
    lockMovementY: locked,
    lockRotation: locked,
    lockScalingX: locked,
    lockScalingY: locked,
    hasControls: !locked,
    editable: !locked,
  } as Partial<FabricObject>);
}

export function applyVisibility(
  canvas: Canvas,
  object: FabricObject,
  visible: boolean,
) {
  object.set({ visible });

  // A hidden element must not stay selected, or its handles float over nothing.
  if (!visible && canvas.getActiveObject() === object) {
    canvas.discardActiveObject();
  }
}

export type MoveDirection = "front" | "forward" | "backward" | "back";

export function moveObject(
  canvas: Canvas,
  object: FabricObject,
  direction: MoveDirection,
) {
  switch (direction) {
    case "front":
      canvas.bringObjectToFront(object);
      break;
    case "forward":
      canvas.bringObjectForward(object);
      break;
    case "backward":
      canvas.sendObjectBackwards(object);
      break;
    case "back":
      canvas.sendObjectToBack(object);
      break;
  }
}

/**
 * Reorders from list positions. The list is top-first, so both indices are
 * flipped back into Fabric's bottom-first stacking order.
 */
export function reorderByListIndex(
  canvas: Canvas,
  fromListIndex: number,
  toListIndex: number,
) {
  const total = canvas.getObjects().length;
  const object = canvas.getObjects()[total - 1 - fromListIndex];
  if (!object) return;

  canvas.moveObjectTo(object, total - 1 - toListIndex);
}
