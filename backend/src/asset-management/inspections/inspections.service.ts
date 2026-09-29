import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LifecycleService } from '../lifecycle/lifecycle.service';

@Injectable()
export class InspectionsService {
  private readonly logger = new Logger(InspectionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly lifecycleService: LifecycleService,
  ) {}

  async recordInspection(data: {
    assetId: string;
    inspectorId?: string;
    inspectorDid?: string;
    result: string;
    notes?: string;
    evidenceIds?: string[];
  }) {
    try {
      // Validate asset exists and is in correct state
      const asset = await this.prisma.asset.findFirst({
        where: { OR: [{ id: data.assetId }, { assetId: data.assetId }] },
      });
      if (!asset) throw new BadRequestException(`Asset ${data.assetId} not found`);

      if (asset.lifecycleState !== 'RECEIVED' && asset.lifecycleState !== 'SUPPLIER_DECLARED') {
        throw new BadRequestException(`Asset must be in RECEIVED or SUPPLIER_DECLARED state for inspection. Current: ${asset.lifecycleState}`);
      }

      const inspection = await this.prisma.$transaction(async (tx) => {
        const insp = await tx.inspection.create({
          data: {
            assetId: asset.id,
            inspectorId: data.inspectorId,
            inspectorDid: data.inspectorDid,
            result: data.result,
            notes: data.notes,
            evidenceIds: data.evidenceIds || [],
          },
        });

        // Audit via canonical AuditService
        await this.auditService.recordEvent(
          {
            eventType: 'INSPECTION_RECORDED',
            actorId: data.inspectorId,
            actorDid: data.inspectorDid,
            action: `Inspection recorded: ${data.result}`,
            resourceType: 'Asset',
            resourceId: asset.id,
            result: data.result === 'FAIL' ? 'WARNING' : 'SUCCESS',
            details: data.notes || `Inspection result: ${data.result}`,
          },
          tx,
        );

        return insp;
      });

      return inspection;
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
      this.logger.error(`Database failure in recordInspection: ${e.message}`, e.stack);
      throw e;
    }
  }

  async decideInspection(data: {
    inspectionId: string;
    decision: 'ACCEPT' | 'REJECT';
    reason?: string;
    actorId: string;
    actorDid?: string;
    actorRole?: string;
  }) {
    try {
      const inspection = await this.prisma.inspection.findUnique({
        where: { id: data.inspectionId },
        include: { asset: true },
      });

      if (!inspection) {
        throw new NotFoundException(`Inspection ${data.inspectionId} not found`);
      }

      const asset = inspection.asset;

      // Determine target lifecycle state based on decision
      const targetState = data.decision === 'ACCEPT' 
        ? 'ACCEPTED_FOR_ASSEMBLY' 
        : 'REJECTED_QUARANTINED';

      // Validate that asset is in a state that allows this transition
      if (asset.lifecycleState !== 'RECEIVED' && asset.lifecycleState !== 'INSPECTION_RECORDED') {
        throw new BadRequestException(
          `Asset must be in RECEIVED or INSPECTION_RECORDED state for decision. Current: ${asset.lifecycleState}`,
        );
      }

      // Execute lifecycle transition
      await this.lifecycleService.transition({
        assetId: asset.id,
        toState: targetState,
        actorId: data.actorId,
        actorDid: data.actorDid,
        actorRole: data.actorRole || 'QUALITY_INSPECTOR',
        reason: data.reason || `Inspection decision: ${data.decision}`,
        idempotencyKey: `inspection-decision:${data.inspectionId}`,
      });

      // Update inspection with decision
      await this.prisma.inspection.update({
        where: { id: data.inspectionId },
        data: {
          notes: `${inspection.notes || ''}\n\nDecision: ${data.decision}. ${data.reason || ''}`.trim(),
        },
      });

      return {
        inspectionId: data.inspectionId,
        decision: data.decision,
        assetId: asset.assetId,
        newLifecycleState: targetState,
      };
    } catch (e: any) {
      if (e instanceof BadRequestException || e instanceof NotFoundException) throw e;
      this.logger.error(`Database failure in decideInspection: ${e.message}`, e.stack);
      throw e;
    }
  }

  async listInspections(assetId?: string) {
    const where: any = {};
    if (assetId) {
      const asset = await this.prisma.asset.findFirst({
        where: { OR: [{ id: assetId }, { assetId }] },
        select: { id: true },
      });
      where.assetId = asset ? asset.id : assetId;
    }

    try {
      const items = await this.prisma.inspection.findMany({
        where,
        include: { asset: true },
        orderBy: { createdAt: 'desc' },
      });
      return {
        items,
        total: items.length,
      };
    } catch (e: any) {
      this.logger.error(`Database failure in listInspections: ${e.message}`, e.stack);
      throw e;
    }
  }
}
