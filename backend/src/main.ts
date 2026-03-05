import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception/http-exception.filter";
import { TimeoutInterceptor } from "./common/interceptors/timeout/timeout.interceptor";
import { WrapResponseInterceptor } from "./common/interceptors/wrap-response/wrap-response.interceptor";
import { SeedService } from "./analytics/seed.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: "http://localhost:5173" });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new WrapResponseInterceptor(), new TimeoutInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Game Analytics Dashboard")
    .setDescription("REST API for tracking and summarising game events")
    .setVersion("1.0")
    .build();

  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, swaggerConfig));

  app.get(SeedService).seed();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
