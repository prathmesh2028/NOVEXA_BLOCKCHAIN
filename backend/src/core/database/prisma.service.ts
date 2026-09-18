import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL');
    } catch (err: any) {
      this.logger.error(`PostgreSQL connection failed: ${err.message}`);
      // In production/staging, do not silently swallow DB connection failures
      if (process.env.APP_ENV === 'production' || process.env.APP_ENV === 'staging') {
        throw err;
      } else {
        this.logger.warn('Running without database connection (Development/Demo mode)');
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL');
  }
}
