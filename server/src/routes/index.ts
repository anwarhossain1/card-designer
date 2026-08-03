import { Router } from "express";
import { healthRouter } from "../modules/health/health.routes.js";
import { templateRouter } from "../modules/templates/template.routes.js";

/**
 * API surface. Future modules (projects, orders, users, teams) register here;
 * each lives in its own folder under modules/.
 */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/templates", templateRouter);
