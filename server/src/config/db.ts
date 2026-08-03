import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let connected = false;

/**
 * Connecting is best-effort: the MVP has no required persistence, so a missing
 * or unreachable Mongo must not stop the API from serving bundled templates.
 */
export async function connectDatabase(): Promise<boolean> {
  if (!env.MONGODB_URI) {
    logger.warn("MONGODB_URI not set — running without persistence");
    return false;
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    connected = true;
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection failed — continuing without persistence", error);
  }

  return connected;
}

export const isDatabaseConnected = () => connected;

export async function disconnectDatabase(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}
