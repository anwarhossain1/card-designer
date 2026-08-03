import { Circle, Line, Rect, Shadow, Triangle, type FabricObject } from "fabric";
import type { ShapeVariant } from "@/types/element";
import { attachMeta, createMeta } from "../meta";

export const SHAPE_LABELS: Record<ShapeVariant, string> = {
  rect: "Rectangle",
  roundedRect: "Rounded rectangle",
  circle: "Circle",
  triangle: "Triangle",
  line: "Line",
};

const DEFAULT_FILL = "#6c4cff";
const DEFAULT_STROKE = "#11141c";

/** Corner radius applied to the rounded rectangle preset. */
export const DEFAULT_CORNER_RADIUS = 10;

/**
 * Shapes are created at a size that reads well on a 336 × 192 card — roughly a
 * quarter of the card — and use `strokeUniform` so borders keep their weight
 * when an element is scaled.
 */
export function createShapeElement(variant: ShapeVariant): FabricObject {
  const shared = {
    fill: DEFAULT_FILL,
    stroke: "",
    strokeWidth: 0,
    strokeUniform: true,
    objectCaching: false,
  };

  const object = ((): FabricObject => {
    switch (variant) {
      case "circle":
        return new Circle({ ...shared, radius: 36 });

      case "triangle":
        return new Triangle({ ...shared, width: 84, height: 72 });

      case "roundedRect":
        return new Rect({
          ...shared,
          width: 110,
          height: 64,
          rx: DEFAULT_CORNER_RADIUS,
          ry: DEFAULT_CORNER_RADIUS,
        });

      case "line":
        return new Line([0, 0, 120, 0], {
          ...shared,
          fill: "",
          stroke: DEFAULT_STROKE,
          strokeWidth: 2,
        });

      case "rect":
      default:
        return new Rect({ ...shared, width: 110, height: 64 });
    }
  })();

  return attachMeta(
    object,
    createMeta({ kind: "shape", name: SHAPE_LABELS[variant], role: "decoration" }),
  );
}

export const SHADOW_PRESET = {
  color: "rgba(17, 20, 28, 0.28)",
  blur: 12,
  offsetX: 0,
  offsetY: 6,
};

/** Toggling shadow keeps the current blur/offset so it can be turned back on. */
export function buildShadow(options?: Partial<typeof SHADOW_PRESET>) {
  return new Shadow({ ...SHADOW_PRESET, ...options });
}
