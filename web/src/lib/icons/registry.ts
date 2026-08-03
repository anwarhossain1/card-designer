/**
 * Icon registry.
 *
 * Glyphs are stroke-based on a 24 × 24 grid so they stay legible at business
 * card sizes. The same `body` markup feeds both the sidebar preview and the
 * Fabric object, so a panel icon always matches what lands on the card.
 *
 * Outlines derived from Lucide (https://lucide.dev), ISC licensed.
 */

export type IconGroup = "contact" | "social";

export interface IconDefinition {
  id: string;
  label: string;
  group: IconGroup;
  /** Inner SVG markup for a 0 0 24 24 viewBox. */
  body: string;
}

const PHONE_PATH =
  "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z";

export const ICONS: IconDefinition[] = [
  {
    id: "phone",
    label: "Phone",
    group: "contact",
    body: `<path d="${PHONE_PATH}"/>`,
  },
  {
    id: "email",
    label: "Email",
    group: "contact",
    body: `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`,
  },
  {
    id: "website",
    label: "Website",
    group: "contact",
    body: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
  },
  {
    id: "location",
    label: "Location",
    group: "contact",
    body: `<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`,
  },
  {
    id: "facebook",
    label: "Facebook",
    group: "social",
    body: `<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    group: "social",
    body: `<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>`,
  },
  {
    id: "instagram",
    label: "Instagram",
    group: "social",
    body: `<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    group: "social",
    // Chat bubble with a handset — a generic mark, not the trademarked logo.
    body: `<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path transform="translate(7.4 6.8) scale(0.4)" d="${PHONE_PATH}"/>`,
  },
];

export const ICON_MAP = new Map(ICONS.map((icon) => [icon.id, icon]));

export const DEFAULT_ICON_COLOR = "#11141c";
export const DEFAULT_ICON_STROKE = 2;

/** Wraps registry markup into a standalone SVG document for Fabric. */
export function buildIconSvg(
  body: string,
  color = DEFAULT_ICON_COLOR,
  strokeWidth = DEFAULT_ICON_STROKE,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
