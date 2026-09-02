import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { Request, Response } from "express";
import {
  GUEST_COOKIE,
  REFRESH_COOKIE,
  clearGuestCookie,
  clearSessionCookies,
  setSessionCookies,
} from "../../common/cookies";
import { DesignsService } from "../designs/designs.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AuthService, type Session } from "./auth.service";
import { TokensService } from "./tokens.service";
import {
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type GoogleLoginInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "./auth.dto";

const readCookie = (request: Request, name: string): string | undefined =>
  (request.cookies as Record<string, string> | undefined)?.[name];

/**
 * Rate limited, and only here. These endpoints are the ones worth guessing at
 * or firing in bulk; the editor's autosave is not, and a limit shared with it
 * would have to be so loose as to be pointless.
 */
@UseGuards(ThrottlerGuard)
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokensService,
    private readonly designs: DesignsService,
  ) {}

  @Public()
  @Post("register")
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.register(body, request.get("user-agent"));
    await this.claimGuestWork(request, response, session.user.id);
    return this.respond(response, session);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.login(body, request.get("user-agent"));
    await this.claimGuestWork(request, response, session.user.id);
    return this.respond(response, session);
  }

  /** One endpoint for both sign-in and sign-up: Google vouches either way. */
  @Public()
  @Post("google")
  @HttpCode(HttpStatus.OK)
  async google(
    @Body(new ZodValidationPipe(googleLoginSchema)) body: GoogleLoginInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.loginWithGoogle(
      body.credential,
      request.get("user-agent"),
    );
    await this.claimGuestWork(request, response, session.user.id);
    return this.respond(response, session);
  }

  /**
   * Public because an expired access cookie is the normal reason to be here —
   * the refresh cookie is the credential, and the service verifies it.
   */
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.refresh(
      readCookie(request, REFRESH_COOKIE) ?? "",
      request.get("user-agent"),
    );
    return this.respond(response, session);
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(readCookie(request, REFRESH_COOKIE));
    clearSessionCookies(response);
    return { signedOut: true };
  }

  /** Tighter than the rest: each call sends mail to somebody else's inbox. */
  @Public()
  @Throttle({ default: { limit: 3, ttl: 600_000 } })
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema))
    body: ForgotPasswordInput,
  ) {
    await this.auth.requestPasswordReset(body.email, body.locale);
    // The same answer either way — see AuthService.requestPasswordReset.
    return { sent: true };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.resetPassword(body.token, body.password, body.locale);
    // Every session was just revoked, including whatever this browser held.
    clearSessionCookies(response);
    return { reset: true };
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.userId);
  }

  /**
   * Designs this browser made before signing in become the account's.
   *
   * The guest cookie is dropped either way: from here on the session is the
   * identity, and a leftover guest id would start a second, invisible pile of
   * work beside the account's. Never allowed to fail the sign-in — the design
   * is still in the browser, and refusing entry over it helps nobody.
   */
  private async claimGuestWork(
    request: Request,
    response: Response,
    userId: string,
  ): Promise<void> {
    const guestId = readCookie(request, GUEST_COOKIE);
    if (!guestId) return;

    try {
      await this.designs.claimForUser(userId, guestId);
    } catch (error) {
      this.logger.error(
        "Failed to claim guest designs",
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      clearGuestCookie(response);
    }
  }

  /** Tokens leave in cookies only; the body carries the user and nothing else. */
  private respond(response: Response, session: Session) {
    setSessionCookies(response, session, {
      accessMs: this.tokens.accessMs,
      refreshMs: this.tokens.refreshMs,
    });
    return session.user;
  }
}
