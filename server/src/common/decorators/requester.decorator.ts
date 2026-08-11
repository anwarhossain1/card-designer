import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { AuthUser } from "./current-user.decorator";

/**
 * Who a request belongs to: an account, or a browser that has not made one.
 *
 * Exactly one field is set. Designs are owned the same way, so the two cases
 * differ only in which column the query filters on — guests are not a lesser
 * path bolted on beside the real one.
 */
export interface Requester {
  userId?: string;
  guestId?: string;
}

export const CurrentRequester = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Requester => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser; guestId?: string }>();

    return request.user
      ? { userId: request.user.userId }
      : { guestId: request.guestId };
  },
);
