import { Controller, Get, Optional } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection } from "mongoose";

const CONNECTED = 1;

@Controller("health")
export class HealthController {
  constructor(
    @Optional()
    @InjectConnection()
    private readonly connection?: Connection,
  ) {}

  @Get()
  check() {
    return {
      status: "ok",
      uptime: Math.round(process.uptime()),
      database:
        this.connection?.readyState === CONNECTED ? "connected" : "disabled",
    };
  }
}
