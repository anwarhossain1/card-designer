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
  icon: LucideIcon;
}

/** Labels come from the dictionary, keyed by `id`; only icons live here. */
export const PANELS: PanelDefinition[] = [
  { id: "templates", icon: LayoutTemplate },
  { id: "uploads", icon: ImageIcon },
  { id: "text", icon: Type },
  { id: "shapes", icon: Shapes },
  { id: "icons", icon: Smile },
  { id: "background", icon: Palette },
  { id: "qr", icon: QrCode },
  { id: "layers", icon: Layers },
];

export const PANEL_MAP = new Map(PANELS.map((panel) => [panel.id, panel]));
