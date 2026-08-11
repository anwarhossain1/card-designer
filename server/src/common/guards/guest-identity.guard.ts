import { randomUUID } from "node:crypto";
import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { GUEST_COOKIE, setGuestCookie } from "../cookies";
import type { AuthUser } from "../decorators/current-user.decorator";

/**
 * Guarantees the request has an identity, inventing a guest one if needed.
 *
 * A guard rather than middleware because middleware runs before guards do, so
 * `request.user` would not exist yet and every signed-in request would look
 * anonymous. Placed on a controller, this runs after the global session guard
 * and can therefore tell the two apart.
 *
 * It never refuses a request: its job is to answer "who is this", and "a
 * browser I have not met before" is a valid answer.
 */
@Injectable()
export class GuestIdentityGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<
      Request & { user?: AuthUser; guestId?: string }
    >();

    // A session is the better identity; do not hand out a second one.
    if (request.user) return true;

    const existing = (request.cookies as Record<string, string> | undefined)?.[
      GUEST_COOKIE
    ];

    const guestId = existing ?? randomUUID();
    if (!existing) setGuestCookie(http.getResponse<Response>(), guestId);

    request.guestId = guestId;
    return true;
  }
}
