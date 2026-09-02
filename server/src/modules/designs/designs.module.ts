import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Design, DesignSchema } from "./design.schema";
import { DesignsController } from "./designs.controller";
import { DesignsService } from "./designs.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Design.name, schema: DesignSchema }]),
  ],
  controllers: [DesignsController],
  providers: [DesignsService],
  // AuthModule claims a guest's designs when they sign in.
  exports: [DesignsService],
})
export class DesignsModule {}
