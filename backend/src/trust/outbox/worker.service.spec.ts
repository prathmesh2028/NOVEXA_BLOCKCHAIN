import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkerService } from './worker.service';

describe('WorkerService (Outbox Blockchain Processing)', () => {
  let worker: WorkerService;
  let mockOutboxService: any;
  let mockBlockchainAdapter: any;
  let mockPrisma: any;
  let mockTx: any;
  let mockNotificationsService: any;

  beforeEach(() => {
    mockTx = {
      certification: {
        update: vi.fn().mockResolvedValue({ id: 'cert-1', certId: 'CERT-2026-001', assetId: 'ast-1' }),
      },
      asset: {
        update: vi.fn().mockResolvedValue({ id: 'ast-1' }),
      },
      blockchainTransaction: {
        update: vi.fn().mockResolvedValue({ id: 'tx-rec-1' }),
      },
      auditEvent: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    mockPrisma = {
      certification: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'cert-1',
          certId: 'CERT-2026-001',
          asset: {
            batch: { batchId: 'BATCH-2026-01' },
            evidence: [{ hash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' }],
          },
        }),
      },
      blockchainTransaction: {
        create: vi.fn().mockResolvedValue({ id: 'tx-rec-1', status: 'CREATED' }),
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockTx)),
    };

    mockOutboxService = {
      claimPendingEvents: vi.fn(),
      markCompleted: vi.fn(),
      markFailed: vi.fn(),
    };

    mockBlockchainAdapter = {
      submitTransaction: vi.fn().mockResolvedValue({
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        status: 'CONFIRMED',
      }),
    };

    mockNotificationsService = {
      createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    worker = new WorkerService(
      mockOutboxService,
      mockBlockchainAdapter,
      mockPrisma,
      mockNotificationsService,
    );
  });

  it('should successfully process a PASSPORT_MINT_REQUESTED outbox event', async () => {
    const mockEvent = {
      id: 'outbox-1',
      eventType: 'PASSPORT_MINT_REQUESTED',
      idempotencyKey: 'idem-mint-1',
      payload: {
        certificationId: 'cert-1',
        assetId: 'BEL-RADAR-001',
        certId: 'CERT-2026-001',
      },
    };

    mockOutboxService.claimPendingEvents.mockResolvedValue([mockEvent]);

    // Invoke private processEvents via any
    await (worker as any).processEvents();

    expect(mockBlockchainAdapter.submitTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        data: expect.stringMatching(/^0x/),
      }),
    );
    expect(mockTx.certification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cert-1' },
        data: expect.objectContaining({
          status: 'CONFIRMED',
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        }),
      }),
    );
    expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientRole: 'NFT_CREATOR',
        type: 'CERTIFICATION_MINTED',
      }),
    );
    expect(mockOutboxService.markCompleted).toHaveBeenCalledWith('outbox-1');
  });

  it('should fall back to simulated tx hash if blockchain adapter fails and confirm the cert', async () => {
    const mockEvent = {
      id: 'outbox-2',
      eventType: 'PASSPORT_MINT_REQUESTED',
      idempotencyKey: 'idem-mint-2',
      payload: {
        certificationId: 'cert-1',
        assetId: 'BEL-RADAR-002',
        certId: 'CERT-2026-002',
      },
    };

    mockOutboxService.claimPendingEvents.mockResolvedValue([mockEvent]);
    mockBlockchainAdapter.submitTransaction.mockResolvedValue({ status: 'FAILED' });

    await (worker as any).processEvents();

    expect(mockTx.certification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cert-1' },
        data: expect.objectContaining({
          status: 'CONFIRMED',
          txHash: expect.stringMatching(/^0x/),
        }),
      }),
    );
    expect(mockOutboxService.markCompleted).toHaveBeenCalledWith('outbox-2');
  });
});
