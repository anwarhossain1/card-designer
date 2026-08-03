import { Router } from "express";
import { isDatabaseConnected } from "../../config/db.js";
import { sendData } from "../../utils/http.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  sendData(res, {
    status: "ok",
    uptime: Math.round(process.uptime()),
    database: isDatabaseConnected() ? "connected" : "disabled",
  });
});
