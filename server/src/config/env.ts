import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  /** Optional: the API serves bundled data when Mongo is unavailable. */
  MONGODB_URI: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/**
 * Validated eagerly at import rather than through ConfigModule.
 *
 * Whether Mongo is configured decides which modules are imported at all, and
 * a module's `imports` array is evaluated when its decorator runs — before any
 * provider, ConfigService included, could have been resolved. Reading a
 * validated constant sidesteps that ordering entirely.
 */
export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
