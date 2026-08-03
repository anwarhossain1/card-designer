import {
  Image as ImageIcon,
  LayoutTemplate,
  Layers,
  Palette,
  QrCode,
  Shapes,
  Smile,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PanelId } from "@/store/uiStore";

export interface PanelDefinition {
  id: PanelId;
  label: string;
  icon: LucideIcon;
  /** Shown in the drawer until the panel's own feature is built. */
  summary: string;
}

export const PANELS: PanelDefinition[] = [
  {
    id: "templates",
    label: "Templates",
    icon: LayoutTemplate,
    summary: "Modern, minimal, corporate, creative and luxury starting points.",
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: ImageIcon,
    summary: "Drop in a logo or photo — PNG, JPEG or SVG.",
  },
  {
    id: "text",
    label: "Text",
    icon: Type,
    summary: "Headings, subheadings, paragraphs and custom text blocks.",
  },
  {
    id: "shapes",
    label: "Shapes",
    icon: Shapes,
    summary: "Rectangles, rounded rectangles, circles, triangles and lines.",
  },
  {
    id: "icons",
    label: "Icons",
    icon: Smile,
    summary: "Contact and social icons you can recolour and resize.",
  },
  {
    id: "background",
    label: "Background",
    icon: Palette,
    summary: "Solid colours, gradients, images and patterns.",
  },
  {
    id: "qr",
    label: "QR Code",
    icon: QrCode,
    summary: "Generate a QR from a website, phone, email or vCard.",
  },
  {
    id: "layers",
    label: "Layers",
    icon: Layers,
    summary: "Reorder, lock, hide, duplicate and delete everything on the card.",
  },
];

export const PANEL_MAP = new Map(PANELS.map((panel) => [panel.id, panel]));
