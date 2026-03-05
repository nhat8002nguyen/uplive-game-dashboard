import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { LoggingMiddleware } from "./middleware/logging/logging.middleware";

@Module({})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}
