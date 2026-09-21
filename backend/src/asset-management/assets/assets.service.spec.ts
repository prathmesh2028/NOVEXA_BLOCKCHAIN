import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetsService } from './assets.service';

describe('AssetsService (Core & Filtering)', () => {
  let service: AssetsService;
  let mockPrisma: any;
  let mockAudit: any;

  const mockAssets: any[] = [
    {
      id: 'ast-1',
      assetId: 'EF-2026-00421',
      batchRefId: 'batch-1',
      type: 'Electronic Fuze',
      model: 'EF-MK4-SYNTH',
      serialNumber: 'SN-EF-00421',
      supplier: 'BEL Synthetic Procurement Div.',
      lifecycleState: 'ACCEPTED_FOR_ASSEMBLY',
      verificationStatus: 'VERIFIED',
      evidenceCount: 4,
      evidenceStatus: 'COMPLETE',
      certStatus: 'NOT_CERTIFIED',
      certId: null,
      registeredByName: 'Rajesh Kumar',
      createdAt: new Date('2026-08-15T09:22:00Z'),
      updatedAt: new Date('2026-08-15T09:22:00Z'),
      batch: { batchId: 'EF-BATCH-2026-017' },
      evidence: [{ integrityVerified: true }],
      certifications: [],
    },
    {
      id: 'ast-2',
      assetId: 'EF-2026-00422',
      batchRefId: 'batch-1',
      type: 'Electronic Fuze',
      model: 'EF-MK4-SYNTH',
      serialNumber: 'SN-EF-00422',
      supplier: 'BEL Synthetic Procurement Div.',
      lifecycleState: 'INSPECTION_RECORDED',
      verificationStatus: 'REVIEW_REQUIRED',
      evidenceCount: 2,
      evidenceStatus: 'PROCESSING',
      certStatus: 'PENDING',
      certId: 'CERT-2026-00088',
      registeredByName: 'Rajesh Kumar',
      createdAt: new Date('2026-08-15T09:25:00Z'),
      updatedAt: new Date('2026-08-15T09:25:00Z'),
      batch: { batchId: 'EF-BATCH-2026-017' },
      evidence: [],
      certifications: [{ status: 'PENDING' }],
    },
    {
      id: 'ast-3',
      assetId: 'EF-2026-00423',
      batchRefId: 'batch-1',
      type: 'Electronic Fuze',
      model: 'EF-MK4-SYNTH',
      serialNumber: 'SN-EF-00423',
      supplier: 'BEL Synthetic Procurement Div.',
      lifecycleState: 'REJECTED_QUARANTINED',
      verificationStatus: 'FAILED',
      evidenceCount: 3,
      evidenceStatus: 'FAILED',
      certStatus: 'NOT_CERTIFIED',
      certId: null,
      registeredByName: 'Rajesh Kumar',
      createdAt: new Date('2026-08-15T09:28:00Z'),
      updatedAt: new Date('2026-08-15T09:28:00Z'),
      batch: { batchId: 'EF-BATCH-2026-017' },
      evidence: [],
      certifications: [],
    },
    {
      id: 'ast-4',
      assetId: 'PT-2026-00105',
      batchRefId: 'batch-2',
      type: 'Pressure Transducer',
      model: 'PT-SEN-SYNTH',
      serialNumber: 'SN-PT-00105',
      supplier: 'BEL Synthetic Sensors Div.',
      lifecycleState: 'RECEIVED',
      verificationStatus: 'PENDING',
      evidenceCount: 1,
      evidenceStatus: 'UPLOADING',
      certStatus: 'NOT_CERTIFIED',
      certId: null,
      registeredByName: 'Rajesh Kumar',
      createdAt: new Date('2026-09-01T10:00:00Z'),
      updatedAt: new Date('2026-09-01T10:00:00Z'),
      batch: { batchId: 'PT-BATCH-2026-004' },
      evidence: [],
      certifications: [],
    },
  ];

  function filterAssets(where: any = {}) {
    return mockAssets.filter((a) => {
      if (where.lifecycleState && a.lifecycleState !== where.lifecycleState) return false;
      if (where.certStatus) {
        if (typeof where.certStatus === 'object' && where.certStatus.not) {
          if (a.certStatus === where.certStatus.not) return false;
        } else if (a.certStatus !== where.certStatus) {
          return false;
        }
      }
      if (where.OR && Array.isArray(where.OR)) {
        const matchesOr = where.OR.some((clause: any) => {
          if (clause.assetId?.contains) {
            return a.assetId.toLowerCase().includes(clause.assetId.contains.toLowerCase());
          }
          if (clause.serialNumber?.contains) {
            return a.serialNumber.toLowerCase().includes(clause.serialNumber.contains.toLowerCase());
          }
          if (clause.type?.contains) {
            return a.type.toLowerCase().includes(clause.type.contains.toLowerCase());
          }
          if (clause.model?.contains) {
            return a.model.toLowerCase().includes(clause.model.contains.toLowerCase());
          }
          return false;
        });
        if (!matchesOr) return false;
      }
      return true;
    });
  }

  beforeEach(() => {
    process.env.APP_ENV = 'demo';
    process.env.NODE_ENV = 'demo';

    mockPrisma = {
      asset: {
        findMany: vi.fn().mockImplementation(async (params: any = {}) => {
          const filtered = filterAssets(params.where);
          const skip = params.skip || 0;
          const take = params.take !== undefined ? params.take : filtered.length;
          return filtered.slice(skip, skip + take);
        }),
        count: vi.fn().mockImplementation(async (params: any = {}) => {
          return filterAssets(params?.where).length;
        }),
        findUnique: vi.fn().mockImplementation(async ({ where }: any) => {
          return mockAssets.find((a) => a.id === where?.id || a.assetId === where?.assetId) || null;
        }),
        findFirst: vi.fn().mockImplementation(async ({ where }: any) => {
          if (where?.OR) {
            const ids = where.OR.map((o: any) => o.id || o.assetId);
            return mockAssets.find((a) => ids.includes(a.id) || ids.includes(a.assetId)) || null;
          }
          return mockAssets.find((a) => a.id === where?.id || a.assetId === where?.assetId) || null;
        }),
      },
      batch: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    mockAudit = {
      recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    service = new AssetsService(mockPrisma, mockAudit);
  });

  describe('listAssets (Fallback & Filtering)', () => {
    it('returns all assets when no filter is applied', async () => {
      const res = await service.listAssets({});
      expect(res.items.length).toBeGreaterThan(0);
      expect(res.total).toBe(res.items.length);
      expect(res.page).toBe(1);
    });

    it('filters assets by search query (Asset ID)', async () => {
      const res = await service.listAssets({ search: 'EF-2026-00421' });
      expect(res.items.length).toBe(1);
      expect(res.items[0].asset_id).toBe('EF-2026-00421');
      expect(res.total).toBe(1);
    });

    it('filters assets by search query (case-insensitive serial number)', async () => {
      const res = await service.listAssets({ search: 'sn-ef-00421' });
      expect(res.items.length).toBe(1);
      expect(res.items[0].serial_number).toBe('SN-EF-00421');
    });

    it('filters assets by lifecycle state', async () => {
      const res = await service.listAssets({ lifecycle: 'ACCEPTED_FOR_ASSEMBLY' });
      expect(res.items.length).toBeGreaterThan(0);
      res.items.forEach(item => {
        expect(item.lifecycle_state).toBe('ACCEPTED_FOR_ASSEMBLY');
      });
    });

    it('combines search and lifecycle filtering correctly', async () => {
      const res = await service.listAssets({
        search: 'Electronic Fuze',
        lifecycle: 'ACCEPTED_FOR_ASSEMBLY',
      });
      expect(res.items.length).toBe(1);
      expect(res.items[0].asset_id).toBe('EF-2026-00421');
    });

    it('returns empty list when search matches nothing', async () => {
      const res = await service.listAssets({ search: 'NONEXISTENT_ASSET_XYZ' });
      expect(res.items).toHaveLength(0);
      expect(res.total).toBe(0);
    });

    it('preserves pagination on fallback data', async () => {
      const page1 = await service.listAssets({ page: 1, page_size: 2 });
      expect(page1.items).toHaveLength(2);
      expect(page1.has_next).toBe(true);

      const page2 = await service.listAssets({ page: 2, page_size: 2 });
      expect(page2.items).toHaveLength(2);
      expect(page2.items[0].id).not.toBe(page1.items[0].id);
    });
  });

  describe('getAssetQr', () => {
    it('generates a valid QR data URL and verification payload', async () => {
      const qr = await service.getAssetQr('EF-2026-00421');
      expect(qr.asset_id).toBe('EF-2026-00421');
      expect(qr.verification_url).toContain('/app/verification?id=EF-2026-00421');
      expect(qr.qr_data_url).toMatch(/^data:image\/png;base64,/);
      
      const parsed = JSON.parse(qr.qr_payload);
      expect(parsed.asset_id).toBe('EF-2026-00421');
      expect(parsed.serial_number).toBe('SN-EF-00421');
    });
  });

  describe('getEligibleAssets', () => {
    it('returns eligible assets in fallback mode', async () => {
      const res = await service.getEligibleAssets();
      expect(res.items.length).toBeGreaterThan(0);
      expect(res.eligibility_criteria.lifecycle_state).toBe('ACCEPTED_FOR_ASSEMBLY');
    });
  });
});
