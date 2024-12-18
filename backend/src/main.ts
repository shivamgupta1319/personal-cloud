import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { LoggingService } from "./services/logging.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const loggingService = app.get(LoggingService);

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // Log all requests
  app.use((req, res, next) => {
    loggingService.log(`${req.method} ${req.originalUrl} - ${req.ip}`, "HTTP");
    next();
  });

  // Global error handling
  app.useGlobalFilters();

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  loggingService.log(`Server started on port ${port}`, "Bootstrap");
}

bootstrap().catch((err) => {
  new Logger("Bootstrap").error("Failed to start application", err.stack);
});
