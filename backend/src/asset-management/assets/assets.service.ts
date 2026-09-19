import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as QRCode from 'qrcode';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private getSupplierDomain(email?: string): string | null {
    if (!email) return null;
    const parts = email.split('@');
    return parts.length > 1 ? parts[1] : null;
  }

  private async enforceAssetAccess(asset: any, user: any) {
    if (!user || user.roles.includes('ADMIN') || user.roles.includes('AUDITOR')) return;
    if (!asset.registeredById) return;
    if (asset.registeredById === user.sub) return;

    const creator = await this.prisma.user.findUnique({ where: { id: asset.registeredById } });
    if (creator) {
      const creatorDomain = this.getSupplierDomain(creator.email);
      const userDomain = this.getSupplierDomain(user.email);
      if (creatorDomain && userDomain && creatorDomain !== userDomain) {
        throw new ForbiddenException('You do not have permission to access data from another supplier');
      }
    }
  }

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
    user?: any;
  }) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.user && !params.user.roles.includes('ADMIN') && !params.user.roles.includes('AUDITOR')) {
      const userDomain = this.getSupplierDomain(params.user.email);
      if (userDomain) {
        const usersInDomain = await this.prisma.user.findMany({
          where: { email: { endsWith: `@${userDomain}` } },
          select: { id: true },
        });
        where.registeredById = { in: usersInDomain.map(u => u.id) };
      }
    }

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
      let filtered = [...fallback];
      if (params.search) {
        const q = params.search.toLowerCase().trim();
        filtered = filtered.filter(a =>
          a.id.toLowerCase().includes(q) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(q)) ||
          (a.type && a.type.toLowerCase().includes(q)) ||
          (a.model && a.model.toLowerCase().includes(q)) ||
          (a.batchId && a.batchId.toLowerCase().includes(q)) ||
          (a.supplier && a.supplier.toLowerCase().includes(q))
        );
      }
      if (params.lifecycle && params.lifecycle !== 'ALL') {
        filtered = filtered.filter(a => a.lifecycle === params.lifecycle);
      }
      const totalCount = filtered.length;
      const paginated = filtered.slice(skip, skip + pageSize);
      return {
        items: paginated.map(a => ({
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
        total: totalCount,
        page,
        page_size: pageSize,
        has_next: skip + pageSize < totalCount,
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

  async getAsset(id: string, user?: any) {
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

      if (user) {
        await this.enforceAssetAccess(asset, user);
      }

      return this.mapAsset(asset);
    } catch (e: any) {
      if (e instanceof NotFoundException || e instanceof ForbiddenException) throw e;
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
  async getEligibleAssets(params: { page?: number; page_size?: number; user?: any } = {}) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    try {
      const where: any = {
        lifecycleState: 'ACCEPTED_FOR_ASSEMBLY',
        certStatus: { not: 'CONFIRMED' }, // not already certified
      };

      if (params.user && !params.user.roles.includes('ADMIN') && !params.user.roles.includes('AUDITOR')) {
        const userDomain = this.getSupplierDomain(params.user.email);
        if (userDomain) {
          const usersInDomain = await this.prisma.user.findMany({
            where: { email: { endsWith: `@${userDomain}` } },
            select: { id: true },
          });
          where.registeredById = { in: usersInDomain.map(u => u.id) };
        }
      }

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

  async getAssetQr(id: string, user?: any) {
    const asset = await this.getAsset(id, user);
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:8443'}/app/verification?id=${asset.asset_id || asset.id}`;
    const qrPayload = JSON.stringify({
      asset_id: asset.asset_id || asset.id,
      serial_number: asset.serial_number,
      batch_id: asset.batch_id,
      type: asset.type,
      model: asset.model,
      verification_url: verificationUrl,
      did: `did:kavachtrust:asset:${asset.asset_id || asset.id}`,
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: { dark: '#0284c7', light: '#ffffff' },
    });

    return {
      asset_id: asset.asset_id || asset.id,
      serial_number: asset.serial_number,
      type: asset.type,
      model: asset.model,
      verification_url: verificationUrl,
      qr_payload: qrPayload,
      qr_data_url: qrDataUrl,
    };
  }
}
