import { Controller, Get, NotFoundException } from "@nestjs/common";
import { AdminOnly } from "../../common/decorators/admin-only.decorator";
import {
  CurrentUser,
  type AuthUser,
} from "../../common/decorators/current-user.decorator";
import { toPublicUser, UsersService } from "../users/users.service";

/**
 * The admin API. @AdminOnly() sits on the class so every route added here is
 * admin-only by default.
 */
@AdminOnly()
@Controller("admin")
export class AdminController {
  constructor(private readonly users: UsersService) {}

  /**
   * The signed-in admin. Answers 403 for anyone else, which makes it the
   * server-side answer to "may this browser see the admin pages?".
   */
  @Get("session")
  async session(@CurrentUser() user: AuthUser) {
    const account = await this.users.findById(user.userId);
    if (!account) throw new NotFoundException("Account not found");
    return toPublicUser(account);
  }
}
