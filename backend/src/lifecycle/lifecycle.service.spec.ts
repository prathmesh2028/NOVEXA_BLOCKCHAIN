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
      actorRole: 'ADMIN',
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
      actorRole: 'ADMIN',
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
      actorRole: 'AUDITOR', // AUDITOR is not in ['TECHNICIAN', 'ADMIN']
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
      actorRole: 'TECHNICIAN',
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
      actorRole: 'TECHNICIAN',
      idempotencyKey: 'idem-key-1',
    });

    expect(result).toEqual(existingTransition);
    // Should return existing without executing transaction
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});
