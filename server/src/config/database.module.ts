import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { env } from "./env";

/**
 * Mongo became required when accounts landed: a session that cannot be stored
 * is not a session, so there is no useful degraded mode left to preserve.
 */
@Module({
  imports: [
    MongooseModule.forRoot(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    }),
  ],
})
export class DatabaseModule {}
