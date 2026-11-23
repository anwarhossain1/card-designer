import { z } from "zod";
import { USER_ROLES } from "../../users/user.schema";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f0-9]{24}$/i, "Not a user id");

export const listUsersSchema = z.object({
  /** Matches anywhere in the name or email, case-insensitive. */
  search: z.string().trim().min(1).max(80).optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>;

export const setStatusSchema = z.object({ active: z.boolean() });

export const setRoleSchema = z.object({ role: z.enum(USER_ROLES) });

export const sendResetSchema = z.object({
  /** The language the email goes out in. */
  locale: z.enum(["bn", "en"]).default("bn"),
});
