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
    return api.get<DashboardSummary>('/dashboard/summary');
  }
};
