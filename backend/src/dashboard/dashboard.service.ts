import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

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
      this.logger.warn(`Database unreachable in getSummary: ${e.message}. Returning demo dashboard summary.`);
      if (process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo' || process.env.NODE_ENV === 'development') {
        return {
          total_assets: 48,
          active_users: 12,
          pending_users: 3,
          total_certifications: 35,
          pending_certifications: 4,
          confirmed_certifications: 31,
          total_blockchain_txs: 142,
          total_audit_events: 289,
          lifecycle_breakdown: {
            UNREGISTERED: 2,
            SUPPLIER_DECLARED: 6,
            RECEIVED: 8,
            INSPECTION_RECORDED: 14,
            ACCEPTED_FOR_ASSEMBLY: 16,
            REJECTED_QUARANTINED: 2,
          },
          failed_verifications: 2,
        };
      }
      throw e;
    }
  }
}
