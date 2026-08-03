import type { DocumentSize, SceneJSON } from "./document";

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
  /** Dominant colours, used for the template card preview strip. */
  palette: string[];
  tags: string[];
}

export interface CardTemplate extends TemplateSummary {
  size: DocumentSize;
  /**
   * Built lazily so template modules stay small and fonts/images are only
   * resolved when a template is actually applied.
   */
  build: () => SceneJSON;
}
