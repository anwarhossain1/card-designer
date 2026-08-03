import { DESIGN_DPI } from "@/config/document";

export const inchesToPx = (inches: number, dpi = DESIGN_DPI) => inches * dpi;

export const pxToInches = (px: number, dpi = DESIGN_DPI) => px / dpi;

export const mmToInches = (mm: number) => mm / 25.4;

export const inchesToMm = (inches: number) => inches * 25.4;

/** Scale factor to render a design-DPI canvas at a target output DPI. */
export const exportMultiplier = (targetDpi: number) => targetDpi / DESIGN_DPI;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const round = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};
