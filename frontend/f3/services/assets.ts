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
    const { ASSETS } = await import('../data/mockData');
    
    await new Promise(r => setTimeout(r, 600));

    let items = ASSETS;
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(a => a.id.toLowerCase().includes(q) || a.batchId.toLowerCase().includes(q) || a.type.toLowerCase().includes(q));
    }
    if (params.lifecycle && params.lifecycle !== "ALL") {
      items = items.filter(a => a.lifecycle === params.lifecycle);
    }

    const mapped = items.map(a => ({
      id: a.id,
      asset_id: a.id,
      batch_id: a.batchId,
      type: a.type,
      model: a.model,
      serial_number: a.serialNumber,
      lifecycle_state: a.lifecycle,
      verification_status: a.verification,
      evidence_count: a.evidenceCount,
      evidence_status: a.evidenceStatus,
      cert_status: a.certStatus,
      cert_id: a.certId || null,
      supplier: a.supplier,
      description: a.description,
      registered_by_name: a.registeredBy,
      created_at: a.registeredAt,
      updated_at: a.updatedAt
    }));

    return {
      items: mapped,
      total: mapped.length,
      page: params.page || 1,
      page_size: params.page_size || 100,
      has_next: false
    } as unknown as AssetListResponse;
  },

  getAsset: async (id: string) => {
    const { ASSETS } = await import('../data/mockData');
    await new Promise(r => setTimeout(r, 400));
    const a = ASSETS.find(a => a.id === id);
    if (!a) throw new Error("Not found");
    return {
      id: a.id,
      asset_id: a.id,
      batch_id: a.batchId,
      type: a.type,
      model: a.model,
      serial_number: a.serialNumber,
      lifecycle_state: a.lifecycle,
      verification_status: a.verification,
      evidence_count: a.evidenceCount,
      evidence_status: a.evidenceStatus,
      cert_status: a.certStatus,
      cert_id: a.certId || null,
      supplier: a.supplier,
      description: a.description,
      registered_by_name: a.registeredBy,
      created_at: a.registeredAt,
      updated_at: a.updatedAt
    } as AssetResponse;
  }
};
