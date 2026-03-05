import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AnalyticsModule } from "./analytics/analytics.module";
import { CommonModule } from "./common/common.module";

@Module({
  imports: [AnalyticsModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
