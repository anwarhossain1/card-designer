import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DesignsModule } from "../designs/designs.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokensService } from "./tokens.service";

/**
 * JwtModule is registered without a secret on purpose: access and refresh
 * tokens are signed with different ones, so every call passes its own.
 */
@Module({
  imports: [UsersModule, DesignsModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, TokensService],
  exports: [TokensService],
})
export class AuthModule {}
