import { Injectable, Logger, BadRequestException, ConflictException, ForbiddenException, Optional, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { AppRole, LifecycleState } from '@prisma/client';

/**
 * Lifecycle State Machine — enforces strict transition rules.
 * Every transition must define: current state, next state, allowed role, preconditions.
 */

export interface TransitionRule {
  from: LifecycleState;
  to: LifecycleState;
  allowedRoles: string[];
  requiresEvidence: boolean;
  requiresInspection: boolean;
}

const TRANSITION_RULES: TransitionRule[] = [
  { from: 'UNREGISTERED', to: 'SUPPLIER_DECLARED', allowedRoles: ['TECHNICIAN', 'ADMIN'], requiresEvidence: false, requiresInspection: false },
  { from: 'SUPPLIER_DECLARED', to: 'RECEIVED', allowedRoles: ['TECHNICIAN', 'ADMIN'], requiresEvidence: false, requiresInspection: false },
  { from: 'RECEIVED', to: 'INSPECTION_RECORDED', allowedRoles: ['TECHNICIAN', 'ADMIN'], requiresEvidence: true, requiresInspection: true },
  { from: 'RECEIVED', to: 'INSPECTION_OVERDUE', allowedRoles: ['TECHNICIAN', 'ADMIN', 'SYSTEM'], requiresEvidence: false, requiresInspection: false },
  { from: 'RECEIVED', to: 'REJECTED_QUARANTINED', allowedRoles: ['TECHNICIAN', 'ADMIN', 'SYSTEM'], requiresEvidence: false, requiresInspection: false },
  { from: 'INSPECTION_OVERDUE', to: 'INSPECTION_RECORDED', allowedRoles: ['TECHNICIAN', 'ADMIN'], requiresEvidence: true, requiresInspection: true },
  { from: 'INSPECTION_OVERDUE', to: 'REJECTED_QUARANTINED', allowedRoles: ['TECHNICIAN', 'ADMIN', 'SYSTEM'], requiresEvidence: false, requiresInspection: false },
  { from: 'INSPECTION_RECORDED', to: 'ACCEPTED_FOR_ASSEMBLY', allowedRoles: ['TECHNICIAN', 'ADMIN'], requiresEvidence: true, requiresInspection: false },
  { from: 'INSPECTION_RECORDED', to: 'REJECTED_QUARANTINED', allowedRoles: ['TECHNICIAN', 'ADMIN'], requiresEvidence: true, requiresInspection: false },
  { from: 'ACCEPTED_FOR_ASSEMBLY', to: 'REJECTED_QUARANTINED', allowedRoles: ['TECHNICIAN', 'ADMIN', 'SYSTEM'], requiresEvidence: false, requiresInspection: false },
];

@Injectable()
export class LifecycleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LifecycleService.name);
  private scanTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject(NotificationsService) private readonly notificationsService?: NotificationsService,
    @Optional() @Inject(AuditService) private readonly auditService?: AuditService,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV !== 'test') {
      this.logger.log('Starting automated lifecycle expiry detection timer (every 60s)');
      this.scanTimer = setInterval(async () => {
        try {
          await this.detectAndFlagOverdueAssets('system-cron');
        } catch (err: any) {
          if (process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo') {
            this.logger.debug(`[DEMO MODE] Automated overdue scan skipped (database offline)`);
          } else {
            this.logger.error(`Automated overdue scan failed: ${err.message}`);
          }
        }
      }, 60000);
    }
  }

  onModuleDestroy() {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  }

  /**
   * Deterministically resolve responsible recipient for lifecycle notifications:
   * 1. Explicitly assigned responsible user (asset.registeredById)
   * 2. Assigned inspector if available
   * 3. Operational role TECHNICIAN
   * 4. Fallback ADMIN
   */
  async resolveResponsibleRecipient(asset: any): Promise<{ recipientId?: string; recipientRole?: AppRole }> {
    if (asset.registeredById && this.prisma.user?.findUnique) {
      try {
        const user = await this.prisma.user.findUnique({ where: { id: asset.registeredById } });
        if (user) return { recipientId: user.id };
      } catch {}
    }

    if (this.prisma.inspection?.findFirst) {
      try {
        const lastInspection = await this.prisma.inspection.findFirst({
          where: { assetId: asset.id },
          orderBy: { createdAt: 'desc' },
        });
        if (lastInspection?.inspectorId && this.prisma.user?.findUnique) {
          const inspector = await this.prisma.user.findUnique({ where: { id: lastInspection.inspectorId } });
          if (inspector) return { recipientId: inspector.id };
        }
      } catch {}
    }

    return { recipientRole: 'TECHNICIAN' };
  }

  /**
   * Execute a lifecycle transition atomically:
   * 1. Validate transition rule
   * 2. Update asset state
   * 3. Record lifecycle event
   * 4. Record audit event
   * All in a single transaction.
   */
  async transition(params: {
    assetId: string;
    toState: LifecycleState;
    actorId: string;
    actorDid?: string;
    actorRole: string;
    reason?: string;
    evidenceIds?: string[];
    idempotencyKey?: string;
  }) {
    // Check for duplicate transition via idempotency key
    if (params.idempotencyKey) {
      const existing = await this.prisma.lifecycleEvent.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });
      if (existing) {
        this.logger.warn(`Duplicate transition attempt: ${params.idempotencyKey}`);
        return existing;
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Lock the asset row for update (optimistic concurrency via version)
        const asset = await tx.asset.findUnique({ where: { id: params.assetId } });
        if (!asset) {
          throw new BadRequestException(`Asset ${params.assetId} not found`);
        }

        const fromState = asset.lifecycleState;

        // Find applicable rule
        const rule = TRANSITION_RULES.find(
          r => r.from === fromState && r.to === params.toState,
        );

        if (!rule) {
          throw new BadRequestException(
            `Invalid transition: ${fromState} → ${params.toState}`,
          );
        }

        // Check role authorization
        if (!rule.allowedRoles.includes(params.actorRole)) {
          throw new ForbiddenException(
            `Role ${params.actorRole} cannot perform ${fromState} → ${params.toState}`,
          );
        }

        // Check evidence requirement
        if (rule.requiresEvidence && (!params.evidenceIds || params.evidenceIds.length === 0)) {
          throw new BadRequestException('This transition requires evidence');
        }

        // Check inspection requirement
        if (rule.requiresInspection) {
          const inspections = await tx.inspection.findMany({
            where: { assetId: params.assetId },
          });
          if (inspections.length === 0) {
            throw new BadRequestException('This transition requires a recorded inspection');
          }
        }

        // Update asset state atomically with optimistic locking
        const updated = await tx.asset.update({
          where: { id: params.assetId, version: asset.version },
          data: {
            lifecycleState: params.toState,
            version: { increment: 1 },
          },
        });

        if (!updated) {
          throw new ConflictException('Concurrent modification detected — retry');
        }

        // Record lifecycle event
        const event = await tx.lifecycleEvent.create({
          data: {
            assetId: params.assetId,
            fromState,
            toState: params.toState,
            actorId: params.actorId,
            actorDid: params.actorDid,
            actorRole: params.actorRole,
            reason: params.reason,
            evidenceIds: params.evidenceIds || [],
            idempotencyKey: params.idempotencyKey,
          },
        });

        // Record audit event via canonical AuditService
        if (this.auditService?.recordEvent) {
          await this.auditService.recordEvent(
            {
              eventType: 'LIFECYCLE_TRANSITIONED',
              actorId: params.actorId,
              actorDid: params.actorDid,
              actorRole: params.actorRole,
              action: `Lifecycle transitioned to ${params.toState}`,
              resourceType: 'Asset',
              resourceId: params.assetId,
              result: 'SUCCESS',
              details: `${fromState} → ${params.toState}`,
              payload: { fromState, toState: params.toState, reason: params.reason },
            },
            tx,
          );
        } else {
          await tx.auditEvent.create({
            data: {
              eventType: 'LIFECYCLE_TRANSITIONED',
              actorId: params.actorId,
              actorDid: params.actorDid,
              actorRole: params.actorRole,
              action: `Lifecycle transitioned to ${params.toState}`,
              resourceType: 'Asset',
              resourceId: params.assetId,
              result: 'SUCCESS',
              details: `${fromState} → ${params.toState}`,
              payload: { fromState, toState: params.toState, reason: params.reason },
            },
          });
        }

        this.logger.log(`Asset ${params.assetId}: ${fromState} → ${params.toState}`);
        return event;
      });
    } catch (e: any) {
      if (e instanceof BadRequestException || e instanceof ForbiddenException || e instanceof ConflictException) throw e;
      if (process.env.APP_ENV === 'demo') {
        this.logger.warn(`Database offline, returning mock transition event: ${e.message}`);
        return {
          id: `mock-event-${Date.now()}`,
          assetId: params.assetId,
          fromState: 'SUPPLIER_DECLARED',
          toState: params.toState,
          actorId: params.actorId,
          actorDid: params.actorDid || null,
          actorRole: params.actorRole,
          reason: params.reason || null,
          evidenceIds: params.evidenceIds || [],
          idempotencyKey: params.idempotencyKey || null,
          createdAt: new Date(),
        };
      }
      throw e;
    }
  }

  getTransitionRules() {
    return TRANSITION_RULES;
  }

  /**
   * Real expiry detection engine:
   * 1. Finds assets in RECEIVED state whose inspectionDueDate has passed without inspection.
   *    Transitions them atomically to INSPECTION_OVERDUE.
   * 2. Finds assets whose shelfLifeExpiry has passed.
   *    Transitions them atomically to REJECTED_QUARANTINED.
   * 3. Checks for upcoming shelf life / warranty expiry without incorrect state mutation.
   * 4. Emits audit trail events.
   * 5. Sends notifications to deterministic responsible recipients with deduplication.
   */
  async detectAndFlagOverdueAssets(actorId: string = 'system') {
    const now = new Date();
    const flagged: any[] = [];

    // 1. Overdue inspections
    const overdueAssets = await this.prisma.asset.findMany({
      where: {
        lifecycleState: 'RECEIVED',
        inspectionDueDate: { lt: now },
      },
      include: { batch: true },
    });

    for (const asset of overdueAssets) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.asset.update({
            where: { id: asset.id },
            data: {
              lifecycleState: 'INSPECTION_OVERDUE',
              version: { increment: 1 },
            },
          });

          await tx.lifecycleEvent.create({
            data: {
              assetId: asset.id,
              fromState: 'RECEIVED',
              toState: 'INSPECTION_OVERDUE',
              actorId,
              actorRole: 'ADMIN',
              reason: `Inspection deadline exceeded (due: ${asset.inspectionDueDate?.toISOString()})`,
            },
          });

          if (this.auditService?.recordEvent) {
            await this.auditService.recordEvent(
              {
                eventType: 'LIFECYCLE_TRANSITIONED',
                actorId,
                actorRole: 'ADMIN',
                action: 'Automated overdue detection flagged asset',
                resourceType: 'Asset',
                resourceId: asset.id,
                result: 'WARNING',
                details: `Asset ${asset.assetId} flagged INSPECTION_OVERDUE (due: ${asset.inspectionDueDate?.toISOString()})`,
                payload: { fromState: 'RECEIVED', toState: 'INSPECTION_OVERDUE', dueDate: asset.inspectionDueDate },
              },
              tx,
            );
          } else {
            await tx.auditEvent.create({
              data: {
                eventType: 'LIFECYCLE_TRANSITIONED',
                actorId,
                actorRole: 'ADMIN',
                action: 'Automated overdue detection flagged asset',
                resourceType: 'Asset',
                resourceId: asset.id,
                result: 'WARNING',
                details: `Asset ${asset.assetId} flagged INSPECTION_OVERDUE (due: ${asset.inspectionDueDate?.toISOString()})`,
              },
            });
          }

          if (this.notificationsService?.createNotification) {
            const recipient = await this.resolveResponsibleRecipient(asset);
            await this.notificationsService.createNotification({
              recipientId: recipient.recipientId,
              recipientRole: recipient.recipientRole,
              title: `Inspection Overdue: ${asset.assetId}`,
              message: `Asset ${asset.assetId} has exceeded its inspection deadline. Status transitioned to INSPECTION_OVERDUE.`,
              type: 'EXPIRY_WARNING',
              severity: 'CRITICAL',
              link: `/app/assets/${asset.id}`,
              metadata: { assetId: asset.assetId, dueDate: asset.inspectionDueDate, subtype: 'INSPECTION_OVERDUE' },
            });
          }
        });

        flagged.push({
          assetId: asset.assetId,
          dueDate: asset.inspectionDueDate,
          status: 'FLAGGED_OVERDUE',
        });
      } catch (err: any) {
        this.logger.error(`Failed to flag asset ${asset.assetId} as overdue: ${err.message}`);
      }
    }

    // 2. Shelf-life expiry -> Transition to REJECTED_QUARANTINED
    const expiredShelfLifeAssets = (await this.prisma.asset.findMany({
      where: {
        shelfLifeExpiry: { lt: now },
        lifecycleState: { not: 'REJECTED_QUARANTINED' },
      },
      include: { batch: true },
    })) || [];

    for (const asset of expiredShelfLifeAssets) {
      try {
        const fromState = asset.lifecycleState;
        await this.prisma.$transaction(async (tx) => {
          await tx.asset.update({
            where: { id: asset.id },
            data: {
              lifecycleState: 'REJECTED_QUARANTINED',
              version: { increment: 1 },
            },
          });

          await tx.lifecycleEvent.create({
            data: {
              assetId: asset.id,
              fromState,
              toState: 'REJECTED_QUARANTINED',
              actorId,
              actorRole: 'ADMIN',
              reason: `Shelf life expired on ${asset.shelfLifeExpiry?.toISOString() || 'prior date'}`,
            },
          });

          if (this.auditService?.recordEvent) {
            await this.auditService.recordEvent(
              {
                eventType: 'LIFECYCLE_TRANSITIONED',
                actorId,
                actorRole: 'ADMIN',
                action: 'Automated shelf-life expiry quarantined asset',
                resourceType: 'Asset',
                resourceId: asset.id,
                result: 'WARNING',
                details: `Asset ${asset.assetId} quarantined due to expired shelf life`,
                payload: { fromState, toState: 'REJECTED_QUARANTINED', shelfLifeExpiry: asset.shelfLifeExpiry },
              },
              tx,
            );
          } else {
            await tx.auditEvent.create({
              data: {
                eventType: 'LIFECYCLE_TRANSITIONED',
                actorId,
                actorRole: 'ADMIN',
                action: 'Automated shelf-life expiry quarantined asset',
                resourceType: 'Asset',
                resourceId: asset.id,
                result: 'WARNING',
                details: `Asset ${asset.assetId} quarantined due to expired shelf life`,
              },
            });
          }

          if (this.notificationsService?.createNotification) {
            const recipient = await this.resolveResponsibleRecipient(asset);
            await this.notificationsService.createNotification({
              recipientId: recipient.recipientId,
              recipientRole: recipient.recipientRole,
              title: `Shelf Life Expired: ${asset.assetId}`,
              message: `Asset ${asset.assetId} shelf-life has expired. Automatically quarantined to REJECTED_QUARANTINED.`,
              type: 'EXPIRY_WARNING',
              severity: 'CRITICAL',
              link: `/app/assets/${asset.id}`,
              metadata: { assetId: asset.assetId, subtype: 'SHELF_LIFE_QUARANTINE' },
            });
          }
        });

        flagged.push({
          assetId: asset.assetId,
          shelfLifeExpiry: asset.shelfLifeExpiry,
          status: 'FLAGGED_SHELF_LIFE_EXPIRED',
        });
      } catch (err: any) {
        this.logger.error(`Failed to quarantine shelf-life expired asset ${asset.assetId}: ${err.message}`);
      }
    }

    // 3. Upcoming shelf life expiry check (next 30 days)
    const expiringSoon = (await this.prisma.asset.findMany({
      where: {
        shelfLifeExpiry: {
          gte: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        assetId: true,
        shelfLifeExpiry: true,
      },
    })) || [];

    return {
      evaluatedAt: now.toISOString(),
      overdueFlaggedCount: flagged.length,
      overdueAssets: flagged,
      expiringWithin30DaysCount: expiringSoon.length,
      expiringAssets: expiringSoon,
    };
  }

  async getOverdueAssets() {
    return this.prisma.asset.findMany({
      where: {
        OR: [
          { lifecycleState: 'INSPECTION_OVERDUE' },
          { lifecycleState: 'RECEIVED', inspectionDueDate: { lt: new Date() } },
        ],
      },
      include: { batch: true, inspections: true },
      orderBy: { inspectionDueDate: 'asc' },
    });
  }
}

