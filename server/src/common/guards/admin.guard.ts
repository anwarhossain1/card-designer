import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import type { Request } from "express";
import { UsersService } from "../../modules/users/users.service";
import type { AuthUser } from "../decorators/current-user.decorator";

/**
 * Lets a request through only if its account is an active admin *right now*.
 *
 * The access token carries a role, but that claim is up to ACCESS_TOKEN_TTL
 * old: an admin who was demoted or deactivated would keep their powers until
 * it expired. So the role is read from the database on every admin request.
 * Admin traffic is a handful of people clicking, not the editor autosaving,
 * so one lookup per call costs nothing worth saving.
 *
 * Runs after the global JwtAuthGuard, which has already put `request.user` in
 * place. A controller using it must import UsersModule.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly users: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    // Only reachable if an admin route was also marked @Public() by mistake.
    if (!request.user) throw new UnauthorizedException("Not signed in");

    const account = await this.users.findAccessById(request.user.userId);

    if (!account || !account.isActive || account.role !== "admin") {
      throw new ForbiddenException("Admin access required");
    }

    // Hand the handler the role as it stands, not as the token remembered it.
    request.user.role = account.role;
    return true;
  }
}
