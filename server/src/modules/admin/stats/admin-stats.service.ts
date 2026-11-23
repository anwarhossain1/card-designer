import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Design, type DesignDocument } from "../../designs/design.schema";
import {
  Template,
  type TemplateDocument,
} from "../../templates/template.schema";
import { User, type UserDocument } from "../../users/user.schema";

const DAY_MS = 86_400_000;

/** Days of sign-up history the dashboard chart shows. */
export const SIGNUP_DAYS = 30;

export interface AdminStats {
  users: { total: number; active: number; admins: number; newLast7Days: number };
  designs: { total: number; byAccounts: number; byGuests: number };
  templates: { published: number; drafts: number };
  /** One entry per UTC day, oldest first, days without sign-ups included. */
  signupsByDay: { date: string; count: number }[];
}

/** `YYYY-MM-DD` in UTC, the same form MongoDB's `$dateToString` gives. */
const utcDay = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Counts for the admin dashboard. Every figure is a count over an indexed or
 * small collection, so this is computed on request rather than cached; it
 * would earn a cache long after it earned a faster query.
 */
@Injectable()
export class AdminStatsService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    @InjectModel(Design.name) private readonly designs: Model<DesignDocument>,
    @InjectModel(Template.name)
    private readonly templates: Model<TemplateDocument>,
  ) {}

  async overview(now = new Date()): Promise<AdminStats> {
    const today = new Date(utcDay(now));
    const since = new Date(today.getTime() - (SIGNUP_DAYS - 1) * DAY_MS);
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);

    const [
      total,
      active,
      admins,
      newLast7Days,
      byAccounts,
      byGuests,
      published,
      drafts,
      signups,
    ] = await Promise.all([
      this.users.countDocuments(),
      this.users.countDocuments({ isActive: true }),
      this.users.countDocuments({ role: "admin", isActive: true }),
      this.users.countDocuments({ createdAt: { $gte: weekAgo } }),
      this.designs.countDocuments({ owner: { $type: "objectId" } }),
      this.designs.countDocuments({ guestId: { $type: "string" } }),
      this.templates.countDocuments({ published: true }),
      this.templates.countDocuments({ published: false }),
      this.users.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const counts = new Map(signups.map((row) => [row._id, row.count]));
    const signupsByDay = Array.from({ length: SIGNUP_DAYS }, (_, index) => {
      const date = utcDay(new Date(since.getTime() + index * DAY_MS));
      return { date, count: counts.get(date) ?? 0 };
    });

    return {
      users: { total, active, admins, newLast7Days },
      designs: { total: byAccounts + byGuests, byAccounts, byGuests },
      templates: { published, drafts },
      signupsByDay,
    };
  }
}
