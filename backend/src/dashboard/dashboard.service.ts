import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    try {
      const [
        totalAssets, activeUsers, pendingUsers,
        totalCerts, pendingCerts, confirmedCerts,
        totalTxs, totalAudit, failedVerifications,
      ] = await Promise.all([
        this.prisma.asset.count(),
        this.prisma.user.count({ where: { status: 'ACTIVE' } }),
        this.prisma.user.count({ where: { status: 'PENDING' } }),
        this.prisma.certification.count(),
        this.prisma.certification.count({ where: { status: 'PENDING' } }),
        this.prisma.certification.count({ where: { status: 'CONFIRMED' } }),
        this.prisma.blockchainTransaction.count(),
        this.prisma.auditEvent.count(),
        this.prisma.asset.count({ where: { verificationStatus: 'FAILED' } }),
      ]);

      // Lifecycle breakdown
      const lifecycleStates = ['UNREGISTERED', 'SUPPLIER_DECLARED', 'RECEIVED', 'INSPECTION_RECORDED', 'ACCEPTED_FOR_ASSEMBLY', 'REJECTED_QUARANTINED'];
      const breakdown: Record<string, number> = {};
      for (const state of lifecycleStates) {
        breakdown[state] = await this.prisma.asset.count({ where: { lifecycleState: state as any } });
      }

      return {
        total_assets: totalAssets,
        active_users: activeUsers,
        pending_users: pendingUsers,
        total_certifications: totalCerts,
        pending_certifications: pendingCerts,
        confirmed_certifications: confirmedCerts,
        total_blockchain_txs: totalTxs,
        total_audit_events: totalAudit,
        lifecycle_breakdown: breakdown,
        failed_verifications: failedVerifications,
      };
    } catch (e: any) {
      const isDemoMode = process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo';
      if (!isDemoMode) {
        throw e;
      }
      return {
        total_assets: 5,
        active_users: 8,
        pending_users: 1,
        total_certifications: 2,
        pending_certifications: 1,
        confirmed_certifications: 1,
        total_blockchain_txs: 3,
        total_audit_events: 7,
        lifecycle_breakdown: {
          UNREGISTERED: 0,
          SUPPLIER_DECLARED: 1,
          RECEIVED: 1,
          INSPECTION_RECORDED: 1,
          ACCEPTED_FOR_ASSEMBLY: 1,
          REJECTED_QUARANTINED: 1,
        },
        failed_verifications: 1,
      };
    }
  }
}
