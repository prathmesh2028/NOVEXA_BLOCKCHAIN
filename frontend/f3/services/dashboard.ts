import { api } from './api';

export interface DashboardSummary {
  total_assets: number;
  active_users: number;
  pending_users: number;
  total_certifications: number;
  pending_certifications: number;
  confirmed_certifications: number;
  total_blockchain_txs: number;
  total_audit_events: number;
  lifecycle_breakdown: Record<string, number>;
  failed_verifications: number;
}

export const dashboardService = {
  getSummary: async () => {
    await new Promise(r => setTimeout(r, 600));
    return {
      total_assets: 5,
      active_users: 12,
      pending_users: 2,
      total_certifications: 2,
      pending_certifications: 1,
      confirmed_certifications: 1,
      total_blockchain_txs: 3,
      total_audit_events: 7,
      lifecycle_breakdown: {
        ACCEPTED_FOR_ASSEMBLY: 1,
        INSPECTION_RECORDED: 1,
        REJECTED_QUARANTINED: 1,
        RECEIVED: 1,
        SUPPLIER_DECLARED: 1
      },
      failed_verifications: 1
    } as DashboardSummary;
  }
};
