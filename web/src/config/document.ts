import type { DocumentSize, SideId } from "@/types/document";

/**
 * Print geometry.
 *
 * The canvas works in "design pixels" at DESIGN_DPI. Export scales that up to
 * the requested DPI, so nothing downstream needs to know about inches.
 */
export const DESIGN_DPI = 96;
export const PRINT_DPI = 300;

export const CARD_SIZE_IN: DocumentSize = {
  width: 3.5,
  height: 2,
  unit: "in",
};

/** Standard print allowances, in inches. */
export const BLEED_IN = 0.125;
export const SAFE_AREA_IN = 0.125;

export const CANVAS_WIDTH = CARD_SIZE_IN.width * DESIGN_DPI; // 336
export const CANVAS_HEIGHT = CARD_SIZE_IN.height * DESIGN_DPI; // 192
export const BLEED_PX = BLEED_IN * DESIGN_DPI; // 12
export const SAFE_AREA_PX = SAFE_AREA_IN * DESIGN_DPI; // 12

export const ZOOM = {
  min: 0.25,
  max: 8,
  step: 0.1,
  default: 2,
} as const;

export const SNAP = {
  /** Distance in screen pixels at which an object snaps to a guide. */
  threshold: 6,
  gridSize: 8,
} as const;

/** Card sides, in print order. The editor shows exactly one at a time. */
export const SIDE_IDS = ["front", "back"] as const satisfies readonly SideId[];

/** v2 gave every document a back side. */
export const SCHEMA_VERSION = 2;
