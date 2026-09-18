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
    const query = new URLSearchParams();
    if (params.asset_id) query.append('asset_id', params.asset_id);
    if (params.event_type) query.append('event_type', params.event_type);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    
    return api.get<EvidenceListResponse>(`/evidence?${query.toString()}`);
  },

  getEvidence: async (id: string) => {
    return api.get<EvidenceResponse>(`/evidence/${id}`);
  },

  uploadEvidence: async (data: {
    asset_id: string;
    filename: string;
    type?: string;
    mime_type?: string;
    size_kb?: number;
    content_base64: string;
    event?: string;
  }) => {
    return api.post<EvidenceResponse>('/evidence', data);
  }
};
