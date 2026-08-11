import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import morgan from "morgan";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import { ResponseInterceptor } from "./common/response.interceptor";
import { env, isProduction } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());
  app.use(morgan(isProduction ? "combined" : "dev"));
  app.enableCors({
    origin: env.CORS_ORIGIN.split(",").map((value) => value.trim()),
  });

  // Scenes carry inlined images, so allow generous payloads.
  app.useBodyParser("json", { limit: "10mb" });

  app.setGlobalPrefix("api");
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  // Lets Nest close the Mongo connection on SIGINT/SIGTERM before exiting.
  app.enableShutdownHooks();

  await app.listen(env.PORT);
  Logger.log(`API listening on http://localhost:${env.PORT}/api`, "Bootstrap");
}

void bootstrap();
