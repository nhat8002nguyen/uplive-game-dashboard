import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { SeedService } from "./seed.service";

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, SeedService],
  exports: [AnalyticsService, SeedService],
})
export class AnalyticsModule {}
