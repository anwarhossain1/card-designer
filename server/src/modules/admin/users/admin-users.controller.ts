import {
  Body,
  Controller,
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
  listUsersSchema,
  objectIdSchema,
  sendResetSchema,
  setRoleSchema,
  setStatusSchema,
  type ListUsersQuery,
} from "./admin-users.dto";
import { AdminUsersService } from "./admin-users.service";

const idPipe = new ZodValidationPipe(objectIdSchema);

@AdminOnly()
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listUsersSchema)) query: ListUsersQuery) {
    return this.users.list(query);
  }

  @Get(":id")
  detail(@Param("id", idPipe) id: string) {
    return this.users.detail(id);
  }

  /** `{ active: false }` deactivates and signs the account out everywhere. */
  @Patch(":id/status")
  setStatus(
    @CurrentUser() admin: AuthUser,
    @Param("id", idPipe) id: string,
    @Body(new ZodValidationPipe(setStatusSchema)) body: { active: boolean },
  ) {
    return this.users.setActive(admin.userId, id, body.active);
  }

  @Patch(":id/role")
  setRole(
    @CurrentUser() admin: AuthUser,
    @Param("id", idPipe) id: string,
    @Body(new ZodValidationPipe(setRoleSchema)) body: { role: "user" | "admin" },
  ) {
    return this.users.setRole(admin.userId, id, body.role);
  }

  @Post(":id/password-reset")
  @HttpCode(HttpStatus.ACCEPTED)
  async sendPasswordReset(
    @CurrentUser() admin: AuthUser,
    @Param("id", idPipe) id: string,
    @Body(new ZodValidationPipe(sendResetSchema)) body: { locale: "bn" | "en" },
  ) {
    await this.users.sendPasswordReset(admin.userId, id, body.locale);
    return { sent: true };
  }
}
