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
} from "@nestjs/common";
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
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "./auth.dto";

const readCookie = (request: Request, name: string): string | undefined =>
  (request.cookies as Record<string, string> | undefined)?.[name];

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
