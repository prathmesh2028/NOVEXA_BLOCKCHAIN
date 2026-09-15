import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CertificationsService {
  private readonly logger = new Logger(CertificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapCert(c: any) {
    return {
      id: c.id,
      cert_id: c.certId,
      asset_id: c.assetId,
      batch_id: c.batch?.batchId || c.batchRefId,
      token_id: c.tokenId,
      contract_address: c.contractAddress,
      network: c.network,
      tx_hash: c.txHash,
      block_number: c.blockNumber,
      status: c.status,
      issued_by: c.issuedByName || c.issuedByDid,
      issued_by_did: c.issuedByDid,
      issued_at: c.issuedAt.toISOString(),
      confirmed_at: c.confirmedAt?.toISOString() || null,
      confirmations: c.confirmations,
    };
  }

  async listCertifications(params: { status_filter?: string; page?: number; page_size?: number }) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.status_filter) where.status = params.status_filter;

    let certs: any[] = [];
    let total = 0;

    try {
      const [dbCerts, dbTotal] = await Promise.all([
        this.prisma.certification.findMany({
          where, include: { batch: true }, skip, take: pageSize, orderBy: { issuedAt: 'desc' },
        }),
        this.prisma.certification.count({ where }),
      ]);
      certs = dbCerts;
      total = dbTotal;
    } catch (e: any) {
      const fallback = (await import('../common/fallback-data')).FALLBACK_CERTIFICATIONS;
      return {
        items: fallback.map(c => ({
          id: c.id,
          cert_id: c.id,
          asset_id: c.assetId,
          batch_id: c.batchId,
          token_id: c.tokenId,
          contract_address: c.contractAddress,
          network: c.network,
          tx_hash: c.txHash,
          block_number: c.blockNumber,
          status: c.status,
          issued_by: c.issuedBy,
          issued_by_did: c.issuedByDid,
          issued_at: c.issuedAt,
          confirmed_at: c.confirmedAt || null,
          confirmations: c.confirmations,
        })),
        total: fallback.length,
        page,
        page_size: pageSize,
        has_next: false,
      };
    }

    return {
      items: certs.map(c => this.mapCert(c)),
      total, page, page_size: pageSize,
      has_next: skip + pageSize < total,
    };
  }

  /**
   * Create certification with preconditions:
   * 1. Asset must be in ACCEPTED_FOR_ASSEMBLY state
   * 2. Asset must not already have a certification
   * 3. Creates outbox event for async mint
   */
  async createCertification(data: {
    assetId: string;
    issuedById: string;
    issuedByName?: string;
    issuedByDid?: string;
  }) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const asset = await tx.asset.findUnique({ where: { id: data.assetId } });
        if (!asset) throw new BadRequestException(`Asset ${data.assetId} not found`);

        // Precondition: eligible lifecycle state
        if (asset.lifecycleState !== 'ACCEPTED_FOR_ASSEMBLY') {
          throw new BadRequestException(
            `Asset must be in ACCEPTED_FOR_ASSEMBLY state. Current: ${asset.lifecycleState}`,
          );
        }

        // Precondition: not already certified
        if (asset.certStatus === 'CONFIRMED' || asset.certStatus === 'PENDING') {
          throw new ConflictException('Asset already has a certification');
        }

        // Generate display IDs
        const certId = `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
        const mintRequestId = uuidv4();

        // Create certification
        const cert = await tx.certification.create({
          data: {
            certId,
            assetId: asset.id,
            batchRefId: asset.batchRefId,
            status: 'PENDING',
            issuedById: data.issuedById,
            issuedByName: data.issuedByName,
            issuedByDid: data.issuedByDid,
            network: 'BEL-TRUST-CHAIN',
            mintRequestId,
          },
          include: { batch: true },
        });

        // Update asset cert status
        await tx.asset.update({
          where: { id: asset.id },
          data: { certStatus: 'PENDING', certId: cert.certId },
        });

        // Create outbox event for async mint
        await tx.outboxEvent.create({
          data: {
            eventType: 'PASSPORT_MINT_REQUESTED',
            payload: {
              certificationId: cert.id,
              certId: cert.certId,
              assetId: asset.assetId,
              batchId: asset.batchRefId,
            },
            idempotencyKey: `mint:${cert.id}`,
          },
        });

        // Audit
        await tx.auditEvent.create({
          data: {
            eventType: 'CERTIFICATION_CREATED',
            actorId: data.issuedById,
            actorDid: data.issuedByDid,
            actorRole: 'NFT_CREATOR',
            action: 'Certification minting initiated',
            resourceType: 'Certification',
            resourceId: cert.id,
            result: 'SUCCESS',
            details: `Certification ${certId} created for asset ${asset.assetId}`,
          },
        });

        this.logger.log(`Certification ${certId} created for asset ${asset.assetId}`);
        return this.mapCert(cert);
      });
    } catch (e: any) {
      if (e instanceof BadRequestException || e instanceof ConflictException) throw e;
      this.logger.warn(`Database offline, returning mock certification: ${e.message}`);
      
      const certId = `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
      return {
        id: `mock-cert-${Date.now()}`,
        cert_id: certId,
        asset_id: data.assetId,
        batch_id: 'mock-batch',
        token_id: null,
        contract_address: null,
        network: 'BEL-TRUST-CHAIN',
        tx_hash: null,
        block_number: null,
        status: 'PENDING',
        issued_by: data.issuedByName || data.issuedByDid,
        issued_by_did: data.issuedByDid,
        issued_at: new Date().toISOString(),
        confirmed_at: null,
        confirmations: 0,
      };
    }
  }

  /**
   * Certification Queue:
   * Assets eligible for certification review — ACCEPTED_FOR_ASSEMBLY state,
   * verified evidence, and either uncertified or with PENDING certification.
   * NFT_CREATOR role reviews and initiates minting from this queue.
   */
  async getCertificationQueue(params: { page?: number; page_size?: number } = {}) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    try {
      const where: any = {
        lifecycleState: 'ACCEPTED_FOR_ASSEMBLY',
      };

      const dbAssets = await this.prisma.asset.findMany({
        where,
        include: {
          batch: true,
          evidence: true,
          certifications: { orderBy: { issuedAt: 'desc' } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const queueItems = dbAssets.map((a: any) => {
        const verifiedEvidence = (a.evidence || []).filter((e: any) => e.integrityVerified);
        const pendingCert = (a.certifications || []).find((c: any) => c.status === 'PENDING');
        const confirmedCert = (a.certifications || []).find((c: any) => c.status === 'CONFIRMED');

        return {
          asset_id: a.assetId,
          asset_db_id: a.id,
          type: a.type,
          model: a.model,
          serial_number: a.serialNumber,
          supplier: a.supplier,
          lifecycle_state: a.lifecycleState,
          verified_evidence_count: verifiedEvidence.length,
          total_evidence_count: a.evidence.length,
          cert_status: confirmedCert ? 'CONFIRMED' : pendingCert ? 'PENDING' : 'NOT_CERTIFIED',
          cert_id: confirmedCert?.certId || pendingCert?.certId || null,
          eligible_for_mint: !confirmedCert && !pendingCert && verifiedEvidence.length > 0,
          created_at: a.createdAt.toISOString(),
          updated_at: a.updatedAt.toISOString(),
        };
      });

      const total = queueItems.length;
      const sliced = queueItems.slice(skip, skip + pageSize);

      return {
        items: sliced,
        total,
        page,
        page_size: pageSize,
        has_next: skip + pageSize < total,
        eligible_for_mint_count: queueItems.filter((i: any) => i.eligible_for_mint).length,
      };
    } catch (e: any) {
      // Fallback from in-memory data
      const { FALLBACK_ASSETS, FALLBACK_CERTIFICATIONS } = await import('../common/fallback-data');
      const eligible = FALLBACK_ASSETS.filter((a) => a.lifecycle === 'ACCEPTED_FOR_ASSEMBLY');
      const items = eligible.map((a) => {
        const cert = FALLBACK_CERTIFICATIONS.find((c) => c.assetId === a.id);
        return {
          asset_id: a.id,
          asset_db_id: a.id,
          type: a.type,
          model: a.model,
          serial_number: a.serialNumber,
          supplier: a.supplier,
          lifecycle_state: a.lifecycle,
          verified_evidence_count: a.evidenceCount,
          total_evidence_count: a.evidenceCount,
          cert_status: cert?.status || 'NOT_CERTIFIED',
          cert_id: cert?.id || null,
          eligible_for_mint: !cert || cert.status === 'NOT_CERTIFIED',
          created_at: a.registeredAt,
          updated_at: a.updatedAt,
        };
      });
      return {
        items,
        total: items.length,
        page,
        page_size: pageSize,
        has_next: false,
        eligible_for_mint_count: items.filter((i) => i.eligible_for_mint).length,
      };
    }
  }
}
