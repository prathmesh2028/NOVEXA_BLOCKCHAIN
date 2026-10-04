import { api } from './api';

export interface ApprovalRequest {
  asset_id?: string;
  assetId?: string;
  entity_type?: string;
  entityType?: string;
  entity_id?: string;
  entityId?: string;
  stage?: string;
  comments?: string;
}

export interface ApprovalDecision {
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
  digital_signature?: string;
}

export interface Approval {
  id: string;
  approvalId: string;
  assetId: string;
  asset?: {
    id: string;
    assetId: string;
    serialNumber: string;
    lifecycleState: string;
    model: string;
  };
  entityType: string;
  entityId: string;
  stage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedById: string;
  requestedByName?: string;
  requestedByRole?: string;
  approverId?: string;
  approverName?: string;
  approverRole?: string;
  comments?: string;
  digitalSignature?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalListResponse {
  items: Approval[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

export const approvalService = {
  async requestApproval(data: ApprovalRequest): Promise<Approval> {
    return api.post<Approval>('/approvals', data);
  },

  async listApprovals(params?: {
    status?: string;
    stage?: string;
    asset_id?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApprovalListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.stage) searchParams.append('stage', params.stage);
    if (params?.asset_id) searchParams.append('asset_id', params.asset_id);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
    return api.get<ApprovalListResponse>(`/approvals?${searchParams.toString()}`);
  },

  async getApproval(id: string): Promise<Approval> {
    return api.get<Approval>(`/approvals/${id}`);
  },

  async decideApproval(id: string, decision: ApprovalDecision): Promise<Approval> {
    return api.patch<Approval>(`/approvals/${id}/decide`, decision);
  },
};
