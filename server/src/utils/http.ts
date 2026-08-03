import type { NextFunction, Request, RequestHandler, Response } from "express";

export class AppError extends Error {
  constructor(
    message: string,
    readonly status = 500,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, details);
  }
}

/** Forwards rejected promises to the error middleware. */
export const asyncHandler =
  <T extends RequestHandler>(handler: T): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };

/** Single response envelope so clients can rely on `{ data }` / `{ message }`. */
export const sendData = <T>(res: Response, data: T, status = 200) =>
  res.status(status).json({ data });
