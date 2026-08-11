import type { CookieOptions, Response } from "express";
import { isProduction } from "../config/env";

export const ACCESS_COOKIE = "cc_access";
export const REFRESH_COOKIE = "cc_refresh";

/**
 * Session cookies.
 *
 * `sameSite: strict` is what carries the CSRF defence here — the browser will
 * not attach these to a request originating from another site at all. It works
 * because the app and the API share a registrable domain (localhost in dev,
 * one domain in production); split them across unrelated domains and this has
 * to become `none`, at which point a CSRF token is no longer optional.
 *
 * Clearing a cookie only works when the options match the ones it was set
 * with, so both paths go through here.
 */
const base: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  path: "/",
};

export function setSessionCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  ttl: { accessMs: number; refreshMs: number },
): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: ttl.accessMs,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: ttl.refreshMs,
  });
}

export function clearSessionCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
}
