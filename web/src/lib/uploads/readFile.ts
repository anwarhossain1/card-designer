export const ACCEPTED_UPLOAD_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
] as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export interface UploadedAsset {
  id: string;
  name: string;
  /** Data URL — the design stays self-contained, so exports and autosave work offline. */
  dataUrl: string;
  type: string;
  width: number;
  height: number;
}

export class UploadError extends Error {}

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new UploadError("Could not read that file"));
    reader.readAsDataURL(file);
  });

const measure = (dataUrl: string) =>
  new Promise<{ width: number; height: number }>((resolve) => {
    const image = new Image();
    image.onload = () =>
      resolve({
        // SVGs without intrinsic size report 0; fall back to a square.
        width: image.naturalWidth || 300,
        height: image.naturalHeight || 300,
      });
    image.onerror = () => resolve({ width: 300, height: 300 });
    image.src = dataUrl;
  });

export async function readImageFile(
  file: File,
  createId: (prefix: string) => string,
): Promise<UploadedAsset> {
  if (!ACCEPTED_UPLOAD_TYPES.includes(file.type as (typeof ACCEPTED_UPLOAD_TYPES)[number])) {
    throw new UploadError("Use a PNG, JPEG or SVG file");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("That file is larger than 8 MB");
  }

  const dataUrl = await readAsDataUrl(file);
  const { width, height } = await measure(dataUrl);

  return {
    id: createId("img"),
    name: file.name.replace(/\.[^.]+$/, ""),
    dataUrl,
    type: file.type,
    width,
    height,
  };
}
