import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  /** Required since accounts landed — sessions and users need persistence. */
  MONGODB_URI: z.string().min(1),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  /*
   * Separate secrets, so a leaked access secret cannot mint refresh tokens.
   * 32 chars is the floor for HS256 to be worth the name.
   */
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  /** Where password-reset links point; the API never serves that page. */
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM_NAME: z.string().default("CardCraft"),
});

const withMailCheck = schema.refine(
  (value) =>
    value.NODE_ENV !== "production" || Boolean(value.SMTP_USER && value.SMTP_PASS),
  {
    /*
     * Without a transport the app falls back to logging the message, which is
     * fine while developing and unacceptable in production: a reset link
     * printed to a server log is both undeliverable and a secret in the wrong
     * place. Refuse to start rather than fail quietly on the first request.
     */
    message: "SMTP_USER and SMTP_PASS are required in production",
    path: ["SMTP_USER"],
  },
);

const parsed = withMailCheck.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/**
 * Validated eagerly at import rather than through ConfigModule.
 *
 * Module `imports` arrays are evaluated when the decorator runs — before any
 * provider, ConfigService included, could have been resolved. Reading a
 * validated constant sidesteps that ordering entirely.
 */
export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
