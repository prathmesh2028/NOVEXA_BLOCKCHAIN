import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InspectionsService {
  private readonly logger = new Logger(InspectionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
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
      const asset = await this.prisma.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) throw new BadRequestException(`Asset ${data.assetId} not found`);

      if (asset.lifecycleState !== 'RECEIVED' && asset.lifecycleState !== 'SUPPLIER_DECLARED') {
        throw new BadRequestException(`Asset must be in RECEIVED or SUPPLIER_DECLARED state for inspection. Current: ${asset.lifecycleState}`);
      }

      const inspection = await this.prisma.$transaction(async (tx) => {
        const insp = await tx.inspection.create({
          data: {
            assetId: data.assetId,
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
            resourceId: data.assetId,
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

  async listInspections(assetId?: string) {
    const where: any = {};
    if (assetId) where.assetId = assetId;

    try {
      const items = await this.prisma.inspection.findMany({
        where,
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
