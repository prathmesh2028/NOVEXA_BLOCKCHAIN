import { api } from './api';

export interface EvidenceResponse {
  id: string;
  evidence_id: string;
  asset_id: string;
  filename: string;
  type: string;
  mime_type: string;
  size_kb: number;
  status: string;
  hash: string;
  event: string;
  integrity_verified: boolean;
  blockchain_tx: string | null;
  created_at: string;
}

export interface EvidenceListResponse {
  items: EvidenceResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export const evidenceService = {
  listEvidence: async (params: { asset_id?: string; event_type?: string; page?: number; page_size?: number } = {}) => {
    // Demo implementation using mockData
    const { EVIDENCE_LIST } = await import('../data/mockData');
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    let items = EVIDENCE_LIST;
    if (params.asset_id) {
      items = items.filter(e => e.assetId === params.asset_id);
    }

    const mapped = items.map(e => ({
      id: e.id,
      evidence_id: e.id,
      asset_id: e.assetId,
      filename: e.filename,
      type: e.type,
      mime_type: e.mimeType,
      size_kb: e.sizeKb,
      status: e.status,
      hash: e.hash,
      event: e.event,
      integrity_verified: e.integrityVerified,
      blockchain_tx: e.blockchainTx || null,
      created_at: e.uploadedAt
    }));

    return {
      items: mapped,
      total: mapped.length,
      page: params.page || 1,
      page_size: params.page_size || 100,
      has_next: false
    } as unknown as EvidenceListResponse;
  }
};
