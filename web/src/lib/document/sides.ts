import { SIDE_IDS } from "@/config/document";
import type { CardSide, SceneJSON, SideId } from "@/types/document";

/**
 * Card side helpers.
 *
 * Every document carries both sides at all times, front first. Keeping the
 * array complete and ordered — rather than adding a back only once it is drawn
 * on — means nothing downstream has to ask "does this card have a back?".
 * A side that was never touched simply holds a null scene.
 */

export const createSide = (id: SideId): CardSide => ({ id, scene: null });

/** The side that is not this one. Two sides, so the "other" is unambiguous. */
export const otherSide = (id: SideId): SideId =>
  id === "front" ? "back" : "front";

/**
 * Forces a sides array into the canonical shape: exactly one entry per id, in
 * SIDE_IDS order, preserving whatever scenes were already there. Documents
 * written before the back existed only have a front, and a hand-edited or
 * partly-written document could have them in any order or duplicated.
 */
export function normalizeSides(sides: readonly CardSide[] | undefined): CardSide[] {
  return SIDE_IDS.map((id) => {
    const found = sides?.find((side) => side?.id === id);
    return found ? { id, scene: found.scene ?? null } : createSide(id);
  });
}

export const getSideScene = (
  sides: readonly CardSide[],
  id: SideId,
): SceneJSON | null => sides.find((side) => side.id === id)?.scene ?? null;

/**
 * True when a side has nothing on it. A scene serialized from a canvas the user
 * never touched still exists as an object with an empty `objects` array, so
 * checking for null alone would call a blank side "designed".
 */
export function isSceneEmpty(scene: SceneJSON | null): boolean {
  if (!scene) return true;
  const objects = (scene as { objects?: unknown }).objects;
  return !Array.isArray(objects) || objects.length === 0;
}
