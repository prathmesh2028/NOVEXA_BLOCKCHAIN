import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { OutboxService } from './outbox.service';
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

  constructor(private readonly outboxService: OutboxService) {}

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
        await this.handleMintRequest(event.payload);
        break;
      case 'EVIDENCE_ANCHOR_REQUESTED':
        await this.handleEvidenceAnchor(event.payload);
        break;
      default:
        this.logger.warn(`Unknown event type: ${event.eventType}`);
    }
  }

  private async handleMintRequest(payload: any) {
    // In production: call blockchain adapter to mint SBT
    // For now, log the intent — real blockchain requires running Besu
    this.logger.log(`Mint request for certification ${payload.certId}: asset ${payload.assetId}`);
    // The actual implementation would:
    // 1. Call blockchainAdapter.mintCertification(...)
    // 2. Wait for transaction hash
    // 3. Update certification with txHash
    // 4. Record audit event
  }

  private async handleEvidenceAnchor(payload: any) {
    this.logger.log(`Evidence anchor request for ${payload.evidenceId}`);
  }
}
