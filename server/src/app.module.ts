import { Module } from "@nestjs/common";
import { DatabaseModule } from "./config/database.module";
import { HealthModule } from "./modules/health/health.module";
import { TemplatesModule } from "./modules/templates/templates.module";

/**
 * API surface. Future modules (projects, orders, users, teams) register here;
 * each lives in its own folder under modules/.
 */
@Module({
  imports: [DatabaseModule.forRoot(), HealthModule, TemplatesModule],
})
export class AppModule {}
