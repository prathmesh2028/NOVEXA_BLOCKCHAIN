import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private mapAsset(a: any) {
    return {
      id: a.id,
      asset_id: a.assetId,
      batch_id: a.batch?.batchId || a.batchRefId,
      type: a.type,
      model: a.model,
      serial_number: a.serialNumber,
      lifecycle_state: a.lifecycleState,
      verification_status: a.verificationStatus,
      evidence_count: a.evidenceCount,
      evidence_status: this.mapEvidenceStatus(a.evidenceStatus),
      cert_status: a.certStatus,
      cert_id: a.certId,
      supplier: a.supplier,
      description: a.description,
      registered_by_name: a.registeredByName,
      created_at: a.createdAt.toISOString(),
      updated_at: a.updatedAt.toISOString(),
    };
  }

  // Frontend uses Title Case for evidence status
  private mapEvidenceStatus(status: string): string {
    const map: Record<string, string> = {
      COMPLETE: 'Complete',
      PROCESSING: 'Processing',
      HASHING: 'Hashing',
      FAILED: 'Failed',
      INVALID: 'Invalid',
      DUPLICATE: 'Duplicate',
      UPLOADING: 'Uploading',
    };
    return map[status] || status;
  }

  async listAssets(params: {
    search?: string;
    lifecycle?: string;
    page?: number;
    page_size?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { assetId: { contains: params.search, mode: 'insensitive' } },
        { serialNumber: { contains: params.search, mode: 'insensitive' } },
        { type: { contains: params.search, mode: 'insensitive' } },
        { model: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.lifecycle) {
      where.lifecycleState = params.lifecycle;
    }

    let assets: any[] = [];
    let total = 0;

    try {
      const [dbAssets, dbTotal] = await Promise.all([
        this.prisma.asset.findMany({
          where,
          include: { batch: true },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.asset.count({ where }),
      ]);
      assets = dbAssets;
      total = dbTotal;
    } catch (e: any) {
      if (process.env.APP_ENV !== 'demo') throw e;
      const fallback = (await import('../../core/common/fallback-data')).FALLBACK_ASSETS;
      return {
        items: fallback.map(a => ({
          id: a.id,
          asset_id: a.id,
          batch_id: a.batchId,
          type: a.type,
          model: a.model,
          serial_number: a.serialNumber,
          lifecycle_state: a.lifecycle,
          verification_status: a.verification,
          evidence_count: a.evidenceCount,
          evidence_status: a.evidenceStatus,
          cert_status: a.certStatus,
          cert_id: a.certId,
          supplier: a.supplier,
          description: a.description,
          registered_by_name: a.registeredBy,
          created_at: a.registeredAt,
          updated_at: a.updatedAt,
        })),
        total: fallback.length,
        page,
        page_size: pageSize,
        has_next: false,
      };
    }

    return {
      items: assets.map(a => this.mapAsset(a)),
      total,
      page,
      page_size: pageSize,
      has_next: skip + pageSize < total,
    };
  }

  async getAsset(id: string) {
    try {
      let asset = await this.prisma.asset.findUnique({
        where: { id },
        include: { batch: true, evidence: true, inspections: true, lifecycleEvents: true },
      });

      if (!asset) {
        asset = await this.prisma.asset.findUnique({
          where: { assetId: id },
          include: { batch: true, evidence: true, inspections: true, lifecycleEvents: true },
        });
      }

      if (!asset) {
        throw new NotFoundException(`Asset ${id} not found`);
      }

      return this.mapAsset(asset);
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      if (process.env.APP_ENV !== 'demo') throw e;
      const fallback = (await import('../../core/common/fallback-data')).FALLBACK_ASSETS.find(a => a.id === id);
      if (fallback) {
        return {
          id: fallback.id,
          asset_id: fallback.id,
          batch_id: fallback.batchId,
          type: fallback.type,
          model: fallback.model,
          serial_number: fallback.serialNumber,
          lifecycle_state: fallback.lifecycle,
          verification_status: fallback.verification,
          evidence_count: fallback.evidenceCount,
          evidence_status: fallback.evidenceStatus,
          cert_status: fallback.certStatus,
          cert_id: fallback.certId,
          supplier: fallback.supplier,
          description: fallback.description,
          registered_by_name: fallback.registeredBy,
          created_at: fallback.registeredAt,
          updated_at: fallback.updatedAt,
        };
      }
      throw new NotFoundException(`Asset ${id} not found`);
    }
  }

  async createAsset(data: {
    assetId: string;
    batchId: string;
    type: string;
    model: string;
    serialNumber: string;
    supplier?: string;
    description?: string;
    registeredById?: string;
    registeredByName?: string;
  }) {
    try {
      // Find or create batch
      let batch = await this.prisma.batch.findUnique({ where: { batchId: data.batchId } });
      if (!batch) {
        batch = await this.prisma.batch.create({
          data: {
            batchId: data.batchId,
            supplier: data.supplier,
          },
        });
      }

      const asset = await this.prisma.asset.create({
        data: {
          assetId: data.assetId,
          batchRefId: batch.id,
          type: data.type,
          model: data.model,
          serialNumber: data.serialNumber,
          supplier: data.supplier,
          description: data.description,
          registeredById: data.registeredById,
          registeredByName: data.registeredByName,
          lifecycleState: 'SUPPLIER_DECLARED',
        },
        include: { batch: true },
      });

      await this.auditService.recordEvent({
        eventType: 'ASSET_REGISTERED',
        actorId: data.registeredById,
        actorName: data.registeredByName,
        action: `Asset registered — ${data.assetId}`,
        resourceType: 'Asset',
        resourceId: asset.id,
        result: 'SUCCESS',
        details: `Model: ${data.model} | Serial: ${data.serialNumber}`,
      });

      return this.mapAsset(asset);
    } catch (e: any) {
      if (process.env.APP_ENV !== 'demo') {
        throw e;
      }
      this.logger.warn('Database offline, returning mock created asset', e.message);
      // Mock return for when DB is down in demo mode
      return {
        id: `mock-asset-${Date.now()}`,
        asset_id: data.assetId,
        batch_id: data.batchId,
        type: data.type,
        model: data.model,
        serial_number: data.serialNumber,
        lifecycle_state: 'SUPPLIER_DECLARED',
        verification_status: 'PENDING',
        evidence_count: 0,
        evidence_status: 'Processing',
        cert_status: 'NOT_CERTIFIED',
        cert_id: null,
        supplier: data.supplier,
        description: data.description,
        registered_by_name: data.registeredByName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Eligible Assets:
   * Assets in ACCEPTED_FOR_ASSEMBLY state with at least one integrity-verified evidence item.
   * These are the pool from which NFT_CREATOR can initiate certification.
   */
  async getEligibleAssets(params: { page?: number; page_size?: number } = {}) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    try {
      const where: any = {
        lifecycleState: 'ACCEPTED_FOR_ASSEMBLY',
        certStatus: { not: 'CONFIRMED' }, // not already certified
      };

      const [dbAssets, dbTotal] = await Promise.all([
        this.prisma.asset.findMany({
          where,
          include: { batch: true, evidence: true },
          skip,
          take: pageSize,
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.asset.count({ where }),
      ]);

      // Only include assets with at least one integrity-verified evidence
      const eligible = dbAssets.filter(
        (a: any) => a.evidence && a.evidence.some((e: any) => e.integrityVerified),
      );

      return {
        items: eligible.map((a: any) => ({
          ...this.mapAsset(a),
          verified_evidence_count: a.evidence.filter((e: any) => e.integrityVerified).length,
          total_evidence_count: a.evidence.length,
          eligible_reason: 'ACCEPTED_FOR_ASSEMBLY with verified evidence',
        })),
        total: eligible.length,
        page,
        page_size: pageSize,
        has_next: skip + pageSize < dbTotal,
        eligibility_criteria: {
          lifecycle_state: 'ACCEPTED_FOR_ASSEMBLY',
          requires_verified_evidence: true,
          excludes_already_certified: true,
        },
      };
    } catch (e: any) {
      if (process.env.APP_ENV !== 'demo') throw e;
      // Fallback: filter fallback data
      const fallback = (await import('../../core/common/fallback-data')).FALLBACK_ASSETS;
      let eligible = fallback.filter(
        (a) => a.lifecycle === 'ACCEPTED_FOR_ASSEMBLY',
      );
      if (eligible.length === 0) {
        eligible = fallback.filter((a) => a.lifecycle === 'INSPECTION_RECORDED' || a.lifecycle === 'ACCEPTED_FOR_ASSEMBLY');
      }
      return {
        items: eligible.map((a) => ({
          id: a.id,
          asset_id: a.id,
          batch_id: a.batchId,
          type: a.type,
          model: a.model,
          serial_number: a.serialNumber,
          lifecycle_state: a.lifecycle,
          verification_status: a.verification,
          evidence_count: a.evidenceCount,
          evidence_status: a.evidenceStatus,
          cert_status: a.certStatus,
          cert_id: a.certId || null,
          supplier: a.supplier,
          description: a.description,
          registered_by_name: a.registeredBy,
          created_at: a.registeredAt,
          updated_at: a.updatedAt,
          verified_evidence_count: a.evidenceCount,
          total_evidence_count: a.evidenceCount,
          eligible_reason: 'ACCEPTED_FOR_ASSEMBLY with verified evidence',
        })),
        total: eligible.length,
        page,
        page_size: pageSize,
        has_next: false,
        eligibility_criteria: {
          lifecycle_state: 'ACCEPTED_FOR_ASSEMBLY',
          requires_verified_evidence: true,
          excludes_already_certified: true,
        },
      };
    }
  }
}
