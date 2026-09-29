import { api } from './api';

export interface Inspection {
  id: string;
  assetId: string;
  asset?: {
    id: string;
    assetId: string;
    serialNumber: string;
    lifecycleState: string;
  };
  inspectorId?: string;
  inspectorDid?: string;
  result: 'PASS' | 'FAIL' | 'CONDITIONAL';
  notes?: string;
  evidenceIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InspectionListResponse {
  items: Inspection[];
  total: number;
}

export interface RecordInspectionDto {
  asset_id: string;
  result: 'PASS' | 'FAIL' | 'CONDITIONAL';
  notes?: string;
  evidence_ids?: string[];
}

export const inspectionService = {
  async recordInspection(data: RecordInspectionDto): Promise<Inspection> {
    return api.post<Inspection>('/inspections/record', data);
  },

  async listInspections(assetId?: string): Promise<InspectionListResponse> {
    const params = assetId ? { asset_id: assetId } : {};
    return api.get<InspectionListResponse>('/inspections', params);
  },
};
