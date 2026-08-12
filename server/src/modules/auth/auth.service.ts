import { randomBytes } from "node:crypto";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import { env } from "../../config/env";
import { MailService } from "../mail/mail.service";
import {
  passwordChangedEmail,
  passwordResetEmail,
  type MailLocale,
} from "../mail/templates";
import {
  UsersService,
  toPublicUser,
  type PublicUser,
} from "../users/users.service";
import type { UserDocument } from "../users/user.schema";
import { TokensService } from "./tokens.service";
import type { LoginInput, RegisterInput } from "./auth.dto";

/**
 * A real bcrypt hash of nothing in particular. Comparing against it when the
 * email is unknown keeps a failed login the same cost as a wrong password, so
 * response time stops revealing which addresses have accounts.
 */
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.uCVdD5ZoUJ4SmVX5FiZ0Rv0KLZ0j5Xq";

/** Short enough that a link left in an inbox is not a standing key. */
const RESET_TTL_MINUTES = 15;

export interface Session {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokensService,
    private readonly mail: MailService,
  ) {}

  async register(input: RegisterInput, userAgent?: string): Promise<Session> {
    const user = await this.users.create(input);
    return this.issue(user, userAgent);
  }

  async login(input: LoginInput, userAgent?: string): Promise<Session> {
    const user = await this.users.findByEmailWithPassword(input.email);

    // Always compare, even with no user, so both paths take the same time.
    const matches = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !matches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.isActive) {
      throw new ForbiddenException("This account has been suspended");
    }

    return this.issue(user, userAgent);
  }

  /**
   * Rotation, not reuse: the presented token is swapped for a new one in the
   * same update. A token that is not found was already rotated or revoked, so
   * it buys nothing — which is what makes a stolen refresh cookie a
   * time-limited problem rather than a permanent one.
   */
  async refresh(token: string, userAgent?: string): Promise<Session> {
    let payload;
    try {
      payload = await this.tokens.verifyRefresh(token);
    } catch {
      throw new UnauthorizedException("Session expired");
    }

    const user = await this.users.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Session expired");
    }

    // Bumped on password change or "sign out everywhere".
    if (payload.ver !== user.tokenVersion) {
      throw new UnauthorizedException("Session expired");
    }

    const refreshToken = await this.tokens.signRefresh({
      sub: user._id.toString(),
      ver: user.tokenVersion,
    });

    const swapped = await this.users.replaceSession(
      user._id.toString(),
      this.tokens.hash(token),
      this.tokens.hash(refreshToken),
      userAgent,
    );

    if (!swapped) throw new UnauthorizedException("Session expired");

    const accessToken = await this.tokens.signAccess({
      sub: user._id.toString(),
      role: user.role,
    });

    return { user: toPublicUser(user), accessToken, refreshToken };
  }

  /** Best effort: a logout must succeed even with an unusable token. */
  async logout(token: string | undefined): Promise<void> {
    if (!token) return;

    try {
      const payload = await this.tokens.verifyRefresh(token);
      await this.users.removeSession(payload.sub, this.tokens.hash(token));
    } catch {
      // Expired or forged — there is no session to remove either way.
    }
  }

  /**
   * Always succeeds, whether or not the address has an account.
   *
   * Answering differently would turn this endpoint into a way to ask "does
   * this person use CardCraft" — and a password reset form is exactly where
   * someone would go to find out.
   */
  async requestPasswordReset(
    email: string,
    locale: MailLocale,
  ): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) return;

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60_000);

    await this.users.startPasswordReset(
      user._id.toString(),
      this.tokens.hash(token),
      expiresAt,
    );

    // Only the raw token leaves; what is stored cannot be used to reset.
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mail.send(
      user.email,
      passwordResetEmail(locale, {
        name: user.name,
        resetUrl,
        minutes: RESET_TTL_MINUTES,
      }),
    );
  }

  async resetPassword(
    token: string,
    password: string,
    locale: MailLocale,
  ): Promise<void> {
    const user = await this.users.findByResetTokenHash(this.tokens.hash(token));

    // One message for spent, forged and expired alike — which it was is not
    // information worth handing out.
    if (!user) {
      throw new BadRequestException("This reset link is invalid or has expired");
    }

    await this.users.completePasswordReset(
      user._id.toString(),
      await this.users.hashPassword(password),
    );

    // The reset already happened; a failed notice must not undo it.
    void this.mail
      .send(
        user.email,
        passwordChangedEmail(locale, {
          name: user.name,
          signInUrl: `${env.FRONTEND_URL}/sign-in`,
        }),
      )
      .catch((error: unknown) => {
        this.logger.error(
          "Failed to send password-changed notice",
          error instanceof Error ? error.stack : String(error),
        );
      });
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException("Not signed in");
    return toPublicUser(user);
  }

  private async issue(
    user: UserDocument,
    userAgent?: string,
  ): Promise<Session> {
    const userId = user._id.toString();

    const [accessToken, refreshToken] = await Promise.all([
      this.tokens.signAccess({ sub: userId, role: user.role }),
      this.tokens.signRefresh({ sub: userId, ver: user.tokenVersion }),
    ]);

    await this.users.addSession(
      userId,
      this.tokens.hash(refreshToken),
      userAgent,
    );

    return { user: toPublicUser(user), accessToken, refreshToken };
  }
}
