import { api } from './api';

export interface AuditEventResponse {
  id: string;
  event_type: string;
  actor_did: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  result: string;
  details: string | null;
  blockchain_tx_hash: string | null;
}

export interface AuditListResponse {
  items: AuditEventResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export const auditService = {
  listAuditEvents: async (params: { resource_id?: string; event_type?: string; actor_role?: string; page?: number; page_size?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.resource_id) query.append('resource_id', params.resource_id);
    if (params.event_type) query.append('event_type', params.event_type);
    if (params.actor_role) query.append('actor_role', params.actor_role);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    
    return api.get<AuditListResponse>(`/audit/events?${query.toString()}`);
  }
};
