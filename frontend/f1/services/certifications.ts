import { api } from './api';

export interface CertificationResponse {
  id: string;
  cert_id: string;
  asset_id: string;
  batch_id: string;
  token_id: string | null;
  contract_address: string | null;
  network: string | null;
  tx_hash: string | null;
  block_number: number | null;
  status: string;
  issued_by: string | null;
  issued_at: string;
  confirmed_at: string | null;
  confirmations: number;
}

export interface CertificationListResponse {
  items: CertificationResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export const certificationService = {
  listCertifications: async (params: { status_filter?: string; page?: number; page_size?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status_filter) query.append('status_filter', params.status_filter);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    
    return api.get<CertificationListResponse>(`/certifications?${query.toString()}`);
  },

  getCertification: async (id: string) => {
    return api.get<CertificationResponse>(`/certifications/${id}`);
  }
};
