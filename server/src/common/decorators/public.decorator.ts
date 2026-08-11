import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC = "auth:public";

/**
 * Opts a route out of the global JwtAuthGuard.
 *
 * Authentication is on by default and switched off per route, never the other
 * way round: forgetting this decorator makes an endpoint unreachable, which is
 * a bug you find immediately, while forgetting to add a guard would silently
 * publish it.
 */
export const Public = () => SetMetadata(IS_PUBLIC, true);
