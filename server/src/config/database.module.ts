import { Module, type DynamicModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { env } from "./env";

/**
 * Mongo is still optional.
 *
 * Without MONGODB_URI the API starts and serves the bundled catalogue, which
 * is what the editor relies on today. A URI that is set but unreachable now
 * fails the boot instead of quietly serving nothing: a database you configured
 * and cannot reach is a fault, not a degraded mode.
 *
 * This goes away when accounts land — from then on persistence is required.
 */
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: env.MONGODB_URI
        ? [
            MongooseModule.forRoot(env.MONGODB_URI, {
              serverSelectionTimeoutMS: 5000,
            }),
          ]
        : [],
    };
  }
}
