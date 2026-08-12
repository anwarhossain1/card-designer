import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import bcrypt from "bcrypt";
import type { Model } from "mongoose";
import { User, type UserDocument } from "./user.schema";

/** Matches the choto-url backend, which is the only reason to prefer 12. */
const BCRYPT_ROUNDS = 12;

/** Concurrent sessions per account, oldest evicted first. */
const MAX_SESSIONS = 5;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export const toPublicUser = (user: UserDocument): PublicUser => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.get("createdAt") as Date,
});

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
  ) {}

  async create(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    try {
      return await this.users.create({
        name: input.name,
        email: input.email,
        passwordHash,
      });
    } catch (error) {
      /*
       * Report a conflict only on the field that actually collided, so an
       * unrelated unique index can never surface as "email already
       * registered" — a lesson already paid for in the choto-url backend.
       */
      const duplicate = error as { code?: number; keyPattern?: object };
      if (duplicate.code === 11000) {
        const fields = Object.keys(duplicate.keyPattern ?? {});
        if (fields.includes("email")) {
          throw new ConflictException("Email already registered");
        }
      }
      throw error;
    }
  }

  /** The only query that returns the hash; every other read omits it. */
  findByEmailWithPassword(email: string) {
    return this.users.findOne({ email }).select("+passwordHash").exec();
  }

  findByEmail(email: string) {
    return this.users.findOne({ email }).exec();
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async startPasswordReset(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.users
      .updateOne(
        { _id: userId },
        {
          $set: {
            passwordResetTokenHash: tokenHash,
            passwordResetExpiresAt: expiresAt,
          },
        },
      )
      .exec();
  }

  /** Only ever returns a token that is both current and unexpired. */
  findByResetTokenHash(tokenHash: string) {
    return this.users
      .findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      })
      .exec();
  }

  /**
   * Sets the new password and closes every door behind it: the reset token is
   * spent, stored sessions are dropped, and tokenVersion moves so any refresh
   * token still in a browser stops working. Whoever forced the reset should be
   * signed out by it, not left holding a session.
   */
  async completePasswordReset(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.users
      .updateOne(
        { _id: userId },
        {
          $set: {
            passwordHash,
            passwordResetTokenHash: null,
            passwordResetExpiresAt: null,
            refreshTokens: [],
          },
          $inc: { tokenVersion: 1 },
        },
      )
      .exec();
  }

  findById(id: string) {
    return this.users.findById(id).exec();
  }

  findByIdWithSessions(id: string) {
    return this.users.findById(id).select("+refreshTokens").exec();
  }

  verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /** Records a new session, evicting the oldest once the cap is reached. */
  async addSession(
    userId: string,
    tokenHash: string,
    userAgent?: string,
  ): Promise<void> {
    const user = await this.findByIdWithSessions(userId);
    if (!user) return;

    user.refreshTokens.push({ tokenHash, createdAt: new Date(), userAgent });
    if (user.refreshTokens.length > MAX_SESSIONS) {
      user.refreshTokens = user.refreshTokens.slice(-MAX_SESSIONS);
    }
    user.lastLoginAt = new Date();
    await user.save();
  }

  /**
   * Swaps one session's token for its replacement, and reports whether the old
   * one was actually there. A miss means the token was already rotated or
   * revoked — the caller treats that as a rejected refresh rather than
   * silently issuing a fresh session.
   */
  async replaceSession(
    userId: string,
    oldHash: string,
    newHash: string,
    userAgent?: string,
  ): Promise<boolean> {
    const result = await this.users
      .updateOne(
        { _id: userId, "refreshTokens.tokenHash": oldHash },
        {
          $set: {
            "refreshTokens.$.tokenHash": newHash,
            "refreshTokens.$.createdAt": new Date(),
            ...(userAgent ? { "refreshTokens.$.userAgent": userAgent } : {}),
          },
        },
      )
      .exec();

    return result.matchedCount > 0;
  }

  async removeSession(userId: string, tokenHash: string): Promise<void> {
    await this.users
      .updateOne({ _id: userId }, { $pull: { refreshTokens: { tokenHash } } })
      .exec();
  }
}
