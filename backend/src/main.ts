import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './core/config/config.service';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Demo mode warning
  if (config.isDemoMode) {
    logger.warn('⚠️  KAVACHTRUST DEMO MODE ENABLED');
    logger.warn('⚠️  DEMO AUTHENTICATION IS NOT SUITABLE FOR PRODUCTION');
    logger.warn('⚠️  Use NODE_ENV=production or APP_ENV=production for production deployment');
  }

  // Security
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS - Explicit allowlist from environment
  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // Global prefix — root path excluded so Render health-check (GET /) returns 200
  app.setGlobalPrefix(config.apiPrefix, { exclude: ['/'] });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  if (config.isDevelopment) {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const swaggerConfig = new DocumentBuilder()
      .setTitle('KavachTrust API')
      .setDescription('BEL Defence Asset Trust — Backend V2 API')
      .setVersion('2.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger docs available at /docs');
  }

  const port = config.port;
  await app.listen(port);
  logger.log(`KavachTrust Backend V2 running on http://localhost:${port}`);
  logger.log(`API prefix: ${config.apiPrefix}`);
  logger.log(`Environment: ${config.nodeEnv}`);
  logger.log(`CORS origins: ${config.corsOrigins.join(', ')}`);
}

bootstrap();
