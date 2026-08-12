import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { createTransport, type Transporter } from "nodemailer";
import { env, isProduction } from "../../config/env";
import type { MailContent } from "./templates";

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  onModuleInit(): void {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      // Env validation already refuses this in production.
      this.logger.warn(
        "SMTP is not configured — emails will be written to this log instead of sent",
      );
      return;
    }

    this.transporter = createTransport({
      service: "gmail",
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }

  /**
   * Sends, or logs when there is no transport.
   *
   * Callers treat delivery as best effort: a password has already been reset
   * by the time its confirmation goes out, and a failed send must not undo
   * that or surface as an error the user can do nothing about.
   */
  async send(to: string, content: MailContent): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `[mail:${to}] ${content.subject}\n  ${this.linksIn(content.html).join("\n  ")}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: `"${env.MAIL_FROM_NAME}" <${env.SMTP_USER}>`,
      to,
      subject: content.subject,
      html: content.html,
    });
  }

  /**
   * The links are the only part worth logging — a wall of table markup helps
   * nobody, and the reset URL is what a developer actually needs to click.
   * Guarded on environment as well as transport: a secret in a production log
   * is a secret in the wrong place.
   */
  private linksIn(html: string): string[] {
    if (isProduction) return ["(links withheld outside development)"];
    return [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1] ?? "");
  }
}
