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
    } catch (error: any) {
      this.logger.error('Dashboard summary failed:', error.message);
      // Return default values on database failure
      return {
        total_assets: 0,
        active_users: 0,
        pending_users: 0,
        total_certifications: 0,
        pending_certifications: 0,
        confirmed_certifications: 0,
        total_blockchain_txs: 0,
        total_audit_events: 0,
        lifecycle_breakdown: {},
        failed_verifications: 0,
        error: 'Database unavailable',
      };
    }
  }
}
