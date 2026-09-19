import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetsService } from './assets.service';

describe('AssetsService (Fallback & Core)', () => {
  let service: AssetsService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    process.env.APP_ENV = 'demo';
    process.env.NODE_ENV = 'demo';

    mockPrisma = {
      asset: {
        findMany: vi.fn().mockRejectedValue(new Error('Database offline')),
        count: vi.fn().mockRejectedValue(new Error('Database offline')),
        findUnique: vi.fn().mockRejectedValue(new Error('Database offline')),
        findFirst: vi.fn().mockRejectedValue(new Error('Database offline')),
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
