/**
 * KavachTrust Supply Chain API Service
 */

import { api } from './api';

// ── Types ─────────────────────────────────────────────────────────────────

export interface SupplierResponse {
  id: string;
  supplier_id: string;
  name: string;
  type: string;
  address: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  certifications: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface FacilityResponse {
  id: string;
  facility_id: string;
  name: string;
  supplier_id: string;
  location: string | null;
  type: string | null;
  capacity: string | null;
  certifications: string | null;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'CLOSED';
  created_at: string;
  updated_at: string;
  supplier?: SupplierResponse;
}

export interface LotResponse {
  id: string;
  lot_id: string;
  facility_id: string;
  batch_id: string | null;
  description: string | null;
  quantity: number | null;
  unit: string | null;
  manufactured_date: string | null;
  expiry_date: string | null;
  status: 'CREATED' | 'IN_TRANSIT' | 'RECEIVED' | 'CONSUMED';
  created_at: string;
  updated_at: string;
  facility?: FacilityResponse;
}

export interface ShipmentResponse {
  id: string;
  shipment_id: string;
  lot_id: string;
  origin_facility_id: string;
  destination_facility_id: string;
  carrier: string | null;
  tracking_number: string | null;
  dispatched_at: string | null;
  estimated_arrival: string | null;
  received_at: string | null;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  lot?: LotResponse;
  origin_facility?: FacilityResponse;
  destination_facility?: FacilityResponse;
}

export interface CustodyTransferResponse {
  id: string;
  transfer_id: string;
  shipment_id: string;
  from_custodian: string;
  to_custodian: string;
  transfer_reason: string | null;
  initiated_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  shipment?: ShipmentResponse;
}

export interface SupplyChainEventResponse {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  actor: string | null;
  description: string;
  metadata: any;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

// ── API Service ───────────────────────────────────────────────────────────

export const supplyChainService = {
  // ── Suppliers ───────────────────────────────────────────────────────────
  
  listSuppliers: async (params: { page?: number; page_size?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.status) query.append('status', params.status);
    return api.get<PaginatedResponse<SupplierResponse>>(`/supply-chain/suppliers?${query.toString()}`);
  },

  getSupplier: async (id: string) => {
    return api.get<SupplierResponse>(`/supply-chain/suppliers/${id}`);
  },

  createSupplier: async (data: {
    supplierId: string;
    name: string;
    type: string;
    address?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    certifications?: string;
  }) => {
    return api.post<SupplierResponse>('/supply-chain/suppliers', data);
  },

  updateSupplier: async (id: string, data: Partial<{
    name: string;
    type: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    certifications: string;
    status: string;
  }>) => {
    return api.patch<SupplierResponse>(`/supply-chain/suppliers/${id}`, data);
  },

  // ── Facilities ──────────────────────────────────────────────────────────
  
  listFacilities: async (params: { page?: number; page_size?: number; supplier_id?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.supplier_id) query.append('supplier_id', params.supplier_id);
    if (params.status) query.append('status', params.status);
    return api.get<PaginatedResponse<FacilityResponse>>(`/supply-chain/facilities?${query.toString()}`);
  },

  getFacility: async (id: string) => {
    return api.get<FacilityResponse>(`/supply-chain/facilities/${id}`);
  },

  createFacility: async (data: {
    facilityId: string;
    name: string;
    supplierId: string;
    location?: string;
    type?: string;
    capacity?: string;
    certifications?: string;
  }) => {
    return api.post<FacilityResponse>('/supply-chain/facilities', data);
  },

  updateFacility: async (id: string, data: Partial<{
    name: string;
    location: string;
    type: string;
    capacity: string;
    certifications: string;
    status: string;
  }>) => {
    return api.patch<FacilityResponse>(`/supply-chain/facilities/${id}`, data);
  },

  // ── Lots ────────────────────────────────────────────────────────────────
  
  listLots: async (params: { page?: number; page_size?: number; facility_id?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.facility_id) query.append('facility_id', params.facility_id);
    if (params.status) query.append('status', params.status);
    return api.get<PaginatedResponse<LotResponse>>(`/supply-chain/lots?${query.toString()}`);
  },

  getLot: async (id: string) => {
    return api.get<LotResponse>(`/supply-chain/lots/${id}`);
  },

  createLot: async (data: {
    lotId: string;
    facilityId: string;
    batchId?: string;
    description?: string;
    quantity?: number;
    unit?: string;
    manufacturedDate?: string;
    expiryDate?: string;
  }) => {
    return api.post<LotResponse>('/supply-chain/lots', data);
  },

  updateLot: async (id: string, data: Partial<{
    description: string;
    quantity: number;
    unit: string;
    status: string;
  }>) => {
    return api.patch<LotResponse>(`/supply-chain/lots/${id}`, data);
  },

  // ── Shipments ───────────────────────────────────────────────────────────
  
  listShipments: async (params: { page?: number; page_size?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.status) query.append('status', params.status);
    return api.get<PaginatedResponse<ShipmentResponse>>(`/supply-chain/shipments?${query.toString()}`);
  },

  getShipment: async (id: string) => {
    return api.get<ShipmentResponse>(`/supply-chain/shipments/${id}`);
  },

  createShipment: async (data: {
    shipmentId: string;
    lotId: string;
    originFacilityId: string;
    destinationFacilityId: string;
    carrier?: string;
    trackingNumber?: string;
    estimatedArrival?: string;
  }) => {
    return api.post<ShipmentResponse>('/supply-chain/shipments', data);
  },

  dispatchShipment: async (id: string, data: { carrier?: string; trackingNumber?: string }) => {
    return api.post<ShipmentResponse>(`/supply-chain/shipments/${id}/dispatch`, data);
  },

  receiveShipment: async (id: string, data: { receivedBy?: string; notes?: string }) => {
    return api.post<ShipmentResponse>(`/supply-chain/shipments/${id}/receive`, data);
  },

  cancelShipment: async (id: string, reason: string) => {
    return api.post<ShipmentResponse>(`/supply-chain/shipments/${id}/cancel`, { reason });
  },

  // ── Custody Transfers ───────────────────────────────────────────────────
  
  listCustodyTransfers: async (params: { page?: number; page_size?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.status) query.append('status', params.status);
    return api.get<PaginatedResponse<CustodyTransferResponse>>(`/supply-chain/custody-transfers?${query.toString()}`);
  },

  getCustodyTransfer: async (id: string) => {
    return api.get<CustodyTransferResponse>(`/supply-chain/custody-transfers/${id}`);
  },

  initiateCustodyTransfer: async (data: {
    shipmentId: string;
    fromCustodian: string;
    toCustodian: string;
    transferReason?: string;
  }) => {
    return api.post<CustodyTransferResponse>('/supply-chain/custody-transfers', data);
  },

  acceptCustodyTransfer: async (id: string) => {
    return api.post<CustodyTransferResponse>(`/supply-chain/custody-transfers/${id}/accept`, {});
  },

  rejectCustodyTransfer: async (id: string, reason: string) => {
    return api.post<CustodyTransferResponse>(`/supply-chain/custody-transfers/${id}/reject`, { reason });
  },

  // ── Events ──────────────────────────────────────────────────────────────
  
  listEvents: async (params: { page?: number; page_size?: number; entity_type?: string; entity_id?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.entity_type) query.append('entity_type', params.entity_type);
    if (params.entity_id) query.append('entity_id', params.entity_id);
    return api.get<PaginatedResponse<SupplyChainEventResponse>>(`/supply-chain/events?${query.toString()}`);
  },
};

