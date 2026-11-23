import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import {
  AdminAction,
  type AdminActionDocument,
  type AdminActionSource,
} from "./admin-action.schema";

export interface AdminActionInput {
  /** The acting admin's id, or null for a server-side script. */
  actorId: string | null;
  source: AdminActionSource;
  action: string;
  target: { kind: string; id: string };
  details?: unknown;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AdminAction.name)
    private readonly actions: Model<AdminActionDocument>,
  ) {}

  /**
   * Awaited by callers, deliberately: an admin change that cannot be recorded
   * should surface as an error rather than happen unseen.
   */
  async record(input: AdminActionInput): Promise<void> {
    await this.actions.create({
      actor: input.actorId,
      source: input.source,
      action: input.action,
      targetKind: input.target.kind,
      targetId: input.target.id,
      details: input.details ?? null,
    });
  }
}
