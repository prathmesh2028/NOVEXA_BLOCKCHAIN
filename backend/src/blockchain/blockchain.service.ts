import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainAdapter } from './blockchain.adapter';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adapter: BlockchainAdapter,
  ) {}

  async listTransactions(params: {
    asset_id?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.asset_id) where.assetId = params.asset_id;
    if (params.status) where.status = params.status;

    let txs: any[] = [];
    let total = 0;

    try {
      const [dbTxs, dbTotal] = await Promise.all([
        this.prisma.blockchainTransaction.findMany({
          where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        }),
        this.prisma.blockchainTransaction.count({ where }),
      ]);
      txs = dbTxs;
      total = dbTotal;
    } catch (e: any) {
      const fallback = (await import('../common/fallback-data')).FALLBACK_TRANSACTIONS;
      return {
        items: fallback,
        total: fallback.length,
        page,
        page_size: pageSize,
        has_next: false,
      };
    }

    return {
      items: txs.map(tx => ({
        id: tx.id,
        tx_hash: tx.txHash,
        network: tx.network,
        block_number: tx.blockNumber,
        status: tx.status,
        action: tx.action,
        confirmations: tx.confirmations,
        gas_used: tx.gasUsed,
        from_address: tx.fromAddress,
        contract_address: tx.contractAddress,
        token_id: tx.tokenId,
        timestamp: tx.createdAt.toISOString(),
      })),
      total, page, page_size: pageSize,
      has_next: skip + pageSize < total,
    };
  }

  async getStatus() {
    const info = this.adapter.getNetworkInfo();
    const blockNumber = await this.adapter.getBlockNumber();
    return {
      connected: info.connected,
      network: info.network,
      chain_id: info.chainId,
      latest_block: blockNumber,
      rpc_url: info.rpcUrl,
    };
  }

  /**
   * Get blockchain proof for an asset.
   * Reconciles DB certification state vs adapter connectivity.
   * Returns tx hashes, confirmations, and on-chain status where available.
   */
  async getAssetProof(assetId: string) {
    const adapterInfo = this.adapter.getNetworkInfo();

    try {
      const asset = await this.prisma.asset.findFirst({
        where: { OR: [{ id: assetId }, { assetId }] },
        include: {
          certifications: { orderBy: { issuedAt: 'desc' } },
          evidence: true,
        },
      });

      if (!asset) {
        return {
          asset_id: assetId,
          found: false,
          blockchain_connected: adapterInfo.connected,
          proof: null,
        };
      }

      const confirmedCert = asset.certifications.find((c: any) => c.status === 'CONFIRMED');
      const pendingCert = asset.certifications.find((c: any) => c.status === 'PENDING');

      // Attempt on-chain verification if connected
      let onChainVerification: any = null;
      if (adapterInfo.connected && confirmedCert?.txHash) {
        onChainVerification = await this.adapter.verifyTransaction(confirmedCert.txHash);
      }

      const anchoredEvidence = asset.evidence.filter((e: any) => e.blockchainTx);

      return {
        asset_id: asset.assetId,
        found: true,
        lifecycle_state: asset.lifecycleState,
        blockchain_connected: adapterInfo.connected,
        network: adapterInfo.network,
        proof: {
          certification: confirmedCert ? {
            cert_id: confirmedCert.certId,
            tx_hash: confirmedCert.txHash,
            block_number: confirmedCert.blockNumber,
            confirmations: confirmedCert.confirmations,
            status: confirmedCert.status,
            on_chain_verified: onChainVerification?.verified ?? null,
          } : pendingCert ? {
            cert_id: pendingCert.certId,
            tx_hash: pendingCert.txHash,
            status: 'PENDING',
            on_chain_verified: null,
          } : null,
          evidence_anchors: anchoredEvidence.map((e: any) => ({
            evidence_id: e.id,
            filename: e.filename,
            hash: e.hash,
            blockchain_tx: e.blockchainTx,
            integrity_verified: e.integrityVerified,
          })),
          anchored_evidence_count: anchoredEvidence.length,
          total_evidence_count: asset.evidence.length,
        },
        note: adapterInfo.connected
          ? 'Blockchain connectivity active'
          : '[PROPOSED PILOT DESIGN] Besu/QBFT node not reachable — proof sourced from DB records only',
      };
    } catch (e: any) {
      // Fallback
      const { FALLBACK_ASSETS, FALLBACK_CERTIFICATIONS, FALLBACK_EVIDENCE } = await import('../common/fallback-data');
      const asset = FALLBACK_ASSETS.find((a) => a.id === assetId);
      if (!asset) return { asset_id: assetId, found: false, blockchain_connected: false, proof: null };

      const cert = FALLBACK_CERTIFICATIONS.find((c) => c.assetId === assetId);
      const evidence = FALLBACK_EVIDENCE.filter((e) => e.assetId === assetId && e.blockchainTx);

      return {
        asset_id: assetId,
        found: true,
        lifecycle_state: asset.lifecycle,
        blockchain_connected: false,
        network: 'BEL-TRUST-CHAIN (Synthetic Demo)',
        proof: {
          certification: cert ? {
            cert_id: cert.id,
            tx_hash: cert.txHash,
            block_number: cert.blockNumber,
            confirmations: cert.confirmations,
            status: cert.status,
            on_chain_verified: null,
          } : null,
          evidence_anchors: evidence.map((e) => ({
            evidence_id: e.id,
            filename: e.filename,
            hash: e.hash,
            blockchain_tx: e.blockchainTx,
            integrity_verified: e.integrityVerified,
          })),
          anchored_evidence_count: evidence.length,
          total_evidence_count: FALLBACK_EVIDENCE.filter((e) => e.assetId === assetId).length,
        },
        note: '[PROPOSED PILOT DESIGN] Database offline — proof sourced from synthetic fallback data only',
      };
    }
  }
}
