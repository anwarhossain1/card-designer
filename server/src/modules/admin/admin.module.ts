import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { UsersModule } from "../users/users.module";
import { AdminController } from "./admin.controller";

/** UsersModule is required here: AdminGuard reads the role from it. */
@Module({
  imports: [UsersModule, AuditModule],
  controllers: [AdminController],
})
export class AdminModule {}
