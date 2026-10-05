import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'kavachtrust-api', version: '2.0.0' };
  }

  @Get('readiness')
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'connected' };
    } catch (e: any) {
      return { status: 'not_ready', database: e.message };
    }
  }

  @Get('health/worker')
  async workerHealth() {
    try {
      const [pending, failed, completed, processing] = await Promise.all([
        this.prisma.outboxEvent.count({ where: { status: 'PENDING' } }),
        this.prisma.outboxEvent.count({ where: { status: 'FAILED' } }),
        this.prisma.outboxEvent.count({ where: { status: 'COMPLETED' } }),
        this.prisma.outboxEvent.count({ where: { status: 'PROCESSING' } }),
      ]);

      const recentFailed = await this.prisma.outboxEvent.findMany({
        where: { status: 'FAILED' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          eventType: true,
          status: true,
          lastError: true,
          attemptCount: true,
          updatedAt: true,
        },
      });

      const blockchainPending = await this.prisma.blockchainTransaction.count({
        where: { status: { in: ['PENDING', 'SUBMITTED', 'MINED'] } },
      });

      return {
        status: 'ok',
        outbox: {
          pending,
          failed,
          completed,
          processing,
          recentFailed: recentFailed.map(e => ({
            id: e.id,
            eventType: e.eventType,
            lastError: e.lastError,
            attemptCount: e.attemptCount,
            updatedAt: e.updatedAt,
          })),
        },
        blockchain: {
          pendingTransactions: blockchainPending,
        },
      };
    } catch (e: any) {
      return {
        status: 'error',
        error: e.message,
      };
    }
  }
}
