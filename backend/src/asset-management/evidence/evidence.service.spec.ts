import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvidenceService } from './evidence.service';
import { NotFoundException } from '@nestjs/common';

describe('EvidenceService', () => {
  let service: EvidenceService;
  let mockPrisma: any;
  let mockMinio: any;
  let mockAuditService: any;
  let mockTx: any;

  beforeEach(() => {
    mockTx = {
      evidence: {
        create: vi.fn(),
      },
      evidenceVersion: {
        create: vi.fn(),
      },
      asset: {
        update: vi.fn(),
      },
    };

    mockPrisma = {
      asset: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
      },
      evidence: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockTx)),
    };

    mockMinio = {
      uploadFile: vi.fn().mockResolvedValue('evidence/test-key-123.pdf'),
      downloadFile: vi.fn().mockResolvedValue(Buffer.from('dummy file contents')),
      calculateHash: vi.fn().mockReturnValue('abc123hash'),
    };

    mockAuditService = {
      recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    service = new EvidenceService(mockPrisma, mockMinio, mockAuditService);
  });

  describe('downloadEvidence', () => {
    it('should throw NotFoundException if evidence record does not exist', async () => {
      mockPrisma.evidence.findUnique.mockResolvedValue(null);

      await expect(service.downloadEvidence('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if evidence record has no objectKey', async () => {
      mockPrisma.evidence.findUnique.mockResolvedValue({
        id: 'ev-1',
        filename: 'report.pdf',
        objectKey: null,
      });

      await expect(service.downloadEvidence('ev-1')).rejects.toThrow(
        'Evidence ev-1 has no stored object key',
      );
    });

    it('should successfully download file buffer via minio using objectKey', async () => {
      mockPrisma.evidence.findUnique.mockResolvedValue({
        id: 'ev-1',
        filename: 'inspection-report.pdf',
        objectKey: 'evidence/inspection-report-uuid.pdf',
        mimeType: 'application/pdf',
        sizeKb: 120,
      });

      const result = await service.downloadEvidence('ev-1');

      expect(result.filename).toBe('inspection-report.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(mockMinio.downloadFile).toHaveBeenCalledWith('evidence/inspection-report-uuid.pdf');
    });
  });

  describe('uploadEvidence', () => {
    it('should persist objectKey and record canonical audit event', async () => {
      mockPrisma.asset.findFirst.mockResolvedValue({
        id: 'ast-1',
        assetId: 'BEL-RADAR-001',
        evidenceCount: 0,
      });

      mockTx.evidence.create.mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: 'ev-1',
          ...data,
          createdAt: new Date(),
        }),
      );

      const result = await service.uploadEvidence({
        assetId: 'ast-1',
        filename: 'spec.pdf',
        type: 'SPECIFICATION',
        mimeType: 'application/pdf',
        sizeKb: 1,
        content: Buffer.from('test content'),
        event: 'ASSET_REGISTERED',
        uploadedById: 'user-1',
        uploadedByName: 'Tech User',
      });

      expect(mockMinio.uploadFile).toHaveBeenCalled();
      expect(mockTx.evidence.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            objectKey: expect.stringMatching(/^BEL-RADAR-001\/EVD-.*-spec\.pdf$/),
            filename: 'spec.pdf',
            mimeType: 'application/pdf',
          }),
        }),
      );

      expect(mockAuditService.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'EVIDENCE_UPLOADED',
          resourceType: 'Evidence',
          resourceId: 'ev-1',
          result: 'SUCCESS',
        }),
        mockTx,
      );
    });
  });
});
