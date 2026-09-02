import { Injectable, type PipeTransform } from "@nestjs/common";
import type { ZodSchema } from "zod";

/**
 * Validates one handler argument against a zod schema.
 *
 * Nest's own convention is class-validator DTOs, but the project already
 * thinks in zod — env, template queries, the editor's own types — and one
 * schema library beats two. Failures throw ZodError, which the exception
 * filter already shapes into `{ message, details }`.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    return this.schema.parse(value);
  }
}
