import { Schema, model, type InferSchemaType } from "mongoose";

export const TEMPLATE_CATEGORIES = [
  "modern",
  "minimal",
  "corporate",
  "creative",
  "luxury",
] as const;

const templateSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, enum: TEMPLATE_CATEGORIES, required: true },
    palette: { type: [String], default: [] },
    tags: { type: [String], default: [], index: true },
    /** Serialized Fabric scene; opaque to the API. */
    scene: { type: Schema.Types.Mixed, required: true },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export type TemplateDocument = InferSchemaType<typeof templateSchema>;

export const TemplateModel = model("Template", templateSchema);
