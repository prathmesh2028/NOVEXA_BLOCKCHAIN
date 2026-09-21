import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

export type CheckResult = 'VALID' | 'INVALID' | 'MISMATCH' | 'MISSING' | 'UNVERIFIED' | 'NOT_APPLICABLE';

export interface VerificationCheck {
  domain: string;
  status: CheckResult;
  reason: string;
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async verifyAsset(assetId: string): Promise<{ asset_id: string; checks: VerificationCheck[]; overall: CheckResult }> {
    const checks: VerificationCheck[] = [];

    try {
      const asset = await this.prisma.asset.findFirst({
        where: { OR: [{ id: assetId }, { assetId }] },
        include: { evidence: true, inspections: true, certifications: true, batch: true },
      });

      if (!asset) {
        return { asset_id: assetId, checks: [{ domain: 'asset', status: 'MISSING', reason: 'Asset not found' }], overall: 'MISSING' };
      }

      // Identity check
      checks.push({
        domain: 'identity',
        status: asset.registeredById ? 'VALID' : 'UNVERIFIED',
        reason: asset.registeredById ? 'Registered by identified actor' : 'No registration identity recorded',
      });

      // Evidence check
      const verifiedEvidence = asset.evidence.filter((e: any) => e.integrityVerified);
      checks.push({
        domain: 'evidence',
        status: asset.evidence.length === 0 ? 'MISSING' : verifiedEvidence.length === asset.evidence.length ? 'VALID' : 'MISMATCH',
        reason: `${verifiedEvidence.length}/${asset.evidence.length} evidence items verified`,
      });

      // Inspection check
      checks.push({
        domain: 'inspection',
        status: asset.inspections.length > 0 ? 'VALID' : asset.lifecycleState === 'UNREGISTERED' || asset.lifecycleState === 'SUPPLIER_DECLARED' ? 'NOT_APPLICABLE' : 'MISSING',
        reason: asset.inspections.length > 0 ? `${asset.inspections.length} inspection(s) recorded` : 'No inspections recorded',
      });

      // Lifecycle check
      checks.push({
        domain: 'lifecycle',
        status: 'VALID',
        reason: `Current state: ${asset.lifecycleState}`,
      });

      // Certification check
      const cert = asset.certifications.find((c: any) => c.status === 'CONFIRMED');
      checks.push({
        domain: 'certification',
        status: cert ? 'VALID' : asset.certifications.length > 0 ? 'UNVERIFIED' : 'NOT_APPLICABLE',
        reason: cert ? `Certified: ${cert.certId}` : 'Not certified',
      });

      // Blockchain check
      checks.push({
        domain: 'blockchain',
        status: cert?.txHash ? 'VALID' : 'UNVERIFIED',
        reason: cert?.txHash ? `On-chain: ${cert.txHash}` : 'No blockchain anchor',
      });

      // Overall
      const hasInvalid = checks.some(c => c.status === 'INVALID' || c.status === 'MISMATCH');
      const allValid = checks.every(c => c.status === 'VALID' || c.status === 'NOT_APPLICABLE');
      const overall: CheckResult = hasInvalid ? 'INVALID' : allValid ? 'VALID' : 'UNVERIFIED';

      return { asset_id: asset.assetId, checks, overall };
    } catch (e: any) {
      this.logger.error(`Verification failed: ${e.message}`);
      throw e;
    }
  }
}
