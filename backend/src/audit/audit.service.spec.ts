import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let auditService: AuditService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      auditEvent: {
        findFirst: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };
    auditService = new AuditService(mockPrisma);
  });

  describe('recordEvent', () => {
    it('should link first event to genesis hash (64 zeros)', async () => {
      mockPrisma.auditEvent.findFirst.mockResolvedValue(null);
      mockPrisma.auditEvent.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'evt-1', ...data }));

      const event = await auditService.recordEvent({
        eventType: 'ASSET_CREATED',
        action: 'CREATE',
        resourceType: 'ASSET',
        resourceId: 'ast-101',
        payload: { name: 'Radar Subsystem' },
      });

      expect(event.previousHash).toBe('0'.repeat(64));
      expect(event.payloadHash).toBeDefined();
      expect(mockPrisma.auditEvent.create).toHaveBeenCalled();
    });

    it('should chain previous event hash to new event', async () => {
      const prevHash = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      mockPrisma.auditEvent.findFirst.mockResolvedValue({ payloadHash: prevHash });
      mockPrisma.auditEvent.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'evt-2', ...data }));

      const event = await auditService.recordEvent({
        eventType: 'ASSET_TRANSITION',
        action: 'TRANSITION',
        payload: { state: 'RECEIVED' },
      });

      expect(event.previousHash).toBe(prevHash);
    });
  });

  describe('verifyChain', () => {
    it('should verify a valid hash chain', async () => {
      const h1 = '1111111111111111111111111111111111111111111111111111111111111111';
      const h2 = '2222222222222222222222222222222222222222222222222222222222222222';
      mockPrisma.auditEvent.findMany.mockResolvedValue([
        { id: '1', previousHash: '0'.repeat(64), payloadHash: h1 },
        { id: '2', previousHash: h1, payloadHash: h2 },
      ]);

      const result = await auditService.verifyChain();
      expect(result.valid).toBe(true);
      expect(result.checked).toBe(2);
    });

    it('should detect a broken hash chain when tampering occurs', async () => {
      const h1 = '1111111111111111111111111111111111111111111111111111111111111111';
      const corruptedPrevious = 'tampered_previous_hash';
      mockPrisma.auditEvent.findMany.mockResolvedValue([
        { id: '1', previousHash: '0'.repeat(64), payloadHash: h1 },
        { id: '2', previousHash: corruptedPrevious, payloadHash: 'some_hash' },
      ]);

      const result = await auditService.verifyChain();
      expect(result.valid).toBe(false);
      expect(result.brokenAt).toBe('2');
    });
  });
});
