import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { env } from "../../config/env";
import { Template, TemplateSchema } from "./template.schema";
import { TemplatesController } from "./templates.controller";
import { TemplatesService } from "./templates.service";

@Module({
  // Registering the model without a connection would fail to resolve, so the
  // feature is only wired up when there is a database to wire it to.
  imports: env.MONGODB_URI
    ? [
        MongooseModule.forFeature([
          { name: Template.name, schema: TemplateSchema },
        ]),
      ]
    : [],
  controllers: [TemplatesController],
  providers: [TemplatesService],
})
export class TemplatesModule {}
