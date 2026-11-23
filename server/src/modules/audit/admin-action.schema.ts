import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  Schema as MongooseSchema,
  Types,
  type HydratedDocument,
} from "mongoose";

/** Where an admin action came from: the admin API, or a script on the server. */
export const ADMIN_ACTION_SOURCES = ["api", "cli"] as const;
export type AdminActionSource = (typeof ADMIN_ACTION_SOURCES)[number];

/**
 * One thing an admin did, kept so "who changed this?" has an answer once more
 * than one person holds the role. Append-only: nothing updates or deletes a
 * row, and no endpoint is planned that would.
 */
@Schema({
  collection: "adminActions",
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class AdminAction {
  /** The admin who acted; null when it came from a server-side script. */
  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  actor!: Types.ObjectId | null;

  @Prop({ required: true, enum: ADMIN_ACTION_SOURCES })
  source!: AdminActionSource;

  /** Dotted verb, e.g. `user.promote`, `template.publish`. */
  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  targetKind!: string;

  @Prop({ required: true })
  targetId!: string;

  /** Before/after values or anything else worth keeping; never secrets. */
  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  details!: unknown;
}

export type AdminActionDocument = HydratedDocument<AdminAction>;

export const AdminActionSchema = SchemaFactory.createForClass(AdminAction);

// The two questions the log exists to answer: what happened lately, and what
// happened to this one thing.
AdminActionSchema.index({ createdAt: -1 });
AdminActionSchema.index({ targetKind: 1, targetId: 1, createdAt: -1 });
