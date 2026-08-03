import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/http.js";
import { logger } from "../utils/logger.js";
import { isProduction } from "../config/env.js";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      details: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.status).json({
      message: error.message,
      details: error.details,
    });
    return;
  }

  logger.error("Unhandled error", error);
  res.status(500).json({
    message: isProduction ? "Internal server error" : String(error),
  });
};
