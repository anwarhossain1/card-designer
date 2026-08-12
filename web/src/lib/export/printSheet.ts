import {
  BLEED_PX,
  CROP_MARK_PX,
  PRINT_MARGIN_PX,
} from "@/config/document";

/** Hairline at print resolution; never thinner than a device pixel. */
const MARK_WIDTH_PX = 0.5;
const MARK_COLOUR = "#000000";

/**
 * Wraps a rendered card in the bleed and crop marks a printer needs.
 *
 * Bleed exists because trimming is not exact. A cut that lands a fraction
 * outside the card would show white paper, so the artwork is extended past
 * the trim line and the printer cuts through it.
 *
 * The extension is made by stretching the card's outermost row and column of
 * pixels outward. That is the standard way to generate bleed from art that
 * stops at the trim line, and it is the only approach here that cannot be
 * wrong: whatever colour sits at the edge continues past it exactly, whether
 * that is a flat background, a bar of colour or a photograph. Scaling the
 * design up instead would push edge-anchored elements off the card, and
 * enlarging only the background would leave a white sliver wherever a shape
 * met the edge.
 *
 * The stretched pixels are only ever inside the bleed, which is cut away.
 */
export function composePrintSheet(
  card: HTMLCanvasElement,
  scale: number,
): HTMLCanvasElement {
  const margin = Math.round(PRINT_MARGIN_PX * scale);
  const bleed = Math.round(BLEED_PX * scale);
  const markLength = Math.round(CROP_MARK_PX * scale);

  const sheet = document.createElement("canvas");
  sheet.width = card.width + margin * 2;
  sheet.height = card.height + margin * 2;

  const ctx = sheet.getContext("2d");
  if (!ctx) return card;

  // Everything outside the bleed is unprinted paper.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sheet.width, sheet.height);

  const left = margin;
  const top = margin;
  const right = margin + card.width;
  const bottom = margin + card.height;

  /*
   * Card first, edges over it. A background drawn to the card bounds
   * anti-aliases against them, so its outermost row is partial coverage — laid
   * on white paper that reads as a pale outline exactly on the trim line. The
   * strips overlap the card slightly and cover it with the colour that is
   * already there.
   */
  ctx.drawImage(card, left, top);
  extendEdges(ctx, card, { left, top, right, bottom, bleed, scale });
  drawCropMarks(ctx, { left, top, right, bottom, bleed, markLength, scale });

  return sheet;
}

function extendEdges(
  ctx: CanvasRenderingContext2D,
  card: HTMLCanvasElement,
  {
    left,
    top,
    right,
    bottom,
    bleed,
    scale,
  }: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    bleed: number;
    scale: number;
  },
): void {
  const { width, height } = card;

  /*
   * Sampled a whisker inside the edge rather than on it, for the same reason
   * the strips are drawn over the card: the outermost row is a blend. One
   * design pixel in is past it and the same colour to the eye. The same
   * distance is used as the overlap, so what gets covered is exactly the
   * blended boundary and nothing a design could rely on — real content sits a
   * safe area away.
   */
  const inset = Math.max(1, Math.round(scale));
  const reach = bleed + inset;
  const innerWidth = width - inset * 2;
  const innerHeight = height - inset * 2;

  // Horizontal strips run the full sheet width, corners included.
  ctx.drawImage(card, inset, inset, innerWidth, 1,
    left - bleed, top - bleed, width + bleed * 2, reach);
  ctx.drawImage(card, inset, height - 1 - inset, innerWidth, 1,
    left - bleed, bottom - inset, width + bleed * 2, reach);

  // Vertical strips run last, so a side colour wins its own corners — which is
  // what a design with a full-height edge bar expects.
  ctx.drawImage(card, inset, inset, 1, innerHeight,
    left - bleed, top - bleed, reach, height + bleed * 2);
  ctx.drawImage(card, width - 1 - inset, inset, 1, innerHeight,
    right - inset, top - bleed, reach, height + bleed * 2);
}

/**
 * Two marks per corner, on the trim lines and stopping at the bleed edge — so
 * they say where to cut without ever printing on the card or on the part of
 * the bleed that survives a slightly off cut.
 */
function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  {
    left,
    top,
    right,
    bottom,
    bleed,
    markLength,
    scale,
  }: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    bleed: number;
    markLength: number;
    scale: number;
  },
): void {
  ctx.strokeStyle = MARK_COLOUR;
  ctx.lineWidth = Math.max(1, MARK_WIDTH_PX * scale);

  const line = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const outerLeft = left - bleed;
  const outerTop = top - bleed;
  const outerRight = right + bleed;
  const outerBottom = bottom + bleed;

  // Horizontal marks, aligned with the top and bottom trim lines.
  line(outerLeft - markLength, top, outerLeft, top);
  line(outerRight, top, outerRight + markLength, top);
  line(outerLeft - markLength, bottom, outerLeft, bottom);
  line(outerRight, bottom, outerRight + markLength, bottom);

  // Vertical marks, aligned with the left and right trim lines.
  line(left, outerTop - markLength, left, outerTop);
  line(left, outerBottom, left, outerBottom + markLength);
  line(right, outerTop - markLength, right, outerTop);
  line(right, outerBottom, right, outerBottom + markLength);
}
