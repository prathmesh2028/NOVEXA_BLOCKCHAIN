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

  const allowedOrigins = new Set(config.corsOrigins);
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Requests without an Origin header include health checks and server-to-server calls.
      if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ''))) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // Explicit root & health endpoints directly on Express to guarantee immediate 200 OK for Render health checks
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && typeof httpAdapter.getInstance === 'function') {
    const expressApp = httpAdapter.getInstance();
    const sendHealth = (_req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({ status: 'ok', service: 'kavachtrust-api', version: '2.0.0' }));
    };
    expressApp.get('/', sendHealth);
    expressApp.get('/health', sendHealth);
  }

  // Global prefix — root path and health excluded so Render health-check returns 200 immediately
  app.setGlobalPrefix(config.apiPrefix, { exclude: ['/', 'health'] });

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
  await app.listen(port, '0.0.0.0');
  logger.log(`KavachTrust Backend V2 running on port ${port} (0.0.0.0)`);
  logger.log(`API prefix: ${config.apiPrefix}`);
  logger.log(`Environment: ${config.nodeEnv}`);
  logger.log(`CORS origins: ${config.corsOrigins.join(', ')}`);
}

bootstrap();
