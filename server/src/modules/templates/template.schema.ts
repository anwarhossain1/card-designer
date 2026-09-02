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

  /** Serialized Fabric scene; opaque to the API. */
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  scene!: unknown;

  @Prop({ default: true, index: true })
  published!: boolean;
}

export type TemplateDocument = HydratedDocument<Template>;

export const TemplateSchema = SchemaFactory.createForClass(Template);
