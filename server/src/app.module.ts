import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { DatabaseModule } from "./config/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { TemplatesModule } from "./modules/templates/templates.module";
import { UsersModule } from "./modules/users/users.module";

/**
 * API surface. Future modules (projects, orders, payments) register here;
 * each lives in its own folder under modules/.
 *
 * JwtAuthGuard is global, so every route added from here on is authenticated
 * unless it carries @Public(). Forgetting the decorator breaks the endpoint
 * loudly; forgetting a guard would have published it silently.
 */
@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({}),
    UsersModule,
    AuthModule,
    HealthModule,
    TemplatesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
