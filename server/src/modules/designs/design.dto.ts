import { z } from "zod";

/** Matches the editor's `createId("doc")`: a short prefix and random tail. */
export const documentIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z]+_[a-z0-9]{6,32}$/i, "Not a document id");

const sideSchema = z.object({
  id: z.enum(["front", "back"]),
  /** A serialized Fabric scene, or null for a side nobody has drawn on. */
  scene: z.record(z.unknown()).nullable(),
});

/**
 * The document as the editor sends it.
 *
 * Scenes stay `unknown` on purpose: the API stores and returns cards, it does
 * not interpret them. Validating canvas internals here would put the render
 * engine's shape in two places and break saving every time one of them moved.
 */
export const saveDesignSchema = z.object({
  schemaVersion: z.number().int().positive(),
  kind: z.literal("business-card"),
  name: z.string().trim().min(1).max(120),
  size: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(["in", "mm", "px"]),
  }),
  bleed: z.number().min(0),
  safeArea: z.number().min(0),
  templateId: z.string().max(80).nullable(),
  sides: z.array(sideSchema).min(1).max(2),
  /**
   * Capped and format-checked so a design row cannot quietly become an image
   * host. A 250x143 JPEG of a card lands well under this.
   */
  thumbnail: z
    .string()
    .startsWith("data:image/")
    .max(200_000)
    .nullish(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SaveDesignInput = z.infer<typeof saveDesignSchema>;
