import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TechnicalRecordsService {
  private readonly logger = new Logger(TechnicalRecordsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listTechnicalRecords(params: {
    assetId?: string;
    recordType?: string;
    page?: number;
    page_size?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.assetId) where.assetId = params.assetId;
    if (params.recordType) where.recordType = params.recordType;

    try {
      const [records, total] = await Promise.all([
        this.prisma.technicalRecord.findMany({
          where,
          include: { asset: { select: { assetId: true, type: true, model: true } } },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.technicalRecord.count({ where }),
      ]);

      return {
        items: records.map((r) => ({
          id: r.id,
          asset_id: r.asset.assetId,
          asset_type: r.asset.type,
          asset_model: r.asset.model,
          record_type: r.recordType,
          data: r.data,
          classification: r.classification,
          created_at: r.createdAt.toISOString(),
          updated_at: r.updatedAt.toISOString(),
        })),
        total,
        page,
        page_size: pageSize,
        has_next: skip + pageSize < total,
      };
    } catch (e: any) {
      this.logger.error(`Database failure in listTechnicalRecords: ${e.message}`, e.stack);
      throw e;
    }
  }

  async getTechnicalRecord(id: string) {
    try {
      const record = await this.prisma.technicalRecord.findUnique({
        where: { id },
        include: { asset: { select: { assetId: true, type: true, model: true, serialNumber: true } } },
      });

      if (!record) {
        throw new NotFoundException(`Technical record ${id} not found`);
      }

      return {
        id: record.id,
        asset_id: record.asset.assetId,
        asset_type: record.asset.type,
        asset_model: record.asset.model,
        asset_serial: record.asset.serialNumber,
        record_type: record.recordType,
        data: record.data,
        classification: record.classification,
        created_at: record.createdAt.toISOString(),
        updated_at: record.updatedAt.toISOString(),
      };
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      this.logger.error(`Database failure in getTechnicalRecord: ${e.message}`, e.stack);
      throw e;
    }
  }

  async createTechnicalRecord(data: {
    assetId: string;
    recordType: string;
    data: any;
    classification?: string;
    actorId?: string;
    actorName?: string;
  }) {
    try {
      // Find asset by assetId or UUID
      const asset = await this.prisma.asset.findFirst({
        where: {
          OR: [{ id: data.assetId }, { assetId: data.assetId }],
        },
      });

      if (!asset) {
        throw new NotFoundException(`Asset ${data.assetId} not found`);
      }

      const record = await this.prisma.technicalRecord.create({
        data: {
          assetId: asset.id,
          recordType: data.recordType,
          data: data.data,
          classification: (data.classification as any) || 'INTERNAL',
        },
        include: { asset: { select: { assetId: true, type: true, model: true } } },
      });

      await this.auditService.recordEvent({
        eventType: 'TECHNICAL_RECORD_CREATED',
        actorId: data.actorId,
        actorName: data.actorName,
        action: `Technical record created for asset ${asset.assetId}`,
        resourceType: 'TechnicalRecord',
        resourceId: record.id,
        result: 'SUCCESS',
        details: `Type: ${data.recordType}`,
      });

      this.logger.log(`Technical record created for asset ${asset.assetId}`);

      return {
        id: record.id,
        asset_id: record.asset.assetId,
        asset_type: record.asset.type,
        asset_model: record.asset.model,
        record_type: record.recordType,
        data: record.data,
        classification: record.classification,
        created_at: record.createdAt.toISOString(),
        updated_at: record.updatedAt.toISOString(),
      };
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      this.logger.error(`Database failure in createTechnicalRecord: ${e.message}`, e.stack);
      throw e;
    }
  }
}
