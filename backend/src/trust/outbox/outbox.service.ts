import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Transactional Outbox — PostgreSQL-backed.
 * Business state mutation and outbox event must be committed in the SAME transaction.
 * Delivery semantics: AT-LEAST-ONCE.
 * Consumer idempotency is mandatory.
 */
@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an outbox event (must be called within a Prisma transaction).
   */
  async createEvent(tx: any, data: {
    eventType: string;
    payload: any;
    idempotencyKey: string;
  }) {
    return tx.outboxEvent.create({
      data: {
        eventType: data.eventType,
        payload: data.payload,
        idempotencyKey: data.idempotencyKey,
        status: 'PENDING',
      },
    });
  }

  /**
   * Claim pending events for processing.
   * Uses row-level locking to prevent duplicate claims.
   */
  async claimPendingEvents(workerId: string, limit: number = 10) {
    const now = new Date();

    const events = await this.prisma.outboxEvent.findMany({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        OR: [
          { nextAttemptAt: null },
          { nextAttemptAt: { lte: now } },
        ],
        attemptCount: { lt: 5 }, // max attempts
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    // Claim them
    const claimed = [];
    for (const event of events) {
      try {
        const updated = await this.prisma.outboxEvent.updateMany({
          where: {
            id: event.id,
            status: { in: ['PENDING', 'FAILED'] },
            claimedBy: null,
          },
          data: {
            status: 'CLAIMED',
            claimedBy: workerId,
            claimedAt: now,
          },
        });
        if (updated.count > 0) {
          claimed.push(event);
        }
      } catch (e) {
        // Skip — another worker claimed it
      }
    }

    return claimed;
  }

  async markCompleted(eventId: string) {
    await this.prisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  async markFailed(eventId: string, error: string) {
    const event = await this.prisma.outboxEvent.findUnique({ where: { id: eventId } });
    if (!event) return;

    const nextAttempt = event.attemptCount + 1;
    const backoffMs = Math.min(1000 * Math.pow(2, nextAttempt), 300000); // Max 5 min

    await this.prisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        status: nextAttempt >= event.maxAttempts ? 'TERMINAL' : 'FAILED',
        attemptCount: nextAttempt,
        lastError: error,
        nextAttemptAt: new Date(Date.now() + backoffMs),
        claimedBy: null,
        claimedAt: null,
      },
    });
  }
}
