import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { AdminOnly } from "../../../common/decorators/admin-only.decorator";
import {
  CurrentUser,
  type AuthUser,
} from "../../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../common/zod-validation.pipe";
import {
  createTemplateSchema,
  listTemplatesSchema,
  slugParamSchema,
  updateTemplateSchema,
  type CreateTemplateInput,
  type ListTemplatesQuery,
  type UpdateTemplateInput,
} from "./admin-templates.dto";
import { AdminTemplatesService } from "./admin-templates.service";

const slugPipe = new ZodValidationPipe(slugParamSchema);

/**
 * Template management, drafts included. Templates are addressed by slug —
 * the same key the public catalogue and editor deep links use.
 */
@AdminOnly()
@Controller("admin/templates")
export class AdminTemplatesController {
  constructor(private readonly templates: AdminTemplatesService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listTemplatesSchema)) query: ListTemplatesQuery,
  ) {
    return this.templates.list(query);
  }

  @Get(":slug")
  findOne(@Param("slug", slugPipe) slug: string) {
    return this.templates.findOne(slug);
  }

  @Post()
  create(
    @CurrentUser() admin: AuthUser,
    @Body(new ZodValidationPipe(createTemplateSchema)) body: CreateTemplateInput,
  ) {
    return this.templates.create(admin.userId, body);
  }

  /** Partial update; `{ published: true }` is how a draft goes live. */
  @Patch(":slug")
  update(
    @CurrentUser() admin: AuthUser,
    @Param("slug", slugPipe) slug: string,
    @Body(new ZodValidationPipe(updateTemplateSchema)) body: UpdateTemplateInput,
  ) {
    return this.templates.update(admin.userId, slug, body);
  }

  @Delete(":slug")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() admin: AuthUser, @Param("slug", slugPipe) slug: string) {
    return this.templates.remove(admin.userId, slug);
  }
}
