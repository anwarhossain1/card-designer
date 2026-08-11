import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Response } from "express";
import { ZodError } from "zod";
import { isProduction } from "../config/env";

/**
 * The error half of the response envelope: every failure leaves as
 * `{ message, details? }`, whatever threw it.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ZodError) {
      const flat = exception.flatten();
      /*
       * `fieldErrors` is empty when the schema is not an object — a path
       * parameter validated as a bare string, say — and the reason sits in
       * `formErrors` instead. Reporting only the first would answer "validation
       * failed" and then decline to say what.
       */
      const details =
        Object.keys(flat.fieldErrors).length > 0
          ? flat.fieldErrors
          : flat.formErrors;

      response.status(HttpStatus.BAD_REQUEST).json({
        message: "Validation failed",
        details,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      // Nest puts thrown objects here; lift `details` so callers keep seeing it.
      const details =
        typeof body === "object" && body !== null
          ? (body as { details?: unknown }).details
          : undefined;

      response.status(exception.getStatus()).json({
        message: exception.message,
        ...(details === undefined ? {} : { details }),
      });
      return;
    }

    this.logger.error(
      "Unhandled error",
      exception instanceof Error ? exception.stack : String(exception),
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: isProduction ? "Internal server error" : String(exception),
    });
  }
}
