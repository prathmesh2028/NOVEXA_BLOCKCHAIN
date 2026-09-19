import { api } from './api';
import type { LifecycleState, VerificationStatus, EvidenceStatus, CertStatus } from '../data/mockData';

export interface AssetResponse {
  id: string;
  asset_id: string;
  batch_id: string;
  type: string;
  model: string;
  serial_number: string;
  lifecycle_state: LifecycleState;
  verification_status: VerificationStatus;
  evidence_count: number;
  evidence_status: EvidenceStatus;
  cert_status: CertStatus;
  cert_id: string | null;
  supplier: string;
  description: string | null;
  registered_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetListResponse {
  items: AssetResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export const assetService = {
  listAssets: async (params: { search?: string; lifecycle?: string; page?: number; page_size?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.lifecycle) query.append('lifecycle', params.lifecycle);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    
    return api.get<AssetListResponse>(`/assets?${query.toString()}`);
  },

  getAsset: async (id: string) => {
    return api.get<AssetResponse>(`/assets/${id}`);
  },

  createAsset: async (data: {
    assetId: string;
    batchId: string;
    type: string;
    model: string;
    serialNumber: string;
    supplier?: string;
    description?: string;
  }) => {
    return api.post<AssetResponse>('/assets', data);
  }
};
