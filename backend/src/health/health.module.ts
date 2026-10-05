import { Module } from '@nestjs/common';
import { HealthController, RootController } from './health.controller';
import { PrismaService } from '../core/database/prisma.service';

@Module({
  controllers: [RootController, HealthController],
  providers: [PrismaService],
})
export class HealthModule {}
