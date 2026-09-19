import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Canonical serialization for hash chaining.
   * SHA256(canonical_event + previous_hash)
   */
  private computeEventHash(event: any, previousHash: string): string {
    const canonical = JSON.stringify({
      eventType: event.eventType,
      actorDid: event.actorDid,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      result: event.result,
      timestamp: event.createdAt,
    });
    return crypto.createHash('sha256').update(canonical + previousHash).digest('hex');
  }

  /**
   * Append an audit event with hash chaining.
   * Accepts an optional Prisma transaction client to preserve atomicity.
   * Normal APIs must not update or delete audit history.
   */
  async recordEvent(
    data: {
      eventType: string;
      actorId?: string;
      actorDid?: string;
      actorRole?: string;
      actorName?: string;
      action: string;
      resourceType?: string;
      resourceId?: string;
      result?: string;
      details?: string;
      payload?: any;
      requestId?: string;
      blockchainTxHash?: string;
      classification?: any;
    },
    client?: any,
  ) {
    const db = client || this.prisma;

    // Get previous hash for chaining
    const lastEvent = await db.auditEvent.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { payloadHash: true },
    });
    const previousHash = lastEvent?.payloadHash || '0'.repeat(64);

    // Compute canonical payload hash
    const canonicalPayload = JSON.stringify({
      eventType: data.eventType,
      actorId: data.actorId,
      actorDid: data.actorDid,
      actorRole: data.actorRole,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      result: data.result || 'SUCCESS',
      details: data.details,
      payload: data.payload,
      requestId: data.requestId,
      blockchainTxHash: data.blockchainTxHash,
      previousHash,
    });
    const payloadHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');

    const event = await db.auditEvent.create({
      data: {
        eventType: data.eventType,
        actorId: data.actorId,
        actorDid: data.actorDid,
        actorRole: data.actorRole,
        actorName: data.actorName,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        result: data.result || 'SUCCESS',
        details: data.details,
        payload: data.payload,
        payloadHash,
        previousHash,
        requestId: data.requestId,
        blockchainTxHash: data.blockchainTxHash,
        classification: data.classification || 'INTERNAL',
      },
    });

    return event;
  }

  async listEvents(params: {
    resource_id?: string;
    event_type?: string;
    actor_role?: string;
    page?: number;
    page_size?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.resource_id) where.resourceId = params.resource_id;
    if (params.event_type) where.eventType = params.event_type;
    if (params.actor_role) where.actorRole = params.actor_role;

    let events: any[] = [];
    let total = 0;

    try {
      const [dbEvents, dbTotal] = await Promise.all([
        this.prisma.auditEvent.findMany({
          where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        }),
        this.prisma.auditEvent.count({ where }),
      ]);
      events = dbEvents;
      total = dbTotal;
    } catch (e: any) {
      if (process.env.APP_ENV === 'demo') {
        const fallback = (await import('../../core/common/fallback-data')).FALLBACK_AUDIT_EVENTS;
        return {
          items: fallback,
          total: fallback.length,
          page,
          page_size: pageSize,
          has_next: false,
        };
      }
      throw e;
    }

    return {
      items: events.map(e => ({
        id: e.id,
        event_type: e.eventType,
        actor_did: e.actorDid,
        actor_role: e.actorRole,
        actor_name: e.actorName,
        action: e.action,
        resource_type: e.resourceType,
        resource_id: e.resourceId,
        timestamp: e.createdAt.toISOString(),
        result: e.result,
        details: e.details,
        blockchain_tx_hash: e.blockchainTxHash,
      })),
      total, page, page_size: pageSize,
      has_next: skip + pageSize < total,
    };
  }

  /**
   * Verify hash chain integrity
   */
  async verifyChain(limit: number = 100): Promise<{ valid: boolean; checked: number; brokenAt?: string }> {
    try {
      const events = await this.prisma.auditEvent.findMany({
        orderBy: { createdAt: 'asc' },
        take: limit,
      });

      if (events.length === 0) {
        return { valid: true, checked: 0 };
      }

      let previousHash = '0'.repeat(64);
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (!event.payloadHash || !event.previousHash || event.previousHash !== previousHash) {
          return { valid: false, checked: i, brokenAt: event.id };
        }
        previousHash = event.payloadHash;
      }

      return { valid: true, checked: events.length };
    } catch (e: any) {
      this.logger.error(`Chain verification error: ${e.message}`);
      throw e;
    }
  }
}
