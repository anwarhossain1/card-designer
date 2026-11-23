import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, type HydratedDocument } from "mongoose";

export const TEMPLATE_CATEGORIES = [
  "modern",
  "minimal",
  "corporate",
  "creative",
  "luxury",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

@Schema({ timestamps: true, versionKey: false })
export class Template {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: TEMPLATE_CATEGORIES })
  category!: TemplateCategory;

  @Prop({ type: [String], default: [] })
  palette!: string[];

  @Prop({ type: [String], default: [], index: true })
  tags!: string[];

  @Prop({ default: "" })
  description!: string;

  /** Font families the layout uses; the editor loads them before measuring. */
  @Prop({ type: [String], default: [] })
  fonts!: string[];

  /**
   * One serialized Fabric scene per side, in the same `{ id, scene }` shape a
   * saved design uses — a template is authored by designing a card in the
   * editor. Front is required, back optional. Opaque to the API.
   */
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  sides!: unknown;

  /** A small JPEG data URL of the front, for the catalogue grid. */
  @Prop({ type: String, default: null })
  thumbnail!: string | null;

  /**
   * New templates start as drafts: only an admin can see one until it is
   * published, so a half-finished template never reaches the catalogue.
   */
  @Prop({ default: false, index: true })
  published!: boolean;
}

export type TemplateDocument = HydratedDocument<Template>;

export const TemplateSchema = SchemaFactory.createForClass(Template);

/*
 * Backs the `$text` search in TemplatesService.list. Without it, any request
 * with `?search=` fails in MongoDB ("text index required") and answers 500.
 * A name match outranks a tag match.
 */
TemplateSchema.index(
  { name: "text", tags: "text" },
  { weights: { name: 3, tags: 1 }, name: "template_text_search" },
);
