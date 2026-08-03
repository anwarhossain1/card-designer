import {
  FabricImage,
  Gradient,
  Pattern,
  Rect,
  type FabricObject,
  type StaticCanvas,
} from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/config/document";
import { createPatternTile, type PatternId } from "../patterns";
import { attachMeta, createMeta, getMeta } from "../meta";

export type BackgroundKind = "none" | "solid" | "gradient" | "image" | "pattern";

/** Declarative backdrop request, shared by the panel, templates and actions. */
export type BackgroundSpec =
  | { kind: "none" }
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number }
  | { kind: "image"; dataUrl: string }
  | { kind: "pattern"; id: PatternId; background: string; foreground: string };

export interface GradientOptions {
  from: string;
  to: string;
  /** Degrees, 0 = left to right. */
  angle: number;
}

export interface PatternOptions {
  id: PatternId;
  background: string;
  foreground: string;
}

/**
 * The backdrop is a real object pinned to the bottom of the stack rather than
 * Fabric's canvas background: the canvas element spans the whole workspace, so
 * a canvas-level fill would not be card-relative. Being an object also means it
 * serializes, exports and scales with everything else.
 */
function baseProps() {
  return {
    left: 0,
    top: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    selectable: false,
    evented: false,
    hoverCursor: "default",
    objectCaching: false,
  };
}

export function getBackground(canvas: StaticCanvas): FabricObject | null {
  return (
    canvas.getObjects().find((object) => getMeta(object)?.kind === "background") ??
    null
  );
}

function mount(canvas: StaticCanvas, object: FabricObject, name: string) {
  clearBackground(canvas);

  attachMeta(
    object,
    createMeta({ kind: "background", name, role: "decoration", locked: true }),
  );

  canvas.add(object);
  canvas.sendObjectToBack(object);
  canvas.requestRenderAll();
  return object;
}

export function clearBackground(canvas: StaticCanvas) {
  const existing = getBackground(canvas);
  if (existing) canvas.remove(existing);
}

export function setSolidBackground(canvas: StaticCanvas, color: string) {
  return mount(canvas, new Rect({ ...baseProps(), fill: color }), "Background");
}

export function setGradientBackground(
  canvas: StaticCanvas,
  { from, to, angle }: GradientOptions,
) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians);
  const y = Math.sin(radians);

  /*
   * Gradient line in card pixels, the way CSS defines it: long enough that the
   * end stops land exactly on the card's corners for any angle. Pixel units
   * keep this independent of how Fabric scales percentage coords.
   */
  const half = (Math.abs(x) * CANVAS_WIDTH + Math.abs(y) * CANVAS_HEIGHT) / 2;

  const gradient = new Gradient({
    type: "linear",
    gradientUnits: "pixels",
    coords: {
      x1: CANVAS_WIDTH / 2 - x * half,
      y1: CANVAS_HEIGHT / 2 - y * half,
      x2: CANVAS_WIDTH / 2 + x * half,
      y2: CANVAS_HEIGHT / 2 + y * half,
    },
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  });

  return mount(
    canvas,
    new Rect({ ...baseProps(), fill: gradient }),
    "Gradient background",
  );
}

export function setPatternBackground(
  canvas: StaticCanvas,
  { id, background, foreground }: PatternOptions,
) {
  const pattern = new Pattern({
    source: createPatternTile(id, background, foreground),
    repeat: "repeat",
  });

  return mount(
    canvas,
    new Rect({ ...baseProps(), fill: pattern }),
    "Pattern background",
  );
}

/** Applies any backdrop spec; the one entry point templates and panels share. */
export async function applyBackground(canvas: StaticCanvas, spec: BackgroundSpec) {
  switch (spec.kind) {
    case "none":
      clearBackground(canvas);
      canvas.requestRenderAll();
      return;
    case "solid":
      setSolidBackground(canvas, spec.color);
      return;
    case "gradient":
      setGradientBackground(canvas, spec);
      return;
    case "pattern":
      setPatternBackground(canvas, spec);
      return;
    case "image":
      await setImageBackground(canvas, spec.dataUrl);
  }
}

/** Scales the image to cover the card, centred — never letterboxed. */
export async function setImageBackground(canvas: StaticCanvas, dataUrl: string) {
  const image = await FabricImage.fromURL(dataUrl);
  const scale = Math.max(
    CANVAS_WIDTH / (image.width || 1),
    CANVAS_HEIGHT / (image.height || 1),
  );

  image.set({
    ...baseProps(),
    width: image.width,
    height: image.height,
    scaleX: scale,
    scaleY: scale,
    left: (CANVAS_WIDTH - image.width * scale) / 2,
    top: (CANVAS_HEIGHT - image.height * scale) / 2,
  });

  return mount(canvas, image, "Image background");
}
