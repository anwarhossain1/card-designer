import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminAction, AdminActionSchema } from "./admin-action.schema";
import { AuditService } from "./audit.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminAction.name, schema: AdminActionSchema },
    ]),
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
