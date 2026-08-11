import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export interface AuthUser {
  userId: string;
  role: string;
}

/** The identity the guard resolved, or undefined on a `@Public()` route. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser | undefined =>
    context.switchToHttp().getRequest<Request & { user?: AuthUser }>().user,
);
