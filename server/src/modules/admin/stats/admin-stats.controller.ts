import { Controller, Get } from "@nestjs/common";
import { AdminOnly } from "../../../common/decorators/admin-only.decorator";
import { AdminStatsService } from "./admin-stats.service";

@AdminOnly()
@Controller("admin/stats")
export class AdminStatsController {
  constructor(private readonly stats: AdminStatsService) {}

  @Get()
  overview() {
    return this.stats.overview();
  }
}
