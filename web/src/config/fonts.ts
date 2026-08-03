/**
 * Font registry used by templates and the text properties panel.
 * Families are loaded on demand (see lib/fonts) so the editor boots fast.
 */

export interface FontDefinition {
  /** CSS family name, also what Fabric receives. */
  family: string;
  label: string;
  category: "sans" | "serif" | "display" | "mono";
  weights: number[];
  /** Google Fonts spec fragment; null for system stacks. */
  googleSpec: string | null;
}

export const FONTS: FontDefinition[] = [
  {
    family: "Inter",
    label: "Inter",
    category: "sans",
    weights: [300, 400, 500, 600, 700],
    googleSpec: "Inter:wght@300;400;500;600;700",
  },
  {
    family: "Poppins",
    label: "Poppins",
    category: "sans",
    weights: [300, 400, 500, 600, 700],
    googleSpec: "Poppins:wght@300;400;500;600;700",
  },
  {
    family: "Montserrat",
    label: "Montserrat",
    category: "sans",
    weights: [300, 400, 500, 600, 700],
    googleSpec: "Montserrat:wght@300;400;500;600;700",
  },
  {
    family: "Playfair Display",
    label: "Playfair Display",
    category: "serif",
    weights: [400, 500, 600, 700],
    googleSpec: "Playfair+Display:wght@400;500;600;700",
  },
  {
    family: "Lora",
    label: "Lora",
    category: "serif",
    weights: [400, 500, 600, 700],
    googleSpec: "Lora:wght@400;500;600;700",
  },
  {
    family: "Cormorant Garamond",
    label: "Cormorant",
    category: "serif",
    weights: [300, 400, 500, 600, 700],
    googleSpec: "Cormorant+Garamond:wght@300;400;500;600;700",
  },
  {
    family: "Bebas Neue",
    label: "Bebas Neue",
    category: "display",
    weights: [400],
    googleSpec: "Bebas+Neue",
  },
  {
    family: "Oswald",
    label: "Oswald",
    category: "display",
    weights: [300, 400, 500, 600, 700],
    googleSpec: "Oswald:wght@300;400;500;600;700",
  },
  {
    family: "Space Mono",
    label: "Space Mono",
    category: "mono",
    weights: [400, 700],
    googleSpec: "Space+Mono:wght@400;700",
  },
];

export const DEFAULT_FONT_FAMILY = "Inter";

export const FONT_SIZE_PRESETS = [6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 32, 40, 48];
