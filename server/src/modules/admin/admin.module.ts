import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { Design, DesignSchema } from "../designs/design.schema";
import { Template, TemplateSchema } from "../templates/template.schema";
import { User, UserSchema } from "../users/user.schema";
import { UsersModule } from "../users/users.module";
import { AdminController } from "./admin.controller";
import { AdminStatsController } from "./stats/admin-stats.controller";
import { AdminStatsService } from "./stats/admin-stats.service";
import { AdminTemplatesController } from "./templates/admin-templates.controller";
import { AdminTemplatesService } from "./templates/admin-templates.service";
import { AdminUsersController } from "./users/admin-users.controller";
import { AdminUsersService } from "./users/admin-users.service";

/**
 * The admin API under /api/admin. Every controller here carries @AdminOnly().
 *
 * It reads the users, designs and templates collections directly rather than
 * through their modules' services: admin queries (drafts, deactivated
 * accounts, everyone's counts) are exactly what those services exist to keep
 * out of ordinary requests. UsersModule is still required — AdminGuard reads
 * the role through it.
 */
@Module({
  imports: [
    UsersModule,
    AuthModule,
    AuditModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Design.name, schema: DesignSchema },
      { name: Template.name, schema: TemplateSchema },
    ]),
  ],
  controllers: [
    AdminController,
    AdminUsersController,
    AdminTemplatesController,
    AdminStatsController,
  ],
  providers: [AdminUsersService, AdminTemplatesService, AdminStatsService],
})
export class AdminModule {}
