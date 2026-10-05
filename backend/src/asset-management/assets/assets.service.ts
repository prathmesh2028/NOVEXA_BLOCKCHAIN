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
    if (!user) return;
    // Allow SYSTEM_ADMIN, AUDITOR, and QUALITY_INSPECTOR to access all assets
    if (user.roles.includes('SYSTEM_ADMIN') || user.roles.includes('AUDITOR') || user.roles.includes('QUALITY_INSPECTOR')) return;
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

    if (params.user && !params.user.roles.includes('SYSTEM_ADMIN') && !params.user.roles.includes('AUDITOR') && !params.user.roles.includes('QUALITY_INSPECTOR')) {
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
        asset = await this.prisma.asset.findFirst({
          where: {
            OR: [
              { serialNumber: id },
              { batchRefId: id },
              { batch: { batchId: id } },
            ],
          },
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
      throw e;
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
      throw e;
    }
  }


  /**
   * Eligible Assets:
   * Assets in ACCEPTED_FOR_ASSEMBLY state with at least one integrity-verified evidence item.
   * These are the pool from which QUALITY_INSPECTOR can initiate certification.
   */
  async getEligibleAssets(params: { page?: number; page_size?: number; user?: any } = {}) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    try {
      const where: any = {
        lifecycleState: 'ACCEPTED_FOR_ASSEMBLY',
        certifications: { none: {} },
        certStatus: { notIn: ['CONFIRMED', 'PENDING'] },
        evidence: { some: { integrityVerified: true } },
      };

      if (params.user && !params.user.roles.includes('SYSTEM_ADMIN') && !params.user.roles.includes('AUDITOR') && !params.user.roles.includes('QUALITY_INSPECTOR')) {
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

      return {
        items: dbAssets.map((a: any) => ({
          ...this.mapAsset(a),
          verified_evidence_count: a.evidence.filter((e: any) => e.integrityVerified).length,
          total_evidence_count: a.evidence.length,
          eligible_reason: 'ACCEPTED_FOR_ASSEMBLY with verified evidence',
        })),
        total: dbTotal,
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
      throw e;
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
