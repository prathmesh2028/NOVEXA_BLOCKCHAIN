import { api } from './api';

export interface TechnicalRecordResponse {
  id: string;
  asset_id: string;
  asset_type: string;
  asset_model: string;
  record_type: string;
  data: any;
  classification: string;
  created_at: string;
  updated_at: string;
}

export interface TechnicalRecordListResponse {
  items: TechnicalRecordResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export const technicalRecordsService = {
  listTechnicalRecords: async (params: {
    asset_id?: string;
    record_type?: string;
    page?: number;
    page_size?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.asset_id) query.append('asset_id', params.asset_id);
    if (params.record_type) query.append('record_type', params.record_type);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());

    return api.get<TechnicalRecordListResponse>(`/technical-records?${query.toString()}`);
  },

  getTechnicalRecord: async (id: string) => {
    return api.get<TechnicalRecordResponse>(`/technical-records/${id}`);
  },

  createTechnicalRecord: async (data: {
    asset_id: string;
    record_type: string;
    data: any;
    classification?: string;
  }) => {
    return api.post<TechnicalRecordResponse>('/technical-records', data);
  },
};
