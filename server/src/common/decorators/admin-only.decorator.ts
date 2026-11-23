import { applyDecorators, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../guards/admin.guard";

/**
 * Restricts a controller or route to active admins.
 *
 * Put it on the controller rather than on each route, so a route added later
 * is admin-only without anyone remembering to say so — the same default the
 * global session guard sets for authentication.
 */
export const AdminOnly = () => applyDecorators(UseGuards(AdminGuard));
