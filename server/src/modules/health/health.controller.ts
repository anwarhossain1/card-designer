import { Controller, Get } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection } from "mongoose";
import { Public } from "../../common/decorators/public.decorator";

const CONNECTED = 1;

@Public()
@Controller("health")
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  check() {
    return {
      status: "ok",
      uptime: Math.round(process.uptime()),
      database: this.connection.readyState === CONNECTED ? "connected" : "down",
    };
  }
}
