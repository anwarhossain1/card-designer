import { z } from "zod";
import { TEMPLATE_CATEGORIES } from "../../templates/template.schema";

/**
 * Ids of the templates bundled into the web app (web/src/lib/templates). A
 * server template with one of these slugs would shadow, or be shadowed by,
 * the bundled one in the catalogue — and /editor?template=<id> deep links
 * would open whichever happened to win.
 */
export const RESERVED_TEMPLATE_SLUGS = [
  "modern-01",
  "minimal-01",
  "corporate-01",
  "creative-01",
  "luxury-01",
] as const;

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(60)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, digits and dashes")
  .refine(
    (slug) => !(RESERVED_TEMPLATE_SLUGS as readonly string[]).includes(slug),
    "That slug belongs to a built-in template",
  );

/** Path params are matched as given; only creation normalises. */
export const slugParamSchema = z.string().min(1).max(60);

/**
 * Same `{ id, scene }` shape a saved design's sides use, front first. Scenes
 * stay opaque, for the reason design.dto.ts gives: the API stores cards, it
 * does not interpret canvas internals.
 */
const sidesSchema = z
  .array(
    z.object({
      id: z.enum(["front", "back"]),
      scene: z.record(z.unknown()).nullable(),
    }),
  )
  .min(1)
  .max(2)
  .refine((sides) => sides[0]?.id === "front" && sides[0].scene !== null, {
    message: "The first side must be a front with a scene",
  })
  .refine((sides) => sides.length < 2 || sides[1]?.id === "back", {
    message: "The second side must be the back",
  });

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i, "Not a #rrggbb colour");

const fields = {
  name: z.string().trim().min(1).max(80),
  category: z.enum(TEMPLATE_CATEGORIES),
  description: z.string().trim().max(240),
  palette: z.array(hexColor).max(8),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(12),
  fonts: z.array(z.string().trim().min(1).max(60)).max(8),
  sides: sidesSchema,
  thumbnail: z.string().startsWith("data:image/").max(200_000).nullable(),
  published: z.boolean(),
};

export const createTemplateSchema = z.object({
  slug: slugSchema,
  name: fields.name,
  category: fields.category,
  description: fields.description.default(""),
  palette: fields.palette.default([]),
  tags: fields.tags.default([]),
  fonts: fields.fonts.default([]),
  sides: fields.sides,
  thumbnail: fields.thumbnail.default(null),
  published: fields.published.default(false),
});

/** Everything but the slug, which deep links and saved designs point at. */
export const updateTemplateSchema = z
  .object({
    name: fields.name,
    category: fields.category,
    description: fields.description,
    palette: fields.palette,
    tags: fields.tags,
    fonts: fields.fonts,
    sides: fields.sides,
    thumbnail: fields.thumbnail,
    published: fields.published,
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Nothing to update");

export const listTemplatesSchema = z.object({
  status: z.enum(["all", "published", "draft"]).default("all"),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  search: z.string().trim().min(1).max(80).optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type ListTemplatesQuery = z.infer<typeof listTemplatesSchema>;
