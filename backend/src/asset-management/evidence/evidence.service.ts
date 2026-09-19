import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { MinioService } from './minio.service';
import { AuditService } from '../audit/audit.service';
import * as crypto from 'crypto';

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly auditService: AuditService,
  ) {}

  private getSupplierDomain(email?: string): string | null {
    if (!email) return null;
    const parts = email.split('@');
    return parts.length > 1 ? parts[1] : null;
  }

  private async enforceAssetAccess(assetId: string, user: any) {
    if (!user || user.roles.includes('ADMIN') || user.roles.includes('AUDITOR')) return;
    const asset = await this.prisma.asset.findFirst({
      where: { OR: [{ id: assetId }, { assetId: assetId }] },
    });
    if (!asset || !asset.registeredById) return;
    if (asset.registeredById === user.sub) return;

    const creator = await this.prisma.user.findUnique({ where: { id: asset.registeredById } });
    if (creator) {
      const creatorDomain = this.getSupplierDomain(creator.email);
      const userDomain = this.getSupplierDomain(user.email);
      if (creatorDomain && userDomain && creatorDomain !== userDomain) {
        throw new ForbiddenException('You do not have permission to access evidence for another supplier');
      }
    }
  }

  private mapEvidence(e: any) {
    // Map DB enum to frontend Title Case
    const statusMap: Record<string, string> = {
      COMPLETE: 'Complete', PROCESSING: 'Processing', HASHING: 'Hashing',
      FAILED: 'Failed', INVALID: 'Invalid', DUPLICATE: 'Duplicate', UPLOADING: 'Uploading',
    };

    return {
      id: e.id,
      evidence_id: e.evidenceId,
      asset_id: e.assetId,
      filename: e.filename,
      type: e.type,
      mime_type: e.mimeType,
      size_kb: e.sizeKb,
      status: statusMap[e.status] || e.status,
      hash: e.hash,
      event: e.event,
      integrity_verified: e.integrityVerified,
      blockchain_tx: e.blockchainTx,
      created_at: e.createdAt.toISOString(),
    };
  }

  async listEvidence(params: {
    asset_id?: string;
    event_type?: string;
    page?: number;
    page_size?: number;
    user?: any;
  }) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.asset_id) where.assetId = params.asset_id;
    if (params.event_type) where.event = params.event_type;

    if (params.user && !params.user.roles.includes('ADMIN') && !params.user.roles.includes('AUDITOR')) {
      const userDomain = this.getSupplierDomain(params.user.email);
      if (userDomain) {
        const usersInDomain = await this.prisma.user.findMany({
          where: { email: { endsWith: `@${userDomain}` } },
          select: { id: true },
        });
        const assets = await this.prisma.asset.findMany({
          where: { registeredById: { in: usersInDomain.map(u => u.id) } },
          select: { id: true },
        });
        // If an asset filter is already provided, ensure it's in the allowed list
        if (params.asset_id) {
          if (!assets.some(a => a.id === params.asset_id)) {
             where.assetId = 'NOT_FOUND_NO_ACCESS'; 
          }
        } else {
          where.assetId = { in: assets.map(a => a.id) };
        }
      }
    }

    let evidence: any[] = [];
    let total = 0;

    try {
      const [dbEvidence, dbTotal] = await Promise.all([
        this.prisma.evidence.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.evidence.count({ where }),
      ]);
      evidence = dbEvidence;
      total = dbTotal;
    } catch (e: any) {
      if (process.env.APP_ENV === 'demo') {
        const fallback = (await import('../../core/common/fallback-data')).FALLBACK_EVIDENCE;
        return {
          items: fallback.map(ev => ({
            id: ev.id,
            evidence_id: ev.id,
            asset_id: ev.assetId,
            filename: ev.filename,
            type: ev.type,
            mime_type: ev.mimeType,
            size_kb: ev.sizeKb,
            status: ev.status,
            hash: ev.hash,
            event: ev.event,
            integrity_verified: ev.integrityVerified,
            blockchain_tx: ev.blockchainTx,
            created_at: ev.uploadedAt,
          })),
          total: fallback.length,
          page,
          page_size: pageSize,
          has_next: false,
        };
      }
      throw e;
    }

    return {
      items: evidence.map(e => this.mapEvidence(e)),
      total,
      page,
      page_size: pageSize,
      has_next: skip + pageSize < total,
    };
  }

  async getEvidence(id: string, user?: any) {
    try {
      let evidence = await this.prisma.evidence.findUnique({ where: { id } });
      if (!evidence) {
        evidence = await this.prisma.evidence.findUnique({ where: { evidenceId: id } });
      }
      if (!evidence) throw new NotFoundException(`Evidence ${id} not found`);
      
      if (user) {
        await this.enforceAssetAccess(evidence.assetId, user);
      }

      return this.mapEvidence(evidence);
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      if (process.env.APP_ENV === 'demo') {
        const fallback = (await import('../../core/common/fallback-data')).FALLBACK_EVIDENCE.find(ev => ev.id === id);
        if (fallback) {
          return {
            id: fallback.id,
            evidence_id: fallback.id,
            asset_id: fallback.assetId,
            filename: fallback.filename,
            type: fallback.type,
            mime_type: fallback.mimeType,
            size_kb: fallback.sizeKb,
            status: fallback.status,
            hash: fallback.hash,
            event: fallback.event,
            integrity_verified: fallback.integrityVerified,
            blockchain_tx: fallback.blockchainTx,
            created_at: fallback.uploadedAt,
          };
        }
      }
      throw e;
    }
  }

  /**
   * Compute SHA-256 hash of a buffer
   */
  computeHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Verify evidence integrity by re-hashing stored content
   */
  async verifyIntegrity(evidenceId: string, content: Buffer): Promise<{ valid: boolean; storedHash: string; computedHash: string }> {
    const evidence = await this.prisma.evidence.findUnique({ where: { id: evidenceId } });
    if (!evidence) throw new NotFoundException(`Evidence ${evidenceId} not found`);

    const computedHash = this.computeHash(content);
    const valid = computedHash === evidence.hash;

    return {
      valid,
      storedHash: evidence.hash,
      computedHash,
    };
  }

  /**
   * Record a new evidence item.
   * Hash is computed server-side from the provided content buffer.
   * Status is set to COMPLETE and integrityVerified = true on successful hash.
   */
  async uploadEvidence(data: {
    assetId: string;
    filename: string;
    type: string;
    mimeType: string;
    sizeKb: number;
    content: Buffer;
    event: string;
    uploadedById?: string;
    uploadedByName?: string;
    uploadedByRole?: string;
    uploadedByDid?: string;
  }) {
    const hash = this.computeHash(data.content);
    const evidenceId = `EVD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      // Verify asset exists
      const asset = await this.prisma.asset.findFirst({
        where: { OR: [{ id: data.assetId }, { assetId: data.assetId }] },
      });
      if (!asset) throw new NotFoundException(`Asset ${data.assetId} not found`);

      // Enforce access
      const uploaderUser = { sub: data.uploadedById, email: data.uploadedByName || '', roles: [data.uploadedByRole] }; // minimal mock user if full not passed
      if (data.uploadedById && data.uploadedByName) {
        await this.enforceAssetAccess(asset.id, uploaderUser);
      }

      // Upload to MinIO
      const objectName = `${asset.assetId}/${evidenceId}-${data.filename}`;
      const fileUrl = await this.minio.uploadFile(objectName, data.content, data.mimeType);

      let transactionResult;
      try {
        transactionResult = await this.prisma.$transaction(async (tx) => {
          const evidence = await tx.evidence.create({
            data: {
              evidenceId,
              assetId: asset.id,
              filename: data.filename,
              type: data.type,
              mimeType: data.mimeType,
              sizeKb: data.sizeKb,
              hash,
              objectKey: objectName,
              event: data.event,
              status: 'COMPLETE',
              integrityVerified: true,
              uploadedById: data.uploadedById,
              uploadedByName: data.uploadedByName,
              uploadedByRole: data.uploadedByRole,
            },
          });

          // Update asset evidence count
          await tx.asset.update({
            where: { id: asset.id },
            data: { evidenceCount: { increment: 1 } },
          });

          // Audit event using canonical AuditService
          await this.auditService.recordEvent(
            {
              eventType: 'EVIDENCE_UPLOADED',
              actorId: data.uploadedById,
              actorDid: data.uploadedByDid,
              actorName: data.uploadedByName,
              actorRole: data.uploadedByRole,
              action: `Evidence uploaded — ${data.filename}`,
              resourceType: 'Evidence',
              resourceId: evidence.id,
              result: 'SUCCESS',
              details: `SHA-256: ${hash.substring(0, 16)}... | Asset: ${asset.assetId}`,
              payload: {
                evidenceId,
                filename: data.filename,
                hash,
                objectKey: objectName,
                assetId: asset.assetId,
              },
            },
            tx,
          );

          this.logger.log(`Evidence ${evidence.id} uploaded for asset ${asset.assetId} — hash: ${hash.substring(0, 16)}...`);
          return this.mapEvidence(evidence);
        });
      } catch (txError: any) {
        this.logger.error(`Database transaction failed after MinIO upload. Compensating by deleting ${objectName}`);
        await this.minio.deleteFile(objectName);
        throw txError;
      }
      return transactionResult;
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      
      if (process.env.APP_ENV === 'demo') {
        this.logger.warn(`Database operation failed during evidence upload, generating fallback record: ${e.message}`);
        return {
          id: evidenceId,
          evidence_id: evidenceId,
          asset_id: data.assetId,
          filename: data.filename,
          type: data.type,
          mime_type: data.mimeType,
          size_kb: data.sizeKb,
          status: 'COMPLETE',
          hash,
          event: data.event,
          integrity_verified: true,
          blockchain_tx: null,
          created_at: new Date().toISOString(),
        };
      }
      
      this.logger.error(`Evidence upload failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * Batch integrity check for all evidence on an asset.
   * Re-reads stored hashes and returns a per-item integrity report.
   * In fallback mode: uses stored integrityVerified flag.
   */
  async getIntegrityReport(assetId: string, user?: any): Promise<{
    asset_id: string;
    total: number;
    verified: number;
    failed: number;
    items: any[];
    overall_integrity: 'VERIFIED' | 'PARTIAL' | 'FAILED' | 'NO_EVIDENCE';
  }> {
    if (user) {
      await this.enforceAssetAccess(assetId, user);
    }
    
    try {
      const evidence = await this.prisma.evidence.findMany({
        where: { assetId },
      });

      if (evidence.length === 0) {
        // Try by assetId string
        const asset = await this.prisma.asset.findFirst({
          where: { assetId },
          include: { evidence: true },
        });
        if (asset && asset.evidence.length > 0) {
          return this.buildIntegrityReport(asset.assetId, asset.evidence as any[]);
        }
        return { asset_id: assetId, total: 0, verified: 0, failed: 0, items: [], overall_integrity: 'NO_EVIDENCE' };
      }

      return this.buildIntegrityReport(assetId, evidence as any[]);
    } catch (e: any) {
      if (process.env.APP_ENV === 'demo') {
        const { FALLBACK_EVIDENCE } = await import('../../core/common/fallback-data');
        let items = FALLBACK_EVIDENCE.filter((ev) => ev.assetId === assetId);
        if (items.length === 0 && FALLBACK_EVIDENCE.length > 0) {
          items = FALLBACK_EVIDENCE.filter((ev) => ev.assetId === 'EF-2026-00421');
        }
        const verified = items.filter((ev) => ev.integrityVerified).length;
        const failed = items.filter((ev) => !ev.integrityVerified).length;
        return {
          asset_id: assetId,
          total: items.length,
          verified,
          failed,
          items: items.map((ev) => ({
            id: ev.id,
            filename: ev.filename,
            type: ev.type,
            stored_hash: ev.hash,
            integrity_verified: ev.integrityVerified,
            status: ev.integrityVerified ? 'VERIFIED' : 'FAILED',
            event: ev.event,
            uploaded_at: ev.uploadedAt,
          })),
          overall_integrity: items.length === 0 ? 'NO_EVIDENCE' : failed > 0 ? 'FAILED' : verified === items.length ? 'VERIFIED' : 'PARTIAL',
        };
      }
      throw e;
    }
  }

  private buildIntegrityReport(assetId: string, evidence: any[]) {
    const items = evidence.map((ev) => ({
      id: ev.id,
      filename: ev.filename,
      type: ev.type,
      stored_hash: ev.hash,
      integrity_verified: ev.integrityVerified,
      status: ev.integrityVerified ? 'VERIFIED' : 'FAILED',
      event: ev.event,
      uploaded_at: ev.createdAt?.toISOString() || ev.uploadedAt,
    }));
    const verified = items.filter((i) => i.integrity_verified).length;
    const failed = items.filter((i) => !i.integrity_verified).length;
    return {
      asset_id: assetId,
      total: items.length,
      verified,
      failed,
      items,
      overall_integrity: (
        items.length === 0 ? 'NO_EVIDENCE' : failed > 0 ? 'FAILED' : verified === items.length ? 'VERIFIED' : 'PARTIAL'
      ) as 'VERIFIED' | 'PARTIAL' | 'FAILED' | 'NO_EVIDENCE',
    };
  }

  async downloadEvidence(id: string, user?: any) {
    let evidence = await this.prisma.evidence.findUnique({ where: { id } });
    if (!evidence) {
      evidence = await this.prisma.evidence.findUnique({ where: { evidenceId: id } });
    }
    if (!evidence) {
      throw new NotFoundException(`Evidence ${id} not found`);
    }
    
    if (user) {
      await this.enforceAssetAccess(evidence.assetId, user);
    }

    if (!evidence.objectKey) {
      throw new NotFoundException(`Evidence ${id} has no stored object key`);
    }

    const buffer = await this.minio.downloadFile(evidence.objectKey);
    return {
      buffer,
      filename: evidence.filename,
      mimeType: evidence.mimeType,
      sizeKb: evidence.sizeKb,
    };
  }
}
