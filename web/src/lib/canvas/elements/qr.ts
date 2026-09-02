import QRCode from "qrcode";
import { loadSVGFromString, util, type Canvas, type FabricObject } from "fabric";
import {
  describeQr,
  encodeQrPayload,
  type QrConfig,
} from "@/lib/qr/config";
import { attachMeta, createMeta, getMeta, setMetaName } from "../meta";

/** Default footprint on the card: 0.58 in, comfortably above scanning minimums. */
export const QR_DEFAULT_SIZE = 56;

export type QrObject = FabricObject & { qr?: QrConfig };

export const getQrConfig = (object: FabricObject): QrConfig | null =>
  (object as QrObject).qr ?? null;

/**
 * QR codes are rendered as vectors, not images: a raster code resampled at
 * 300 DPI is exactly how unscannable prints happen.
 */
/**
 * Renders any payload verbatim — batch generation encodes raw roster values
 * (a student id must stay a student id, with no URL scheme guessed on).
 */
export async function buildQrArtwork(
  payload: string,
  style: Pick<
    QrConfig,
    "margin" | "darkColor" | "lightColor" | "transparentBackground"
  >,
): Promise<FabricObject | null> {
  const svg = await QRCode.toString(payload, {
    type: "svg",
    margin: style.margin,
    errorCorrectionLevel: "M",
    color: {
      dark: style.darkColor,
      light: style.transparentBackground ? "#ffffff00" : style.lightColor,
    },
  });

  const { objects } = await loadSVGFromString(svg);
  const parts = objects.filter((object): object is FabricObject => Boolean(object));
  if (parts.length === 0) return null;

  return util.groupSVGElements(parts);
}

async function buildQrObject(config: QrConfig): Promise<FabricObject | null> {
  const payload = encodeQrPayload(config);
  if (!payload) return null;
  return buildQrArtwork(payload, config);
}

export async function createQrElement(
  config: QrConfig,
): Promise<FabricObject | null> {
  const element = await buildQrObject(config);
  if (!element) return null;

  const scale = QR_DEFAULT_SIZE / (element.width || QR_DEFAULT_SIZE);
  element.set({ scaleX: scale, scaleY: scale, objectCaching: false });
  (element as QrObject).qr = config;

  return attachMeta(
    element,
    createMeta({ kind: "qr", name: describeQr(config), role: "qr" }),
  );
}

/**
 * Regenerating replaces the artwork in place: the element keeps its id,
 * position, size and rotation, so editing the payload never moves the code.
 */
export async function updateQrElement(
  canvas: Canvas,
  target: FabricObject,
  config: QrConfig,
): Promise<FabricObject | null> {
  const replacement = await buildQrObject(config);
  if (!replacement) return null;

  const meta = getMeta(target);
  const index = canvas.getObjects().indexOf(target);
  const scale =
    (target.getScaledWidth() || QR_DEFAULT_SIZE) / (replacement.width || 1);

  replacement.set({
    left: target.left,
    top: target.top,
    angle: target.angle,
    opacity: target.opacity,
    flipX: target.flipX,
    flipY: target.flipY,
    scaleX: scale,
    scaleY: scale,
    objectCaching: false,
  });

  (replacement as QrObject).qr = config;
  if (meta) {
    attachMeta(replacement, { ...meta });
    setMetaName(replacement, describeQr(config));
  }

  canvas.remove(target);
  canvas.add(replacement);
  if (index >= 0) canvas.moveObjectTo(replacement, index);
  canvas.setActiveObject(replacement);
  canvas.requestRenderAll();

  return replacement;
}
