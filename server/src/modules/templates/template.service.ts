import { isDatabaseConnected } from "../../config/db.js";
import { AppError } from "../../utils/http.js";
import { TemplateModel } from "./template.model.js";

export interface ListTemplatesQuery {
  category?: string;
  search?: string;
}

/**
 * The MVP ships its template catalogue with the client bundle, so these calls
 * return an empty catalogue when no database is configured instead of failing.
 */
export async function listTemplates(query: ListTemplatesQuery) {
  if (!isDatabaseConnected()) return [];

  const filter: Record<string, unknown> = { published: true };
  if (query.category) filter.category = query.category;
  if (query.search) filter.$text = { $search: query.search };

  return TemplateModel.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getTemplateBySlug(slug: string) {
  if (!isDatabaseConnected()) throw AppError.notFound("Template not found");

  const template = await TemplateModel.findOne({ slug, published: true }).lean();
  if (!template) throw AppError.notFound("Template not found");

  return template;
}
