import type { Request, Response } from "express";
import { z } from "zod";
import { sendData } from "../../utils/http.js";
import { getTemplateBySlug, listTemplates } from "./template.service.js";
import { TEMPLATE_CATEGORIES } from "./template.model.js";

const listQuerySchema = z.object({
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  search: z.string().trim().min(1).max(80).optional(),
});

export async function listTemplatesHandler(req: Request, res: Response) {
  const query = listQuerySchema.parse(req.query);
  sendData(res, await listTemplates(query));
}

export async function getTemplateHandler(req: Request, res: Response) {
  const slug = z.string().min(1).parse(req.params.slug);
  sendData(res, await getTemplateBySlug(slug));
}
