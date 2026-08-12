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

/** The language the app was showing, so the email arrives in it. */
const locale = z.enum(["bn", "en"]).default("bn");

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  locale,
});

export const resetPasswordSchema = z.object({
  /** 32 random bytes as hex; length is checked before any lookup. */
  token: z.string().trim().length(64),
  password,
  locale,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
