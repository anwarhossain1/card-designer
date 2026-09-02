import { StaticCanvas } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH, SAFE_AREA_PX } from "@/config/document";
import { getMeta } from "@/lib/canvas/meta";
import type { CardSide, SideId } from "@/types/document";

/**
 * Only the kinds where reaching the edge is a mistake rather than a choice.
 *
 * Backgrounds and shapes routinely run off the card on purpose — a colour bar
 * down one side is a design, not a defect, and warning about it would teach
 * people to dismiss the warning. Text and a QR code are different: a clipped
 * phone number is wrong, and a clipped code does not scan.
 */
const MUST_STAY_INSIDE = new Set(["text", "qr"]);

/**
 * Which sides hold something too close to the edge to survive trimming.
 *
 * The safe area is the counterpart of the bleed: cutting is imprecise in both
 * directions, so anything meant to be read has to sit back from the trim line
 * or risk losing a slice of itself. The editor draws this as a guide; this is
 * the same rule checked at the point it stops being reversible.
 */
export async function findSidesOutsideSafeArea(
  sides: readonly CardSide[],
): Promise<SideId[]> {
  const crowded: SideId[] = [];

  for (const side of sides) {
    if (!side.scene) continue;
    if (await hasStrayObject(side.scene)) crowded.push(side.id);
  }

  return crowded;
}

async function hasStrayObject(scene: object): Promise<boolean> {
  const canvas = new StaticCanvas(undefined, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    renderOnAddRemove: false,
  });

  try {
    await canvas.loadFromJSON(scene);

    return canvas.getObjects().some((object) => {
      const kind = getMeta(object)?.kind;
      if (!kind || !MUST_STAY_INSIDE.has(kind)) return false;

      const bounds = object.getBoundingRect();
      return (
        bounds.left < SAFE_AREA_PX ||
        bounds.top < SAFE_AREA_PX ||
        bounds.left + bounds.width > CANVAS_WIDTH - SAFE_AREA_PX ||
        bounds.top + bounds.height > CANVAS_HEIGHT - SAFE_AREA_PX
      );
    });
  } catch {
    // A scene that will not load is the export's problem to report, not this
    // check's — say nothing rather than warn about the wrong thing.
    return false;
  } finally {
    void canvas.dispose();
  }
}
