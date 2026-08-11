import { Injectable, NotFoundException, Optional } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Template, type TemplateDocument } from "./template.schema";

export interface ListTemplatesQuery {
  category?: string;
  search?: string;
}

/**
 * The MVP ships its template catalogue with the client bundle, so these calls
 * return an empty catalogue when no database is configured instead of failing.
 *
 * The model is optional for that reason: with no MONGODB_URI the Mongoose
 * module is never imported, so there is nothing to inject.
 */
@Injectable()
export class TemplatesService {
  constructor(
    @Optional()
    @InjectModel(Template.name)
    private readonly templates?: Model<TemplateDocument>,
  ) {}

  async list(query: ListTemplatesQuery) {
    if (!this.templates) return [];

    const filter: Record<string, unknown> = { published: true };
    if (query.category) filter.category = query.category;
    if (query.search) filter.$text = { $search: query.search };

    return this.templates.find(filter).sort({ createdAt: -1 }).lean();
  }

  async findBySlug(slug: string) {
    const template = await this.templates
      ?.findOne({ slug, published: true })
      .lean();

    if (!template) throw new NotFoundException("Template not found");

    return template;
  }
}
