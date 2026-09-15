import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerificationService } from './verification.service';

describe('VerificationService', () => {
  let verificationService: VerificationService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      asset: {
        findFirst: vi.fn(),
      },
    };
    verificationService = new VerificationService(mockPrisma);
  });

  it('should return MISSING when asset does not exist', async () => {
    mockPrisma.asset.findFirst.mockResolvedValue(null);

    const result = await verificationService.verifyAsset('NONEXISTENT');
    expect(result.overall).toBe('MISSING');
    expect(result.checks[0].status).toBe('MISSING');
  });

  it('should verify complete asset with all valid domains', async () => {
    mockPrisma.asset.findFirst.mockResolvedValue({
      id: 'ast-1',
      assetId: 'BEL-RADAR-001',
      registeredById: 'usr-1',
      lifecycleState: 'ACCEPTED_FOR_ASSEMBLY',
      evidence: [
        { id: 'ev-1', integrityVerified: true },
        { id: 'ev-2', integrityVerified: true },
      ],
      inspections: [
        { id: 'insp-1', result: 'PASS' },
      ],
      certifications: [
        { id: 'cert-1', certId: 'CERT-001', status: 'CONFIRMED', txHash: '0x123abc' },
      ],
    });

    const result = await verificationService.verifyAsset('BEL-RADAR-001');
    expect(result.overall).toBe('VALID');
    expect(result.checks.find(c => c.domain === 'evidence')?.status).toBe('VALID');
    expect(result.checks.find(c => c.domain === 'blockchain')?.status).toBe('VALID');
    expect(result.checks.find(c => c.domain === 'identity')?.status).toBe('VALID');
  });

  it('should flag MISMATCH and overall INVALID if unverified evidence is present', async () => {
    mockPrisma.asset.findFirst.mockResolvedValue({
      id: 'ast-2',
      assetId: 'BEL-OPT-002',
      registeredById: 'usr-1',
      lifecycleState: 'RECEIVED',
      evidence: [
        { id: 'ev-1', integrityVerified: true },
        { id: 'ev-2', integrityVerified: false }, // mismatch/unverified
      ],
      inspections: [],
      certifications: [],
    });

    const result = await verificationService.verifyAsset('BEL-OPT-002');
    expect(result.overall).toBe('INVALID');
    expect(result.checks.find(c => c.domain === 'evidence')?.status).toBe('MISMATCH');
  });
});
