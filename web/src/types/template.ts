import type { FabricObject } from "fabric";
import type { BackgroundSpec } from "@/lib/canvas/elements/background";

export type TemplateCategory =
  | "modern"
  | "minimal"
  | "corporate"
  | "creative"
  | "luxury";

export interface TemplateSummary {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  /** Dominant colours, used while a real preview renders. */
  palette: string[];
  /** Families the layout depends on; loaded before any text is measured. */
  fonts: string[];
}

export interface TemplateScene {
  background: BackgroundSpec;
  /** Bottom-most first, already positioned in card coordinates. */
  objects: FabricObject[];
}

export interface CardTemplate extends TemplateSummary {
  /**
   * Builds fresh Fabric objects on every call — objects belong to one canvas
   * at a time, so previews and the editor cannot share instances.
   */
  build: () => TemplateScene;
}
