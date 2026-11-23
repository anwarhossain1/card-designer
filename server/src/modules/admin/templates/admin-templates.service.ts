import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { FilterQuery, Model } from "mongoose";
import { AuditService } from "../../audit/audit.service";
import {
  Template,
  type TemplateDocument,
} from "../../templates/template.schema";
import type {
  CreateTemplateInput,
  ListTemplatesQuery,
  UpdateTemplateInput,
} from "./admin-templates.dto";

/** The list leaves out scenes: they are the heavy part, and a grid needs none. */
const SUMMARY_FIELDS =
  "slug name category description palette tags fonts thumbnail published createdAt updatedAt";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

@Injectable()
export class AdminTemplatesService {
  constructor(
    @InjectModel(Template.name)
    private readonly templates: Model<TemplateDocument>,
    private readonly audit: AuditService,
  ) {}

  /**
   * Drafts included. Search is a plain substring match rather than the public
   * `$text` search: an admin looking for "corp" expects to find "Corporate".
   */
  list(query: ListTemplatesQuery) {
    const filter: FilterQuery<TemplateDocument> = {};
    if (query.status !== "all") filter.published = query.status === "published";
    if (query.category) filter.category = query.category;
    if (query.search) {
      const pattern = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [{ name: pattern }, { slug: pattern }, { tags: pattern }];
    }

    return this.templates
      .find(filter)
      .select(SUMMARY_FIELDS)
      .sort({ updatedAt: -1 })
      .lean();
  }

  async findOne(slug: string) {
    const template = await this.templates.findOne({ slug }).lean();
    if (!template) throw new NotFoundException("Template not found");
    return template;
  }

  async create(actorId: string, input: CreateTemplateInput) {
    try {
      const created = await this.templates.create(input);
      await this.record(actorId, "template.create", input.slug, {
        name: input.name,
        published: input.published,
      });
      return created.toObject();
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException("A template with this slug already exists");
      }
      throw error;
    }
  }

  async update(actorId: string, slug: string, input: UpdateTemplateInput) {
    const before = await this.templates
      .findOne({ slug })
      .select("published")
      .lean();
    if (!before) throw new NotFoundException("Template not found");

    const updated = await this.templates
      .findOneAndUpdate({ slug }, { $set: input }, { new: true })
      .lean();
    if (!updated) throw new NotFoundException("Template not found");

    // A publish or unpublish is the change people will look for in the log,
    // so it gets its own verb even when other fields changed with it.
    const publishChanged =
      input.published !== undefined && input.published !== before.published;
    const action = publishChanged
      ? input.published
        ? "template.publish"
        : "template.unpublish"
      : "template.update";

    await this.record(actorId, action, slug, {
      fields: Object.keys(input),
    });
    return updated;
  }

  /**
   * A hard delete. Saved designs only remember a template's slug as where
   * they started, never depend on it, so nothing breaks when it goes.
   */
  async remove(actorId: string, slug: string) {
    const deleted = await this.templates
      .findOneAndDelete({ slug })
      .select("name published")
      .lean();
    if (!deleted) throw new NotFoundException("Template not found");

    await this.record(actorId, "template.delete", slug, {
      name: deleted.name,
      wasPublished: deleted.published,
    });
  }

  private record(actorId: string, action: string, slug: string, details: object) {
    return this.audit.record({
      actorId,
      source: "api",
      action,
      target: { kind: "template", id: slug },
      details,
    });
  }
}
