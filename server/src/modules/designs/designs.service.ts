import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types, type FilterQuery, type Model } from "mongoose";
import type { Requester } from "../../common/decorators/requester.decorator";
import { Design, type DesignDocument } from "./design.schema";
import type { SaveDesignInput } from "./design.dto";

/**
 * Guests get a tighter cap than accounts: a guest id is self-issued by anyone
 * who can set a cookie, so it is the cheaper thing to abuse.
 */
const MAX_DESIGNS_PER_USER = 50;
const MAX_DESIGNS_PER_GUEST = 10;

/** The document as the editor knows it — `id` is the client's document id. */
export interface CardDocumentResponse {
  id: string;
  schemaVersion: number;
  kind: string;
  name: string;
  size: unknown;
  bleed: number;
  safeArea: number;
  templateId: string | null;
  sides: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface DesignSummary {
  id: string;
  name: string;
  templateId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Rows are never returned as they are stored.
 *
 * `owner` and `guestId` are the server's business: handing a browser back its
 * own guest id would undo the httpOnly cookie it was deliberately hidden in.
 * What comes out is exactly the document that went in, so it can be loaded
 * straight onto the canvas.
 */
const toDocument = (design: Design): CardDocumentResponse => ({
  id: design.documentId,
  schemaVersion: design.schemaVersion,
  kind: design.kind,
  name: design.name,
  size: design.size,
  bleed: design.bleed,
  safeArea: design.safeArea,
  templateId: design.templateId,
  sides: design.sides,
  createdAt: design.createdAt,
  updatedAt: design.updatedAt,
});

/** Listing omits the scenes: a card with an inlined photo is not small. */
const toSummary = (design: Design): DesignSummary => ({
  id: design.documentId,
  name: design.name,
  templateId: design.templateId,
  createdAt: design.createdAt,
  updatedAt: design.updatedAt,
});

@Injectable()
export class DesignsService {
  private readonly logger = new Logger(DesignsService.name);

  constructor(
    @InjectModel(Design.name)
    private readonly designs: Model<DesignDocument>,
  ) {}

  /**
   * Every query is filtered by ownership, and there is no code path that reads
   * a design without going through here — which is what makes "you cannot see
   * someone else's card" a property of the service rather than of remembering.
   */
  private scope(requester: Requester): FilterQuery<DesignDocument> {
    if (requester.userId) {
      return { owner: new Types.ObjectId(requester.userId) };
    }
    if (requester.guestId) {
      return { owner: null, guestId: requester.guestId };
    }
    throw new UnauthorizedException("No identity on this request");
  }

  async list(requester: Requester): Promise<DesignSummary[]> {
    const designs = await this.designs
      .find(this.scope(requester))
      .select("-sides -size")
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return designs.map(toSummary);
  }

  async find(
    requester: Requester,
    documentId: string,
  ): Promise<CardDocumentResponse> {
    const design = await this.designs
      .findOne({ ...this.scope(requester), documentId })
      .lean()
      .exec();

    if (!design) throw new NotFoundException("Design not found");

    return toDocument(design);
  }

  async save(
    requester: Requester,
    documentId: string,
    input: SaveDesignInput,
  ): Promise<CardDocumentResponse> {
    const scope = this.scope(requester);
    const owned = { ...scope, documentId };

    const exists = await this.designs.exists(owned);
    if (!exists) await this.assertHasRoom(requester, scope);

    const saved = await this.designs
      .findOneAndUpdate(
        owned,
        {
          $set: { ...input, documentId },
          // Only on insert, so an existing design cannot change hands.
          $setOnInsert: {
            owner: requester.userId ? new Types.ObjectId(requester.userId) : null,
            guestId: requester.guestId ?? null,
          },
        },
        { new: true, upsert: true, lean: true },
      )
      .exec();

    // An upsert always returns a document; the driver's types cannot say so.
    if (!saved) {
      throw new InternalServerErrorException("Design could not be saved");
    }

    return toDocument(saved);
  }

  async remove(requester: Requester, documentId: string) {
    const result = await this.designs
      .deleteOne({ ...this.scope(requester), documentId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException("Design not found");
    }

    return { deleted: true };
  }

  /**
   * Hands a browser's designs to the account it just signed into.
   *
   * Callers treat a failure here as survivable — losing a guest design is bad,
   * but refusing the sign-in over it is worse, and the design is still in the
   * browser either way.
   */
  async claimForUser(userId: string, guestId?: string): Promise<number> {
    if (!guestId) return 0;

    const result = await this.designs
      .updateMany(
        { guestId, owner: null },
        { $set: { owner: new Types.ObjectId(userId), guestId: null } },
      )
      .exec();

    if (result.modifiedCount > 0) {
      this.logger.log(`Claimed ${result.modifiedCount} design(s) for ${userId}`);
    }

    return result.modifiedCount;
  }

  private async assertHasRoom(
    requester: Requester,
    scope: FilterQuery<DesignDocument>,
  ): Promise<void> {
    const limit = requester.userId
      ? MAX_DESIGNS_PER_USER
      : MAX_DESIGNS_PER_GUEST;

    const count = await this.designs.countDocuments(scope).exec();
    if (count >= limit) {
      throw new ForbiddenException(
        requester.userId
          ? `You can keep up to ${limit} designs`
          : `Sign in to keep more than ${limit} designs`,
      );
    }
  }
}
