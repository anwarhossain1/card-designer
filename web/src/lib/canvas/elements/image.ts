import { FabricImage, loadSVGFromString, Rect, util, type FabricObject } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/config/document";
import type { UploadedAsset } from "@/lib/uploads/readFile";
import { attachMeta, createMeta } from "../meta";

/** New artwork never lands larger than this share of the card. */
const MAX_SHARE = 0.45;

function fitScale(width: number, height: number) {
  return Math.min(
    (CANVAS_WIDTH * MAX_SHARE) / width,
    (CANVAS_HEIGHT * MAX_SHARE) / height,
    1,
  );
}

/**
 * SVG uploads are parsed into vector objects rather than rasterised, so a logo
 * stays crisp at 300 DPI and its colours remain editable.
 */
async function createVectorElement(asset: UploadedAsset): Promise<FabricObject | null> {
  const markup = decodeURIComponent(asset.dataUrl.replace(/^data:image\/svg\+xml[^,]*,/, ""));
  const { objects } = await loadSVGFromString(markup);
  const parts = objects.filter((object): object is FabricObject => Boolean(object));
  if (parts.length === 0) return null;

  const element = util.groupSVGElements(parts);
  const scale = fitScale(element.width || 1, element.height || 1);
  element.set({ scaleX: scale, scaleY: scale, objectCaching: false });

  return element;
}

export async function createImageElement(
  asset: UploadedAsset,
): Promise<FabricObject | null> {
  const isSvg = asset.type === "image/svg+xml";

  const element = isSvg
    ? await createVectorElement(asset)
    : await FabricImage.fromURL(asset.dataUrl).then((image) => {
        const scale = fitScale(image.width, image.height);
        image.set({ scaleX: scale, scaleY: scale });
        return image as FabricObject;
      });

  if (!element) return null;

  return attachMeta(
    element,
    createMeta({ kind: "image", name: asset.name || "Image", role: "logo" }),
  );
}

/**
 * Rounded corners are a clip path on the object, sized in unscaled units so the
 * radius keeps its shape as the image is resized.
 */
export function setImageRadius(object: FabricObject, radius: number) {
  if (radius <= 0) {
    object.set({ clipPath: undefined, dirty: true });
    return;
  }

  object.set({
    clipPath: new Rect({
      width: object.width,
      height: object.height,
      rx: radius,
      ry: radius,
      originX: "center",
      originY: "center",
    }),
    dirty: true,
  });
}

export function getImageRadius(object: FabricObject): number {
  const clip = object.clipPath as Rect | undefined;
  return clip?.rx ?? 0;
}
