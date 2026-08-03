import { Router } from "express";
import { asyncHandler } from "../../utils/http.js";
import {
  getTemplateHandler,
  listTemplatesHandler,
} from "./template.controller.js";

export const templateRouter = Router();

templateRouter.get("/", asyncHandler(listTemplatesHandler));
templateRouter.get("/:slug", asyncHandler(getTemplateHandler));
