import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** One browser's session. Capped per user so the array cannot grow forever. */
@Schema({ _id: true, timestamps: false })
export class RefreshToken {
  /**
   * SHA-256 of the token, never the token itself. A dump of this collection is
   * then useless for impersonation, which is not true if the JWT is stored raw.
   */
  @Prop({ required: true, index: true })
  tokenHash!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop()
  userAgent?: string;
}

const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 80 })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  /** `select: false` so no query returns the hash by accident. */
  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ type: String, enum: USER_ROLES, default: "user" })
  role!: UserRole;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Date, default: null })
  lastLoginAt!: Date | null;

  @Prop({ type: [RefreshTokenSchema], default: [], select: false })
  refreshTokens!: RefreshToken[];

  /**
   * Bumped to invalidate every issued token at once — a password change, or a
   * "sign out everywhere". Compared when refreshing rather than on every
   * request, so revocation costs one database read per refresh instead of one
   * per call; the price is that a live access token stays usable until it
   * expires, which is what keeps ACCESS_TOKEN_TTL short.
   */
  @Prop({ default: 0 })
  tokenVersion!: number;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
