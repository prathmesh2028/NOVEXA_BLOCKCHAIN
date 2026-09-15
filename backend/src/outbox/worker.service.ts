import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { BlockchainAdapter } from '../blockchain/blockchain.adapter';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

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
  ) {}

  onModuleInit() {
    // Start polling in development mode
    if (process.env.NODE_ENV !== 'test') {
      this.start();
    }
  }

  onModuleDestroy() {
    this.stop();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.logger.log(`Worker ${this.workerId} started`);

    this.intervalHandle = setInterval(async () => {
      try {
        await this.processEvents();
      } catch (e: any) {
        this.logger.error(`Worker poll error: ${e.message}`);
      }
    }, 5000); // Poll every 5 seconds
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.running = false;
    this.logger.log(`Worker ${this.workerId} stopped`);
  }

  private async processEvents() {
    const events = await this.outboxService.claimPendingEvents(this.workerId, 5);

    for (const event of events) {
      try {
        this.logger.log(`Processing event ${event.id}: ${event.eventType}`);
        await this.handleEvent(event);
        await this.outboxService.markCompleted(event.id);
        this.logger.log(`Event ${event.id} completed`);
      } catch (e: any) {
        this.logger.error(`Event ${event.id} failed: ${e.message}`);
        await this.outboxService.markFailed(event.id, e.message);
      }
    }
  }

  private async handleEvent(event: any) {
    switch (event.eventType) {
      case 'PASSPORT_MINT_REQUESTED':
        await this.handleMintRequest(event);
        break;
      case 'EVIDENCE_ANCHOR_REQUESTED':
        await this.handleEvidenceAnchor(event);
        break;
      default:
        this.logger.warn(`Unknown event type: ${event.eventType}`);
    }
  }

  private async handleMintRequest(event: any) {
    const payload = event.payload;
    this.logger.log(`Mint request for certification ${payload.certId}: asset ${payload.assetId}`);
    
    // Check for idempotency
    const existingTx = await this.prisma.blockchainTransaction.findUnique({
      where: { idempotencyKey: event.idempotencyKey },
    });

    if (existingTx) {
      this.logger.warn(`Idempotency key ${event.idempotencyKey} already processed. Skipping mint.`);
      return;
    }

    const contractAddress = process.env.KAVACH_SBT_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    // Attempt submission
    const result = await this.blockchainAdapter.submitTransaction({
      to: contractAddress,
      data: '0x', // Fake ABI encoded data for mintCertification
    });

    if (result.status === 'FAILED') {
      throw new Error('Blockchain transaction submission failed');
    }

    await this.prisma.$transaction(async (tx) => {
      // Update certification with txHash
      const cert = await tx.certification.update({
        where: { id: payload.certificationId },
        data: {
          txHash: result.txHash,
          status: result.status === 'SIMULATED' ? 'CONFIRMED' : 'PENDING',
        },
      });

      // Also create the blockchain transaction record
      await tx.blockchainTransaction.create({
        data: {
          txHash: result.txHash,
          network: 'BEL-TRUST-CHAIN',
          status: result.status === 'SIMULATED' ? 'CONFIRMED' : 'SUBMITTED',
          action: 'MINT_CERTIFICATION',
          fromAddress: 'system-wallet',
          contractAddress,
          assetId: payload.assetId,
          idempotencyKey: event.idempotencyKey,
        },
      });

      // Audit
      await tx.auditEvent.create({
        data: {
          eventType: 'PASSPORT_MINT_SUBMITTED',
          action: `SBT Mint Transaction Submitted`,
          resourceType: 'Certification',
          resourceId: cert.id,
          result: 'SUCCESS',
          blockchainTxHash: result.txHash,
          details: `TxHash: ${result.txHash} | Network: BEL-TRUST-CHAIN`,
        },
      });
    });
  }

  private async handleEvidenceAnchor(event: any) {
    this.logger.log(`Evidence anchor request for ${event.payload.evidenceId}`);
  }
}
