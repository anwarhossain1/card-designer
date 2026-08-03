import { Canvas, FabricObject, Rect } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/config/document";

/** Canva-like selection handles: white circles with a brand-coloured border. */
const CONTROL_DEFAULTS = {
  borderColor: "#6c4cff",
  cornerColor: "#ffffff",
  cornerStrokeColor: "#6c4cff",
  cornerSize: 10,
  cornerStyle: "circle" as const,
  transparentCorners: false,
  borderScaleFactor: 1.5,
  borderOpacityWhenMoving: 0.6,
};

let defaultsApplied = false;

function applyObjectDefaults() {
  if (defaultsApplied) return;
  Object.assign(FabricObject.ownDefaults, CONTROL_DEFAULTS);
  defaultsApplied = true;
}

/**
 * Creates the artwork canvas.
 *
 * The canvas element spans the whole workspace while the card occupies the
 * region (0,0)–(CANVAS_WIDTH, CANVAS_HEIGHT) in canvas coordinates; the
 * viewport transform positions it on screen. A clip path keeps artwork inside
 * the card so overflow never spills into the grey workspace.
 */
export function createArtworkCanvas(
  element: HTMLCanvasElement,
  size: { width: number; height: number },
): Canvas {
  applyObjectDefaults();

  const canvas = new Canvas(element, {
    width: size.width,
    height: size.height,
    backgroundColor: "transparent",
    preserveObjectStacking: true,
    selection: true,
    selectionColor: "rgba(108, 76, 255, 0.08)",
    selectionBorderColor: "#6c4cff",
    selectionLineWidth: 1,
    uniformScaling: false,
    controlsAboveOverlay: true,
    fireRightClick: true,
    stopContextMenu: true,
  });

  canvas.clipPath = new Rect({
    left: 0,
    top: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    absolutePositioned: true,
  });

  return canvas;
}
