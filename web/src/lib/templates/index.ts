import type { CardTemplate } from "@/types/template";
import { modernTemplate } from "./modern";
import { minimalTemplate } from "./minimal";
import { corporateTemplate } from "./corporate";
import { creativeTemplate } from "./creative";
import { luxuryTemplate } from "./luxury";

/**
 * Bundled template catalogue. Ids match the landing page cards, so
 * /editor?template=<id> deep links resolve without a lookup table.
 */
export const TEMPLATES: CardTemplate[] = [
  modernTemplate,
  minimalTemplate,
  corporateTemplate,
  creativeTemplate,
  luxuryTemplate,
];

export const TEMPLATE_MAP = new Map(
  TEMPLATES.map((template) => [template.id, template]),
);

export const findTemplate = (id: string | null | undefined) =>
  id ? (TEMPLATE_MAP.get(id) ?? null) : null;
