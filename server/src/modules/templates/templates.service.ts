import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Template, type TemplateDocument } from "./template.schema";

export interface ListTemplatesQuery {
  category?: string;
  search?: string;
}

/**
 * The catalogue still ships with the client bundle, so an empty collection
 * here is a normal state rather than a fault.
 */
@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name)
    private readonly templates: Model<TemplateDocument>,
  ) {}

  list(query: ListTemplatesQuery) {
    const filter: Record<string, unknown> = { published: true };
    if (query.category) filter.category = query.category;
    if (query.search) filter.$text = { $search: query.search };

    return this.templates.find(filter).sort({ createdAt: -1 }).lean();
  }

  async findBySlug(slug: string) {
    const template = await this.templates
      .findOne({ slug, published: true })
      .lean();

    if (!template) throw new NotFoundException("Template not found");

    return template;
  }
}
