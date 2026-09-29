import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LifecycleService } from './lifecycle.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('LifecycleService', () => {
  let lifecycleService: LifecycleService;
  let mockPrisma: any;
  let mockTx: any;

  beforeEach(() => {
    mockTx = {
      asset: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      lifecycleEvent: {
        create: vi.fn(),
      },
      auditEvent: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      inspection: {
        findFirst: vi.fn(),
      },
      outboxEvent: {
        create: vi.fn(),
      },
    };

    mockPrisma = {
      lifecycleEvent: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockTx)),
    };

    lifecycleService = new LifecycleService(mockPrisma);
  });

  it('should reject transition if asset is not found', async () => {
    mockPrisma.lifecycleEvent.findUnique.mockResolvedValue(null);
    mockTx.asset.findUnique.mockResolvedValue(null);

    await expect(lifecycleService.transition({
      assetId: 'nonexistent',
      toState: 'RECEIVED',
      actorId: 'usr-1',
      actorRole: 'SYSTEM_ADMIN',
    })).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid transition sequence (e.g. UNREGISTERED directly to ACCEPTED_FOR_ASSEMBLY)', async () => {
    mockPrisma.lifecycleEvent.findUnique.mockResolvedValue(null);
    mockTx.asset.findUnique.mockResolvedValue({
      id: 'ast-1',
      lifecycleState: 'UNREGISTERED',
      version: 1,
    });

    await expect(lifecycleService.transition({
      assetId: 'ast-1',
      toState: 'ACCEPTED_FOR_ASSEMBLY',
      actorId: 'usr-1',
      actorRole: 'SYSTEM_ADMIN',
    })).rejects.toThrow(BadRequestException);
  });

  it('should reject transition if actor role is not permitted', async () => {
    mockPrisma.lifecycleEvent.findUnique.mockResolvedValue(null);
    mockTx.asset.findUnique.mockResolvedValue({
      id: 'ast-1',
      lifecycleState: 'UNREGISTERED',
      version: 1,
    });

    await expect(lifecycleService.transition({
      assetId: 'ast-1',
      toState: 'SUPPLIER_DECLARED',
      actorId: 'usr-1',
      actorRole: 'AUDITOR', // AUDITOR is not in ['QUALITY_INSPECTOR', 'SYSTEM_ADMIN']
    })).rejects.toThrow(ForbiddenException);
  });

  it('should require evidence for RECEIVED -> INSPECTION_RECORDED', async () => {
    mockPrisma.lifecycleEvent.findUnique.mockResolvedValue(null);
    mockTx.asset.findUnique.mockResolvedValue({
      id: 'ast-1',
      lifecycleState: 'RECEIVED',
      version: 1,
    });

    await expect(lifecycleService.transition({
      assetId: 'ast-1',
      toState: 'INSPECTION_RECORDED',
      actorId: 'usr-1',
      actorRole: 'QUALITY_INSPECTOR',
      evidenceIds: [], // missing evidence
    })).rejects.toThrow(BadRequestException);
  });

  it('should succeed with valid transition and idempotency', async () => {
    const existingTransition = { id: 'evt-existing', idempotencyKey: 'idem-key-1' };
    mockPrisma.lifecycleEvent.findUnique.mockResolvedValue(existingTransition);

    const result = await lifecycleService.transition({
      assetId: 'ast-1',
      toState: 'SUPPLIER_DECLARED',
      actorId: 'usr-1',
      actorRole: 'QUALITY_INSPECTOR',
      idempotencyKey: 'idem-key-1',
    });

    expect(result).toEqual(existingTransition);
    // Should return existing without executing transaction
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  describe('detectAndFlagOverdueAssets', () => {
    it('should detect assets past inspectionDueDate and flag them as INSPECTION_OVERDUE', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
      const overdueAsset = {
        id: 'ast-overdue-1',
        assetId: 'BEL-RADAR-001',
        lifecycleState: 'RECEIVED',
        inspectionDueDate: pastDate,
        batch: { batchId: 'BATCH-001' },
      };

      mockPrisma.asset = {
        findMany: vi.fn()
          .mockResolvedValueOnce([overdueAsset]) // overdue query
          .mockResolvedValueOnce([]),            // expiring soon query
      };

      const mockNotificationsService = {
        createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
      };

      lifecycleService = new LifecycleService(mockPrisma, mockNotificationsService as any);

      const result = await lifecycleService.detectAndFlagOverdueAssets('admin-user');

      expect(result.overdueFlaggedCount).toBe(1);
      expect(result.overdueAssets[0].assetId).toBe('BEL-RADAR-001');
      expect(result.overdueAssets[0].status).toBe('FLAGGED_OVERDUE');
      expect(mockTx.asset.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'ast-overdue-1' },
        data: expect.objectContaining({ lifecycleState: 'INSPECTION_OVERDUE' }),
      }));
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(expect.objectContaining({
        type: 'EXPIRY_WARNING',
        recipientRole: 'QUALITY_INSPECTOR',
      }));
    });

    it('should report zero overdue when all assets have future inspectionDueDate', async () => {
      mockPrisma.asset = {
        findMany: vi.fn()
          .mockResolvedValueOnce([]) // no overdue
          .mockResolvedValueOnce([]), // no expiring
      };

      const result = await lifecycleService.detectAndFlagOverdueAssets('admin-user');

      expect(result.overdueFlaggedCount).toBe(0);
      expect(result.overdueAssets).toHaveLength(0);
    });
  });

  describe('getOverdueAssets', () => {
    it('should query assets with INSPECTION_OVERDUE or past inspectionDueDate', async () => {
      const mockOverdueList = [
        { id: 'ast-1', assetId: 'BEL-100', lifecycleState: 'INSPECTION_OVERDUE' },
      ];
      mockPrisma.asset = {
        findMany: vi.fn().mockResolvedValue(mockOverdueList),
      };

      const result = await lifecycleService.getOverdueAssets();
      expect(result).toEqual(mockOverdueList);
      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.any(Array),
        }),
      }));
    });
  });
});
