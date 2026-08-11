import { Controller, Get, Param, Query } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { TEMPLATE_CATEGORIES } from "./template.schema";
import { TemplatesService } from "./templates.service";

const listQuerySchema = z.object({
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  search: z.string().trim().min(1).max(80).optional(),
});

type ListQuery = z.infer<typeof listQuerySchema>;

const slugSchema = z.string().min(1);

@Controller("templates")
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listQuerySchema)) query: ListQuery) {
    return this.templates.list(query);
  }

  @Get(":slug")
  findOne(@Param("slug", new ZodValidationPipe(slugSchema)) slug: string) {
    return this.templates.findBySlug(slug);
  }
}
