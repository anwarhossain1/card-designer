import { FONTS } from "@/config/fonts";

/**
 * Loads editor fonts on demand.
 *
 * Fabric measures glyphs against whatever the browser has ready, so a font must
 * be fully loaded before text is laid out — otherwise the first render uses a
 * fallback and the box is the wrong size.
 */
const requested = new Map<string, Promise<void>>();

const FONT_MAP = new Map(FONTS.map((font) => [font.family, font]));

function injectStylesheet(spec: string, id: string) {
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
  document.head.appendChild(link);
}

export function loadFont(family: string): Promise<void> {
  const cached = requested.get(family);
  if (cached) return cached;

  const definition = FONT_MAP.get(family);
  if (!definition?.googleSpec) return Promise.resolve();

  const id = `font-${family.replace(/\s+/g, "-").toLowerCase()}`;
  injectStylesheet(definition.googleSpec, id);

  const promise = Promise.all(
    definition.weights.map((weight) =>
      document.fonts.load(`${weight} 16px "${family}"`),
    ),
  )
    .then(() => undefined)
    .catch(() => undefined);

  requested.set(family, promise);
  return promise;
}

/** Fonts already requested this session — used to preload the default. */
export const isFontLoaded = (family: string) => requested.has(family);
