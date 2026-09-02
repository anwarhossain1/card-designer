import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { ACCESS_COOKIE } from "../cookies";
import { IS_PUBLIC } from "../decorators/public.decorator";
import type { AuthUser } from "../decorators/current-user.decorator";
import { env } from "../../config/env";

interface AccessPayload {
  sub: string;
  role: string;
  ver: number;
}

/**
 * Registered globally, so every route is protected unless it says otherwise.
 *
 * The token is read from an httpOnly cookie, never a header — nothing in the
 * browser's JavaScript can reach it, so an XSS bug cannot walk away with a
 * session. The cost is that requests now carry ambient authority, which is
 * what the strict SameSite setting in cookies.ts is there to contain.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    const token = (request.cookies as Record<string, string> | undefined)?.[
      ACCESS_COOKIE
    ];

    if (!token) {
      if (isPublic) return true;
      throw new UnauthorizedException("Not signed in");
    }

    try {
      const payload = await this.jwt.verifyAsync<AccessPayload>(token, {
        secret: env.ACCESS_TOKEN_SECRET,
      });
      request.user = { userId: payload.sub, role: payload.role };
      return true;
    } catch {
      // A public route with a stale cookie is still a public route; it just
      // does not get an identity.
      if (isPublic) return true;
      throw new UnauthorizedException("Session expired");
    }
  }
}
