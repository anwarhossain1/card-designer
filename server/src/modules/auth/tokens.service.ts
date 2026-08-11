import { createHash, randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";
import { env } from "../../config/env";

/**
 * `ms` types this as a template literal, which a plain env string cannot
 * satisfy. `durationToMs` parses the same value with a regex at construction,
 * so an unusable duration fails the boot rather than reaching here.
 */
const asExpiry = (value: string) => value as JwtSignOptions["expiresIn"];

export interface AccessPayload {
  sub: string;
  role: string;
}

export interface RefreshPayload {
  sub: string;
  ver: number;
  /**
   * Makes every refresh token unique.
   *
   * Without it the payload is just `{ sub, ver }` plus a whole-second `iat`,
   * so two refreshes inside the same second sign byte-identical tokens —
   * rotation would swap a token for itself and the one it was meant to retire
   * would go on working.
   */
  jti: string;
}

/** Milliseconds for a "15m" / "7d" style duration, for cookie maxAge. */
export function durationToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) throw new Error(`Unsupported duration: ${value}`);

  const amount = Number(match[1]);
  const unit = match[2] as "s" | "m" | "h" | "d";
  const scale = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * scale[unit];
}

@Injectable()
export class TokensService {
  constructor(private readonly jwt: JwtService) {}

  readonly accessMs = durationToMs(env.ACCESS_TOKEN_TTL);
  readonly refreshMs = durationToMs(env.REFRESH_TOKEN_TTL);

  signAccess(payload: AccessPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: env.ACCESS_TOKEN_SECRET,
      expiresIn: asExpiry(env.ACCESS_TOKEN_TTL),
    });
  }

  signRefresh(payload: Omit<RefreshPayload, "jti">): Promise<string> {
    return this.jwt.signAsync(
      { ...payload, jti: randomUUID() },
      {
        secret: env.REFRESH_TOKEN_SECRET,
        expiresIn: asExpiry(env.REFRESH_TOKEN_TTL),
      },
    );
  }

  verifyRefresh(token: string): Promise<RefreshPayload> {
    return this.jwt.verifyAsync<RefreshPayload>(token, {
      secret: env.REFRESH_TOKEN_SECRET,
    });
  }

  /**
   * What gets stored, so the database never holds a usable token. Plain
   * SHA-256 rather than bcrypt: the input is already 256 bits of unguessable
   * JWT, so there is nothing for a slow hash to defend against, and refresh
   * happens often enough that the cost would be felt.
   */
  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
