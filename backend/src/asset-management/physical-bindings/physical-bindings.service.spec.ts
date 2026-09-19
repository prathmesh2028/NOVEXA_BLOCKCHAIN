import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PhysicalBindingsService } from './physical-bindings.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('PhysicalBindingsService', () => {
  let service: PhysicalBindingsService;
  let mockPrisma: any;
  let mockAuditService: any;
  let mockTx: any;

  beforeEach(() => {
    mockTx = {
      physicalBinding: {
        create: vi.fn(),
        delete: vi.fn(),
      },
    };

    mockPrisma = {
      asset: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
      },
      physicalBinding: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockTx)),
    };

    mockAuditService = {
      recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    service = new PhysicalBindingsService(mockPrisma, mockAuditService);
  });

  describe('createBinding', () => {
    it('should throw BadRequestException if required fields are missing', async () => {
      await expect(
        service.createBinding({ assetId: '', bindingType: '', identifier: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if asset does not exist', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);

      await expect(
        service.createBinding({
          assetId: 'non-existent',
          bindingType: 'QR_CODE',
          identifier: 'QR-123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if binding already exists for this asset', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue({ id: 'ast-1', assetId: 'BEL-RADAR-001' });
      mockPrisma.physicalBinding.findFirst.mockResolvedValue({ id: 'pb-existing' });

      await expect(
        service.createBinding({
          assetId: 'ast-1',
          bindingType: 'RFID',
          identifier: 'RFID-999',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully create physical binding and record audit event', async () => {
      const mockAsset = { id: 'ast-1', assetId: 'BEL-RADAR-001', type: 'RADAR', model: 'BEL-X' };
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset);
      mockPrisma.physicalBinding.findFirst.mockResolvedValue(null);

      const createdRecord = {
        id: 'pb-1',
        assetId: 'ast-1',
        bindingType: 'CRYPTO_TAG',
        identifier: 'TAG-555',
        metadata: { secureElement: true },
        createdAt: new Date(),
        asset: mockAsset,
      };
      mockTx.physicalBinding.create.mockResolvedValue(createdRecord);

      const result = await service.createBinding({
        assetId: 'ast-1',
        bindingType: 'CRYPTO_TAG',
        identifier: 'TAG-555',
        metadata: { secureElement: true },
        actorId: 'tech-user',
        actorName: 'Tech User',
      });

      expect(result.id).toBe('pb-1');
      expect(result.binding_type).toBe('CRYPTO_TAG');
      expect(result.identifier).toBe('TAG-555');
      expect(mockAuditService.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PHYSICAL_BINDING_CREATED',
          resourceType: 'PhysicalBinding',
          resourceId: 'pb-1',
          result: 'SUCCESS',
        }),
        mockTx,
      );
    });
  });

  describe('listBindings', () => {
    it('should list all bindings or filter by asset', async () => {
      mockPrisma.asset.findFirst.mockResolvedValue({ id: 'ast-1', assetId: 'BEL-001' });
      mockPrisma.physicalBinding.findMany.mockResolvedValue([
        {
          id: 'pb-1',
          assetId: 'ast-1',
          bindingType: 'QR_CODE',
          identifier: 'QR-1',
          createdAt: new Date(),
        },
      ]);

      const result = await service.listBindings('BEL-001');
      expect(result.total).toBe(1);
      expect(result.items[0].identifier).toBe('QR-1');
    });
  });

  describe('deleteBinding', () => {
    it('should delete existing binding and record audit event', async () => {
      mockPrisma.physicalBinding.findUnique.mockResolvedValue({
        id: 'pb-1',
        bindingType: 'QR_CODE',
        identifier: 'QR-1',
        assetId: 'ast-1',
        asset: { assetId: 'BEL-001' },
      });

      const result = await service.deleteBinding('pb-1', 'admin-user', 'Admin');
      expect(result).toEqual({ success: true, id: 'pb-1' });
      expect(mockTx.physicalBinding.delete).toHaveBeenCalledWith({ where: { id: 'pb-1' } });
      expect(mockAuditService.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PHYSICAL_BINDING_DELETED',
          resourceType: 'PhysicalBinding',
          resourceId: 'pb-1',
        }),
        mockTx,
      );
    });

    it('should throw NotFoundException on deleting non-existent binding', async () => {
      mockPrisma.physicalBinding.findUnique.mockResolvedValue(null);

      await expect(service.deleteBinding('pb-nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
