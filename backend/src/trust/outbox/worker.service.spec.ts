import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkerService } from './worker.service';

describe('WorkerService (Outbox Blockchain Processing)', () => {
  let worker: WorkerService;
  let mockOutboxService: any;
  let mockBlockchainAdapter: any;
  let mockPrisma: any;
  let mockTx: any;
  let mockNotificationsService: any;
  let mockAuditService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockTx = {
      certification: {
        update: vi.fn().mockResolvedValue({
          id: 'cert-1',
          certId: 'CERT-2026-001',
          assetId: 'ast-1',
          status: 'CONFIRMED',
          tokenId: '42',
        }),
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
          issuedById: 'user-issuer-1',
          asset: {
            batch: { batchId: 'BATCH-2026-01' },
            evidence: [{ hash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' }],
            registeredById: 'user-reg-1',
          },
        }),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-reg-1',
          walletBindings: [{ address: '0x1111111111111111111111111111111111111111', verified: true }],
        }),
      },
      blockchainTransaction: {
        create: vi.fn().mockResolvedValue({ id: 'tx-rec-1', status: 'CREATED' }),
        update: vi.fn().mockResolvedValue({ id: 'tx-rec-1' }),
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
        status: 'SUBMITTED',
      }),
      getTransactionReceipt: vi.fn().mockResolvedValue({
        status: 'success',
        blockNumber: 100n,
        gasUsed: 21000n,
        logs: [],
      }),
      decodeCertificationMintedEvent: vi.fn().mockReturnValue({
        to: '0x1111111111111111111111111111111111111111',
        tokenId: 42n,
        assetId: 'BEL-RADAR-001',
        batchId: 'BATCH-2026-01',
        evidenceHash: '0xabc',
      }),
      getBlockNumber: vi.fn().mockResolvedValue(100),
    };

    mockNotificationsService = {
      createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    mockAuditService = {
      recordEvent: vi.fn().mockResolvedValue({ id: 'audit-event-1' }),
    };

    mockConfigService = {
      blockchainMode: 'real',
      blockchainConfirmationsRequired: 1,
      defaultNftRecipient: '0x1111111111111111111111111111111111111111',
    };

    worker = new WorkerService(
      mockOutboxService,
      mockBlockchainAdapter,
      mockPrisma,
      mockNotificationsService,
      mockAuditService,
      mockConfigService,
    );
  });

  it('should successfully process real blockchain mint with receipt and tokenId decoding', async () => {
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

    await (worker as any).processEvents();

    // Verify submission
    expect(mockBlockchainAdapter.submitTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        data: expect.stringMatching(/^0x/),
      }),
    );

    // Verify receipt fetching and decoding
    expect(mockBlockchainAdapter.getTransactionReceipt).toHaveBeenCalledWith(
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    );
    expect(mockBlockchainAdapter.decodeCertificationMintedEvent).toHaveBeenCalled();

    // Verify DB update with confirmed tokenId
    expect(mockTx.certification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cert-1' },
        data: expect.objectContaining({
          status: 'CONFIRMED',
          tokenId: '42',
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        }),
      }),
    );

    // Verify canonical audit event was emitted
    expect(mockAuditService.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'PASSPORT_MINT_CONFIRMED',
        resourceId: 'cert-1',
      }),
      mockTx,
    );

    expect(mockOutboxService.markCompleted).toHaveBeenCalledWith('outbox-1');
  });

  it('should NOT generate fake simulated hashes in real mode when RPC submission fails', async () => {
    const mockEvent = {
      id: 'outbox-fail-1',
      eventType: 'PASSPORT_MINT_REQUESTED',
      idempotencyKey: 'idem-mint-fail',
      payload: {
        certificationId: 'cert-1',
        assetId: 'BEL-RADAR-001',
        certId: 'CERT-2026-001',
      },
    };

    mockOutboxService.claimPendingEvents.mockResolvedValue([mockEvent]);
    mockBlockchainAdapter.submitTransaction.mockResolvedValue({ status: 'FAILED' });

    await (worker as any).processEvents();

    // In real mode, certification must NOT be confirmed on RPC failure
    expect(mockTx.certification.update).not.toHaveBeenCalled();
    // Outbox event must be marked failed for retry
    expect(mockOutboxService.markFailed).toHaveBeenCalledWith(
      'outbox-fail-1',
      expect.stringContaining('Blockchain submission failed'),
    );
  });

  it('should fail and mark REVERTED if receipt status is reverted', async () => {
    const mockEvent = {
      id: 'outbox-revert-1',
      eventType: 'PASSPORT_MINT_REQUESTED',
      idempotencyKey: 'idem-mint-revert',
      payload: {
        certificationId: 'cert-1',
        assetId: 'BEL-RADAR-001',
        certId: 'CERT-2026-001',
      },
    };

    mockOutboxService.claimPendingEvents.mockResolvedValue([mockEvent]);
    mockBlockchainAdapter.getTransactionReceipt.mockResolvedValue({
      status: 'reverted',
      blockNumber: 101n,
    });

    await (worker as any).processEvents();

    expect(mockTx.certification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cert-1' },
        data: expect.objectContaining({ status: 'FAILED' }),
      }),
    );
    expect(mockOutboxService.markFailed).toHaveBeenCalledWith(
      'outbox-revert-1',
      expect.stringContaining('reverted on-chain'),
    );
  });

  it('should hold status in MINED when confirmations are below required threshold', async () => {
    mockConfigService.blockchainConfirmationsRequired = 5;
    mockBlockchainAdapter.getBlockNumber.mockResolvedValue(101); // 101 - 100 + 1 = 2 confirmations (< 5 required)

    const mockEvent = {
      id: 'outbox-conf-1',
      eventType: 'PASSPORT_MINT_REQUESTED',
      idempotencyKey: 'idem-mint-conf',
      payload: {
        certificationId: 'cert-1',
        assetId: 'BEL-RADAR-001',
        certId: 'CERT-2026-001',
      },
    };

    mockOutboxService.claimPendingEvents.mockResolvedValue([mockEvent]);

    await (worker as any).processEvents();

    // Must NOT confirm yet
    expect(mockTx.certification.update).not.toHaveBeenCalled();
    // Must update blockchainTransaction to MINED
    expect(mockPrisma.blockchainTransaction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'tx-rec-1' },
        data: expect.objectContaining({
          status: 'MINED',
          confirmations: 2,
        }),
      }),
    );
    // Should NOT mark completed yet
    expect(mockOutboxService.markCompleted).not.toHaveBeenCalled();
  });

  it('should fall back to simulated tx hash in demo mode if explicitly configured', async () => {
    mockConfigService.blockchainMode = 'demo';

    const mockEvent = {
      id: 'outbox-demo-1',
      eventType: 'PASSPORT_MINT_REQUESTED',
      idempotencyKey: 'idem-mint-demo',
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
          txHash: expect.stringMatching(/^0xDEMO_/),
        }),
      }),
    );
    expect(mockOutboxService.markCompleted).toHaveBeenCalledWith('outbox-demo-1');
  });
});
