import { z } from "zod";

/**
 * Password floor is length only, deliberately. Composition rules push people
 * towards "Password1!" and no further; length is what actually costs an
 * attacker anything.
 */
const password = z.string().min(8).max(128);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
