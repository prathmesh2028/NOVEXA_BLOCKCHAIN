import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Optional, Inject } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { BlockchainAdapter } from '../blockchain/blockchain.adapter';
import { PrismaService } from '../../core/database/prisma.service';
import { INotificationPort, NOTIFICATION_PORT } from '../../notifications/notification.port';
import { AuditService } from '../../asset-management/audit/audit.service';
import { ConfigService } from '../../core/config/config.service';
import { v4 as uuidv4 } from 'uuid';
import { encodeFunctionData, parseAbi, isAddress } from 'viem';

const KAVACH_SBT_ABI = parseAbi([
  'function mintCertification(address to, string assetId, string batchId, string evidenceHash) external returns (uint256)',
  'function getCertification(uint256 tokenId) external view returns (string assetId, string batchId, string evidenceHash, uint256 issuedAt)',
  'function locked(uint256 tokenId) external view returns (bool)',
]);

/**
 * Durable PostgreSQL-backed worker.
 * - Safely claims work
 * - Prevents duplicate processing
 * - Retries failures with backoff
 * - Handles restart
 */
@Injectable()
export class WorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerService.name);
  private readonly workerId = `worker-${uuidv4().slice(0, 8)}`;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(
    private readonly outboxService: OutboxService,
    private readonly blockchainAdapter: BlockchainAdapter,
    private readonly prisma: PrismaService,
    @Optional() @Inject(NOTIFICATION_PORT) private readonly notificationsService?: INotificationPort,
    @Optional() @Inject(AuditService) private readonly auditService?: AuditService,
    @Optional() @Inject(ConfigService) private readonly configService?: ConfigService,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV !== 'test') {
      this.start();
    }
  }

  onModuleDestroy() {
    this.stop();
  }

  private reconciliationHandle: ReturnType<typeof setInterval> | null = null;

  start() {
    if (this.running) return;
    this.running = true;
    this.logger.log(`Worker ${this.workerId} started`);

    // Run reconciliation on startup
    this.reconcileStrandedTransactions().catch(e => this.logger.error(`Initial reconciliation failed: ${e.message}`));

    this.intervalHandle = setInterval(async () => {
      try {
        await this.processEvents();
      } catch (e: any) {
        this.logger.error(`Worker poll error: ${e.message}`);
      }
    }, 5000);

    // Schedule reconciliation every 60 seconds
    this.reconciliationHandle = setInterval(async () => {
      try {
        await this.reconcileStrandedTransactions();
      } catch (e: any) {
        this.logger.error(`Reconciliation error: ${e.message}`);
      }
    }, 60000);
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    if (this.reconciliationHandle) {
      clearInterval(this.reconciliationHandle);
      this.reconciliationHandle = null;
    }
    this.running = false;
    this.logger.log(`Worker ${this.workerId} stopped`);
  }

  /**
   * Recovers transactions that were left hanging due to a worker crash or RPC timeout.
   */
  private async reconcileStrandedTransactions() {
    this.logger.debug('Running reconciliation for stranded transactions...');
    
    // 1. Recover stranded BlockchainTransactions (SUBMITTED but no receipt, or MINED but waiting for confirmations)
    const strandedTxs = await this.prisma.blockchainTransaction.findMany({
      where: {
        status: { in: ['SUBMITTED', 'PENDING'] }, // PENDING means pending confirmations in this context sometimes, but SUBMITTED is the main one
        updatedAt: { lt: new Date(Date.now() - 30000) } // older than 30s
      }
    });

    if (strandedTxs.length > 0) {
      this.logger.log(`Found ${strandedTxs.length} stranded transaction(s) to reconcile`);
    }

    for (const tx of strandedTxs) {
      if (tx.txHash) {
        this.logger.log(`Reconciling stranded transaction ${tx.txHash}`);
        try {
          const receipt = await this.blockchainAdapter.getTransactionReceipt(tx.txHash);
          if (receipt) {
            // Receipt found, we can update status based on receipt
            const blockNumber = Number(receipt.blockNumber);
            const gasUsed = Number(receipt.gasUsed || 0);
            if (receipt.status === 'reverted') {
              await this.prisma.blockchainTransaction.update({
                where: { id: tx.id },
                data: { status: 'REVERTED', errorMessage: 'Reverted on-chain during reconciliation' }
              });
            } else {
               await this.prisma.blockchainTransaction.update({
                  where: { id: tx.id },
                  data: { status: 'MINED', blockNumber, gasUsed }
               });
            }
          } else {
             // Still no receipt
             this.logger.log(`Tx ${tx.txHash} still pending receipt on chain`);
          }
        } catch (e: any) {
          this.logger.error(`Failed to reconcile tx ${tx.txHash}: ${e.message}`);
        }
      }
    }

    // 2. Recover stuck OutboxEvents (PROCESSING for > 5 minutes)
    const stuckEvents = await this.prisma.outboxEvent.updateMany({
      where: {
        status: 'PROCESSING',
        claimedAt: { lt: new Date(Date.now() - 5 * 60000) }
      },
      data: {
        status: 'PENDING',
        claimedBy: null,
        claimedAt: null,
        nextAttemptAt: new Date()
      }
    });

    if (stuckEvents.count > 0) {
      this.logger.warn(`Recovered ${stuckEvents.count} stuck outbox events`);
    }
  }

  private async processEvents() {
    const events = await this.outboxService.claimPendingEvents(this.workerId, 5);

    for (const event of events) {
      try {
        const result = await this.handleEvent(event);
        if (result && (result.status === 'PENDING_CONFIRMATIONS' || result.status === 'PENDING_RECEIPT')) {
          this.logger.log(`Event ${event.id} deferred (${result.status}). Retrying in next polling cycle.`);
          try {
            await this.prisma.outboxEvent.update({
              where: { id: event.id },
              data: {
                status: 'PENDING',
                claimedBy: null,
                claimedAt: null,
                nextAttemptAt: new Date(Date.now() + 5000),
              },
            });
          } catch {}
          continue;
        }

        await this.outboxService.markCompleted(event.id);
        this.logger.log(`Event ${event.id} completed`);
      } catch (e: any) {
        this.logger.error(`Event ${event.id} failed: ${e.message}`);
        await this.outboxService.markFailed(event.id, e.message);
      }
    }
  }

  private async handleEvent(event: any): Promise<any> {
    switch (event.eventType) {
      case 'PASSPORT_MINT_REQUESTED':
        return await this.handleMintRequest(event);
      case 'EVIDENCE_ANCHOR_REQUESTED':
        return await this.handleEvidenceAnchor(event);
      default:
        this.logger.warn(`Unknown event type: ${event.eventType}`);
        return { status: 'UNKNOWN' };
    }
  }

  private async handleMintRequest(event: any) {
    const payload = event.payload;
    this.logger.log(`Mint request for certification ${payload.certId}: asset ${payload.assetId}`);

    const contractAddress =
      this.configService?.contractAddress ||
      process.env.CONTRACT_ADDRESS ||
      (process.env.NODE_ENV === 'test' ? '0x0000000000000000000000000000000000000001' : undefined);
    if (!contractAddress) {
      throw new Error('CONTRACT_ADDRESS environment variable is required for mint operations');
    }

    // Fetch certification & asset details to get actual evidence hash and batch
    const certDetails = await this.prisma.certification.findUnique({
      where: { id: payload.certificationId },
      include: {
        asset: {
          include: {
            evidence: {
              where: { status: 'COMPLETE' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            batch: true,
          },
        },
      },
    });

    const evidenceHash =
      certDetails?.asset?.evidence?.[0]?.hash ||
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const batchId = certDetails?.asset?.batch?.batchId || payload.batchId || 'BATCH-001';

    // Resolve real recipient address from Asset registrant or Cert issuer or configuration
    let recipient: string | null = null;
    if (certDetails?.asset?.registeredById) {
      const regUser = await this.prisma.user.findUnique({
        where: { id: certDetails.asset.registeredById },
        include: { walletBindings: { where: { verified: true } }, actor: true },
      });
      if (regUser?.walletBindings?.[0]?.address && isAddress(regUser.walletBindings[0].address)) {
        recipient = regUser.walletBindings[0].address;
      } else if (regUser?.actor?.walletAddress && isAddress(regUser.actor.walletAddress)) {
        recipient = regUser.actor.walletAddress;
      }
    }
    if (!recipient && certDetails?.issuedById) {
      const issuerUser = await this.prisma.user.findUnique({
        where: { id: certDetails.issuedById },
        include: { walletBindings: { where: { verified: true } }, actor: true },
      });
      if (issuerUser?.walletBindings?.[0]?.address && isAddress(issuerUser.walletBindings[0].address)) {
        recipient = issuerUser.walletBindings[0].address;
      } else if (issuerUser?.actor?.walletAddress && isAddress(issuerUser.actor.walletAddress)) {
        recipient = issuerUser.actor.walletAddress;
      }
    }
    if (!recipient && this.configService?.defaultNftRecipient && isAddress(this.configService.defaultNftRecipient)) {
      recipient = this.configService.defaultNftRecipient;
    }
    if (!recipient && process.env.DEFAULT_NFT_RECIPIENT && isAddress(process.env.DEFAULT_NFT_RECIPIENT)) {
      recipient = process.env.DEFAULT_NFT_RECIPIENT;
    }

    if (!recipient) {
      throw new Error(`Failed to resolve valid blockchain recipient address for asset ${payload.assetId}`);
    }

    const encodedData = encodeFunctionData({
      abi: KAVACH_SBT_ABI,
      functionName: 'mintCertification',
      args: [recipient as `0x${string}`, payload.assetId, batchId, evidenceHash],
    });

    // 1. Acquire Logical Lock (Atomic Insert)
    const idempotencyKey = `MINT:${payload.certificationId}`;
    let txRecord: any;
    try {
      txRecord = await this.prisma.blockchainTransaction.create({
        data: {
          idempotencyKey,
          action: 'MINT_CERTIFICATION',
          network: this.configService?.blockchainNetworkName || 'BEL-TRUST-CHAIN',
          contractAddress,
          status: 'PENDING',
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        this.logger.warn(`Transaction for certification ${payload.certificationId} is already locked/processed.`);
        const existingTx = await this.prisma.blockchainTransaction.findUnique({
          where: { idempotencyKey },
        });
        if (existingTx) {
          if (existingTx.status === 'CONFIRMED') {
            return { status: 'COMPLETED' };
          }
          if (existingTx.status === 'PENDING' || existingTx.status === 'SUBMITTED' || existingTx.status === 'MINED') {
            txRecord = existingTx;
          } else {
            throw new Error(`Transaction in ambiguous state: ${existingTx.status}. Needs manual reconciliation.`);
          }
        }
      } else {
        throw e;
      }
    }

    let result: any = null;
    let isAlreadySubmitted = (txRecord.status === 'SUBMITTED' || txRecord.status === 'MINED') && !!txRecord.txHash;

    if (!isAlreadySubmitted) {
      result = await this.blockchainAdapter.submitTransaction({
        to: contractAddress,
        data: encodedData,
      });

      if (result.status === 'FAILED' || !result.txHash) {
        await this.prisma.blockchainTransaction.update({
          where: { id: txRecord.id },
          data: {
            status: 'FAILED',
            errorMessage: 'Transaction submission failed: RPC unavailable or node rejected transaction',
          },
        });
        throw new Error('Blockchain submission failed — node offline or transaction rejected');
      }

      // Mark transaction as submitted
      await this.prisma.blockchainTransaction.update({
        where: { id: txRecord.id },
        data: {
          txHash: result.txHash,
          status: 'SUBMITTED',
        },
      });
    } else {
      result = { status: 'SUCCESS', txHash: txRecord.txHash };
    }

    let tokenId: string | null = null;
    let confirmations = 0;
    let blockNumber: number | null = null;
    let gasUsed: number | null = null;

    let receipt: any = await this.blockchainAdapter.getTransactionReceipt(result.txHash);

      if (!receipt) {
        this.logger.log(`Transaction ${result.txHash} submitted, awaiting receipt in next cycle`);
        return { status: 'PENDING_RECEIPT' };
      }

      // 3. Verify receipt status
      if (receipt.status === 'reverted') {
        await this.prisma.blockchainTransaction.update({
          where: { id: txRecord.id },
          data: { status: 'REVERTED', errorMessage: `Transaction ${result.txHash} reverted on-chain` },
        });
        await this.prisma.certification.update({
          where: { id: payload.certificationId },
          data: { status: 'FAILED' },
        });
        throw new Error(`Transaction ${result.txHash} reverted on-chain`);
      }

      blockNumber = Number(receipt.blockNumber);
      gasUsed = Number(receipt.gasUsed || 0);

      // 4. Decode CertificationMinted event
      const decodedEvent = this.blockchainAdapter.decodeCertificationMintedEvent(receipt);
      if (!decodedEvent || decodedEvent.tokenId === undefined) {
        await this.prisma.blockchainTransaction.update({
          where: { id: txRecord.id },
          data: { status: 'MISMATCH', errorMessage: 'CertificationMinted event not found in receipt' },
        });
        throw new Error(`CertificationMinted event not found in receipt for ${result.txHash}`);
      }
      tokenId = decodedEvent.tokenId.toString();

      // 5. Track confirmations
      const latestBlock = await this.blockchainAdapter.getBlockNumber() || blockNumber;
      confirmations = latestBlock >= blockNumber ? (latestBlock - blockNumber + 1) : 1;

      const requiredConfirmations = this.configService?.blockchainConfirmationsRequired ?? Number(process.env.BLOCKCHAIN_CONFIRMATIONS_REQUIRED || 1);

      if (confirmations < requiredConfirmations) {
        await this.prisma.blockchainTransaction.update({
          where: { id: txRecord.id },
          data: {
            status: 'MINED',
            blockNumber,
            gasUsed,
            tokenId,
            confirmations,
          },
        });
        this.logger.log(`Transaction ${result.txHash} mined with ${confirmations}/${requiredConfirmations} confirmations. Pending final confirmation.`);
        return { status: 'PENDING_CONFIRMATIONS' };
      }

    // 3. Update DB after confirmed receipt & confirmations reached
    // NOTE: Using sequential individual writes instead of $transaction because PgBouncer
    // transaction-pool mode is incompatible with Prisma interactive transactions (P2028 timeout).
    const cert = await this.prisma.certification.update({
      where: { id: payload.certificationId },
      data: {
        txHash: result.txHash,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmations,
        contractAddress,
        tokenId,
        blockNumber,
      },
    });

    await this.prisma.asset.update({
      where: { id: cert.assetId },
      data: {
        certStatus: 'CONFIRMED',
        certId: cert.certId,
      },
    });

    await this.prisma.blockchainTransaction.update({
      where: { id: txRecord.id },
      data: {
        txHash: result.txHash,
        status: 'CONFIRMED',
        tokenId,
        blockNumber,
        gasUsed,
        confirmations,
      },
    });

    // Best-effort audit (not inside transaction)
    try {
      if (this.auditService?.recordEvent) {
        await this.auditService.recordEvent({
          eventType: 'PASSPORT_MINT_CONFIRMED',
          action: 'SBT Mint Transaction Confirmed on-chain',
          resourceType: 'Certification',
          resourceId: cert.id,
          result: 'SUCCESS',
          blockchainTxHash: result.txHash,
          details: `Passport SBT minted for asset ${payload.assetId} | TokenId: ${tokenId} | Tx: ${result.txHash}`,
          payload: {
            certId: cert.certId,
            tokenId,
            assetId: payload.assetId,
            txHash: result.txHash,
            confirmations,
          },
        });
      } else {
        await this.prisma.auditEvent.create({
          data: {
            eventType: 'PASSPORT_MINT_CONFIRMED',
            action: 'SBT Mint Transaction Confirmed on-chain',
            resourceType: 'Certification',
            resourceId: cert.id,
            result: 'SUCCESS',
            blockchainTxHash: result.txHash,
            details: `Passport SBT minted for asset ${payload.assetId} | Tx: ${result.txHash}`,
          },
        });
      }
    } catch (auditErr: any) {
      this.logger.warn(`Audit event write failed (non-fatal): ${auditErr.message}`);
    }

    // Best-effort notification
    try {
      if (this.notificationsService?.createNotification) {
        await this.notificationsService.createNotification({
          recipientRole: 'QUALITY_INSPECTOR',
          title: `Certification Minted: ${cert.certId}`,
          message: `Certification minted successfully for asset ${payload.assetId} (Token ID: ${tokenId}, Tx: ${result.txHash.slice(0, 10)}...).`,
          type: 'CERTIFICATION_MINTED',
          severity: 'INFO',
          link: `/app/certifications`,
          metadata: { certId: cert.certId, txHash: result.txHash, assetId: payload.assetId, tokenId },
        });
      }
    } catch (notifErr: any) {
      this.logger.warn(`Notification write failed (non-fatal): ${notifErr.message}`);
    }

    return { status: 'COMPLETED' };
  }

  private async handleEvidenceAnchor(event: any) {
    const payload = event.payload;
    this.logger.log(`Evidence anchor request for ${payload?.evidenceId}`);
    if (!payload?.evidenceId) {
      return { status: 'COMPLETED' };
    }

    try {
      const evidence = await this.prisma.evidence.findFirst({
        where: { OR: [{ id: payload.evidenceId }, { evidenceId: payload.evidenceId }] },
      });

      if (!evidence) {
        this.logger.warn(`Evidence ${payload.evidenceId} not found for anchoring`);
        return { status: 'COMPLETED' };
      }

      await this.prisma.evidence.update({
        where: { id: evidence.id },
        data: {
          integrityVerified: true,
          ...(payload.blockchainTx ? { blockchainTx: payload.blockchainTx } : {}),
        },
      });

      if (this.auditService?.recordEvent) {
        await this.auditService.recordEvent({
          eventType: 'EVIDENCE_ANCHOR_PROCESSED',
          action: 'Evidence anchor processed',
          resourceType: 'Evidence',
          resourceId: evidence.id,
          result: 'SUCCESS',
          details: `Evidence ${evidence.evidenceId} anchor processed with hash ${evidence.hash}`,
        });
      }

      return { status: 'COMPLETED' };
    } catch (e: any) {
      this.logger.error(`Evidence anchor failed: ${e.message}`);
      throw e;
    }
  }
}
