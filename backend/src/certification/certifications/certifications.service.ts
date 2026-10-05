import { Injectable, Logger, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AuditService } from '../../asset-management/audit/audit.service';
import { v4 as uuidv4 } from 'uuid';
import { BlockchainAdapter } from '../../trust/blockchain/blockchain.adapter';
import { ConfigService } from '../../core/config/config.service';

@Injectable()
export class CertificationsService {
  private readonly logger = new Logger(CertificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly blockchainAdapter: BlockchainAdapter,
    private readonly configService: ConfigService,
  ) {}

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
      throw e;
    }

    return {
      items: certs.map(c => this.mapCert(c)),
      total, page, page_size: pageSize,
      has_next: skip + pageSize < total,
    };
  }

  async getCertificationById(id: string) {
    try {
      let cert = await this.prisma.certification.findUnique({ where: { id }, include: { batch: true } });
      if (!cert) {
        cert = await this.prisma.certification.findUnique({ where: { certId: id }, include: { batch: true } });
      }
      if (!cert) {
        const { NotFoundException } = await import('@nestjs/common');
        throw new NotFoundException(`Certification ${id} not found`);
      }
      return this.mapCert(cert);
    } catch (e: any) {
      if (e?.status === 404) throw e;
      throw e;
    }
  }

  async getBlockchainProof(id: string) {
    const cert = await this.prisma.certification.findFirst({
      where: { OR: [{ id }, { certId: id }] },
      include: { asset: true, batch: true },
    });
    if (!cert) throw new NotFoundException(`Certification ${id} not found`);

    const network = this.blockchainAdapter.getNetworkInfo();
    const registeredUser = cert.asset.registeredById
      ? await this.prisma.user.findUnique({
          where: { id: cert.asset.registeredById },
          include: { walletBindings: { where: { verified: true } }, actor: true },
        })
      : null;
    const issuerUser = !registeredUser && cert.issuedById
      ? await this.prisma.user.findUnique({
          where: { id: cert.issuedById },
          include: { walletBindings: { where: { verified: true } }, actor: true },
        })
      : null;
    const ownerUser = registeredUser || issuerUser;
    const expectedOwner = ownerUser?.walletBindings?.[0]?.address
      || ownerUser?.actor?.walletAddress
      || null;
    const onChain = cert.status === 'CONFIRMED' && cert.tokenId && cert.contractAddress
      ? await this.blockchainAdapter.getTokenState(cert.contractAddress, cert.tokenId)
      : null;
    const receipt = cert.txHash ? await this.blockchainAdapter.getTransactionReceipt(cert.txHash) : null;
    const ownerMatches = Boolean(
      onChain?.owner
      && expectedOwner
      && onChain.owner.toLowerCase() === expectedOwner.toLowerCase(),
    );
    const receiptBlockNumber = receipt ? Number(receipt.blockNumber) : null;
    const receiptHash = receipt?.transactionHash
      ? String(receipt.transactionHash).toLowerCase()
      : null;
    const metadataAvailable = Boolean(onChain?.tokenUri && onChain.tokenUri !== `${cert.tokenId}.json`);

    return {
      certification: this.mapCert(cert),
      network: {
        name: network.network,
        chain_id: await this.blockchainAdapter.getChainId(),
        rpc_url: network.rpcUrl,
        connected: network.connected,
      },
      transaction: receipt ? {
        hash: cert.txHash,
        block_number: receiptBlockNumber,
        status: receipt.status,
      } : null,
      on_chain: onChain ? {
        ...onChain,
        token_id: cert.tokenId,
        contract_address: cert.contractAddress,
        expected_owner: expectedOwner,
      } : null,
      consistency: {
        token_id_matches_db: Boolean(onChain && onChain.certification.assetId === cert.asset.assetId),
        transaction_matches_db: Boolean(receiptHash && cert.txHash && receiptHash === cert.txHash.toLowerCase()),
        block_matches_db: Boolean(receiptBlockNumber !== null && cert.blockNumber === receiptBlockNumber),
        owner_verified: ownerMatches,
        metadata_available: metadataAvailable,
      },
    };
  }

  async getMetadataByTokenId(tokenId: string) {
    const cert = await this.prisma.certification.findFirst({
      where: {
        tokenId,
        contractAddress: this.configService.contractAddress,
      },
      include: { asset: true, batch: true },
    });
    if (!cert) throw new NotFoundException(`Token ${tokenId} not found`);

    return {
      name: `KavachTrust Certification ${cert.certId}`,
      description: 'Soulbound digital certification for a verified defence asset. Synthetic pilot data.',
      image: `${process.env.METADATA_IMAGE_BASE_URI || ''}${cert.tokenId}.svg`,
      external_url: `${process.env.FRONTEND_PUBLIC_URL || 'http://localhost:5173'}/app/certifications/${cert.certId}`,
      certification_id: cert.certId,
      asset_id: cert.asset.assetId,
      batch_id: cert.batch.batchId,
      status: cert.status,
      issuer: cert.issuedByName || cert.issuedByDid || 'KavachTrust',
      verification_reference: cert.txHash,
      attributes: [
        { trait_type: 'Certification status', value: cert.status },
        { trait_type: 'Network', value: cert.network || 'BEL-TRUST-CHAIN' },
        { trait_type: 'Soulbound', value: 'true' },
        { trait_type: 'Synthetic pilot data', value: 'true' },
      ],
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
    issuedByRole?: string;
    certificateImage?: string;
  }) {
    try {
      // NOTE: Sequential individual writes — PgBouncer incompatible with Prisma interactive transactions.
      const asset = await this.prisma.asset.findFirst({
        where: { OR: [{ id: data.assetId }, { assetId: data.assetId }] },
      });
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
      const cert = await this.prisma.certification.create({
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
      await this.prisma.asset.update({
        where: { id: asset.id },
        data: { certStatus: 'PENDING', certId: cert.certId },
      });

      // Create outbox event for async mint
      await this.prisma.outboxEvent.create({
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

      // Best-effort audit
      try {
        await this.auditService.recordEvent({
          eventType: 'CERTIFICATION_CREATED',
          actorId: data.issuedById,
          actorDid: data.issuedByDid,
          actorRole: data.issuedByRole || 'UNKNOWN',
          action: 'Certification minting initiated',
          resourceType: 'Certification',
          resourceId: cert.id,
          result: 'SUCCESS',
          details: `Certification ${certId} created for asset ${asset.assetId}`,
        });
      } catch (auditErr: any) {
        this.logger.warn(`Audit write failed (non-fatal): ${auditErr.message}`);
      }

      this.logger.log(`Certification ${certId} created for asset ${asset.assetId}`);
      return this.mapCert(cert);
    } catch (e: any) {
      if (e instanceof BadRequestException || e instanceof ConflictException) throw e;
      throw e;
    }
  }

  async revokeCertification(id: string, revokedBy: string, reason?: string) {
    try {
      const cert = await this.prisma.certification.findFirst({
        where: { OR: [{ id }, { certId: id }] },
        include: { asset: true },
      });

      if (!cert) {
        throw new NotFoundException(`Certification ${id} not found`);
      }

      if (cert.status === 'REVOKED') {
        throw new BadRequestException(`Certification ${cert.certId} is already revoked`);
      }

      return await this.prisma.$transaction(async (tx) => {
        const updated = await tx.certification.update({
          where: { id: cert.id },
          data: {
            status: 'REVOKED',
            revokedAt: new Date(),
            revokedBy,
            revokeReason: reason || 'Revoked by authority',
          },
        });

        await tx.asset.update({
          where: { id: cert.assetId },
          data: { certStatus: 'REVOKED' },
        });

        await this.auditService.recordEvent(
          {
            eventType: 'CERTIFICATION_REVOKED',
            actorId: revokedBy,
            action: `Certification ${cert.certId} revoked`,
            resourceType: 'Certification',
            resourceId: cert.id,
            result: 'SUCCESS',
            details: `Revocation reason: ${reason || 'Revoked by authority'}`,
          },
          tx,
        );

        this.logger.log(`Certification ${cert.certId} revoked by ${revokedBy}`);
        return this.mapCert(updated);
      });
    } catch (e: any) {
      if (e instanceof NotFoundException || e instanceof BadRequestException) throw e;
      throw e;
    }
  }

  /**
   * Certification Queue:
   * Assets eligible for certification review — ACCEPTED_FOR_ASSEMBLY state,
   * verified evidence, and either uncertified or with PENDING certification.
   * QUALITY_INSPECTOR role reviews and initiates minting from this queue.
   */
  async getCertificationQueue(params: { page?: number; page_size?: number } = {}) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    try {
      const where: any = {
        lifecycleState: 'ACCEPTED_FOR_ASSEMBLY',
        certStatus: { not: 'REVOKED' },
        evidence: { some: { integrityVerified: true } },
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
        const assetAlreadyCertified = a.certStatus === 'CONFIRMED' || a.certStatus === 'PENDING';

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
          cert_status: confirmedCert || assetAlreadyCertified ? 'CONFIRMED' : pendingCert ? 'PENDING' : 'NOT_CERTIFIED',
          cert_id: confirmedCert?.certId || pendingCert?.certId || null,
          eligible_for_mint: !confirmedCert && !pendingCert && !assetAlreadyCertified && verifiedEvidence.length > 0,
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
      if (process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo' || process.env.NODE_ENV === 'development') {
        this.logger.warn(`Prisma getCertificationQueue failed: ${e.message}. Returning empty queue for demo.`);
        return {
          items: [],
          total: 0,
          page,
          page_size: pageSize,
          has_next: false,
          eligible_for_mint_count: 0,
        };
      }
      throw e;
    }
  }
}
