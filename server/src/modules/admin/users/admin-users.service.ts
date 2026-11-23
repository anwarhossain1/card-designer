import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types, type FilterQuery, type Model } from "mongoose";
import { AuthService } from "../../auth/auth.service";
import { AuditService } from "../../audit/audit.service";
import { Design, type DesignDocument } from "../../designs/design.schema";
import type { MailLocale } from "../../mail/templates";
import { User, type UserDocument, type UserRole } from "../../users/user.schema";
import { UsersService } from "../../users/users.service";
import type { ListUsersQuery } from "./admin-users.dto";

/** A user as the admin pages see it. Never carries hashes or tokens. */
export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  /** How the account can sign in; both can be true. */
  signIn: { password: boolean; google: boolean };
  designCount: number;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface AdminUserDetail extends AdminUserSummary {
  /** Signed-in browsers right now, out of the per-account cap of five. */
  activeSessions: number;
}

interface UserRow {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  googleId: string | null;
  hasPassword: boolean;
  sessionCount: number;
  createdAt: Date;
  lastLoginAt: Date | null;
}

/**
 * Only what the admin pages show. The password hash and refresh tokens are
 * reduced to a boolean and a count inside MongoDB, so neither is ever loaded
 * into this process, let alone returned.
 */
const USER_PROJECTION = {
  name: 1,
  email: 1,
  role: 1,
  isActive: 1,
  googleId: 1,
  createdAt: 1,
  lastLoginAt: 1,
  hasPassword: { $gt: ["$passwordHash", null] },
  sessionCount: { $size: { $ifNull: ["$refreshTokens", []] } },
} as const;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toSummary = (row: UserRow, designCount: number): AdminUserSummary => ({
  id: row._id.toString(),
  name: row.name,
  email: row.email,
  role: row.role,
  isActive: row.isActive,
  signIn: { password: row.hasPassword, google: Boolean(row.googleId) },
  designCount,
  createdAt: row.createdAt,
  lastLoginAt: row.lastLoginAt ?? null,
});

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Design.name)
    private readonly designModel: Model<DesignDocument>,
    private readonly users: UsersService,
    private readonly auth: AuthService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListUsersQuery) {
    const filter: FilterQuery<UserDocument> = {};
    if (query.role) filter.role = query.role;
    if (query.status) filter.isActive = query.status === "active";
    if (query.search) {
      const pattern = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [{ name: pattern }, { email: pattern }];
    }

    const [result] = await this.userModel.aggregate<{
      items: UserRow[];
      total: { count: number }[];
    }>([
      { $match: filter },
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $facet: {
          items: [
            { $skip: (query.page - 1) * query.limit },
            { $limit: query.limit },
            { $project: USER_PROJECTION },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const rows = result?.items ?? [];
    const counts = await this.designCounts(rows.map((row) => row._id));

    return {
      items: rows.map((row) =>
        toSummary(row, counts.get(row._id.toString()) ?? 0),
      ),
      total: result?.total[0]?.count ?? 0,
      page: query.page,
      limit: query.limit,
    };
  }

  async detail(userId: string): Promise<AdminUserDetail> {
    const row = await this.findRow(userId);
    const counts = await this.designCounts([row._id]);
    return {
      ...toSummary(row, counts.get(userId) ?? 0),
      activeSessions: row.sessionCount,
    };
  }

  /**
   * Deactivating also ends every session: stored refresh tokens are dropped
   * and tokenVersion moves, so the account is signed out everywhere within
   * one access-token lifetime, and out of the admin pages immediately.
   */
  async setActive(actorId: string, userId: string, active: boolean) {
    if (actorId === userId) {
      throw new BadRequestException("You cannot change your own status");
    }

    const row = await this.findRow(userId);
    if (row.isActive === active) return this.detail(userId);

    if (!active && row.role === "admin") await this.assertNotLastAdmin();

    await this.userModel
      .updateOne(
        { _id: userId },
        active
          ? { $set: { isActive: true } }
          : {
              $set: { isActive: false, refreshTokens: [] },
              $inc: { tokenVersion: 1 },
            },
      )
      .exec();

    await this.audit.record({
      actorId,
      source: "api",
      action: active ? "user.reactivate" : "user.deactivate",
      target: { kind: "user", id: userId },
      details: { email: row.email },
    });

    return this.detail(userId);
  }

  /**
   * Takes effect on the account's next admin request — AdminGuard reads the
   * role from the database — so there is no session to end here.
   */
  async setRole(actorId: string, userId: string, role: UserRole) {
    if (actorId === userId) {
      throw new BadRequestException("You cannot change your own role");
    }

    const row = await this.findRow(userId);
    if (row.role === role) return this.detail(userId);

    if (role === "admin" && !row.isActive) {
      throw new ConflictException("Reactivate this account before promoting it");
    }
    if (row.role === "admin" && row.isActive) await this.assertNotLastAdmin();

    await this.users.setRole(userId, role);
    await this.audit.record({
      actorId,
      source: "api",
      action: role === "admin" ? "user.promote" : "user.demote",
      target: { kind: "user", id: userId },
      details: { email: row.email, from: row.role, to: role },
    });

    return this.detail(userId);
  }

  /**
   * Sends the same email the forgot-password form does. The admin never sees
   * the link or sets a password; the account's owner still has to act.
   */
  async sendPasswordReset(actorId: string, userId: string, locale: MailLocale) {
    const row = await this.findRow(userId);
    if (!row.isActive) {
      throw new ConflictException("This account is deactivated");
    }

    await this.auth.requestPasswordReset(row.email, locale);
    await this.audit.record({
      actorId,
      source: "api",
      action: "user.password-reset",
      target: { kind: "user", id: userId },
      details: { email: row.email },
    });
  }

  private async findRow(userId: string): Promise<UserRow> {
    const [row] = await this.userModel.aggregate<UserRow>([
      { $match: { _id: new Types.ObjectId(userId) } },
      { $project: USER_PROJECTION },
    ]);
    if (!row) throw new NotFoundException("User not found");
    return row;
  }

  /**
   * Refuses to take away the last active admin, which would leave nobody able
   * to reach these pages. Check-then-write rather than atomic: two admins
   * demoting each other in the same instant could both pass, and the
   * make-admin script is the way back from that.
   */
  private async assertNotLastAdmin() {
    if ((await this.users.countActiveAdmins()) <= 1) {
      throw new ConflictException("This is the last active admin");
    }
  }

  private async designCounts(ids: Types.ObjectId[]) {
    if (ids.length === 0) return new Map<string, number>();

    const rows = await this.designModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      { $match: { owner: { $in: ids } } },
      { $group: { _id: "$owner", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((row) => [row._id.toString(), row.count]));
  }
}
