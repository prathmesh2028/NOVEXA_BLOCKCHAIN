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
    const { AUDIT_EVENTS } = await import('../data/mockData');
    
    await new Promise(r => setTimeout(r, 600));

    let items = AUDIT_EVENTS;
    if (params.resource_id) {
      items = items.filter(e => e.assetId === params.resource_id || e.evidenceId === params.resource_id || e.certId === params.resource_id);
    }
    if (params.actor_role) {
      items = items.filter(e => e.actorRole === params.actor_role);
    }

    const mapped = items.map(e => ({
      id: e.id,
      event_type: e.action, // Approx mapping
      actor_did: e.actorDid,
      actor_role: e.actorRole,
      action: e.action,
      resource_type: e.assetId ? 'Asset' : (e.evidenceId ? 'Evidence' : 'System'),
      resource_id: e.assetId || e.evidenceId || e.certId || 'SYS',
      timestamp: e.timestamp,
      result: e.result,
      details: e.details,
      blockchain_tx_hash: e.blockchainTx || null
    }));

    return {
      items: mapped,
      total: mapped.length,
      page: params.page || 1,
      page_size: params.page_size || 100,
      has_next: false
    } as unknown as AuditListResponse;
  }
};
