import {
  Asset,
  ASSETS,
  AUDIT_EVENTS,
  LifecycleState,
  VerificationStatus,
  EvidenceStatus,
  CertStatus,
} from '../data/mockData';

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
  cert_status: CertStatus | "NOT_CERTIFIED";
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

export interface RegisterAssetInput {
  id: string;
  batchId: string;
  type: string;
  model: string;
  serialNumber: string;
  supplier: string;
  lifecycle?: LifecycleState;
  description?: string;
}

export interface UpdateAssetInput {
  type?: string;
  model?: string;
  supplier?: string;
  lifecycle?: LifecycleState;
  description?: string;
}

// In-memory clone to maintain state mutations across the session
let sessionAssets: Asset[] = JSON.parse(JSON.stringify(ASSETS));

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error("Error in asset listener:", err);
    }
  });
}

function mapToResponse(a: Asset): AssetResponse {
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
    description: a.description || null,
    registered_by_name: a.registeredBy || null,
    created_at: a.registeredAt,
    updated_at: a.updatedAt,
  };
}

export const assetService = {
  /**
   * Subscribe to asset state changes
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * List assets with search and lifecycle filter
   */
  listAssets: async (
    params: { search?: string; lifecycle?: string; page?: number; page_size?: number } = {}
  ): Promise<AssetListResponse> => {
    // Artificial small delay for realistic UX responsiveness
    await new Promise((r) => setTimeout(r, 150));

    let items = [...sessionAssets];

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.batchId.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.model.toLowerCase().includes(q) ||
          a.serialNumber.toLowerCase().includes(q) ||
          a.supplier.toLowerCase().includes(q)
      );
    }

    if (params.lifecycle && params.lifecycle !== "ALL") {
      items = items.filter((a) => a.lifecycle === params.lifecycle);
    }

    // Sort by updated date descending
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const page = params.page || 1;
    const pageSize = params.page_size || 100;
    const startIndex = (page - 1) * pageSize;
    const paged = items.slice(startIndex, startIndex + pageSize);

    return {
      items: paged.map(mapToResponse),
      total: items.length,
      page,
      page_size: pageSize,
      has_next: page * pageSize < items.length,
    };
  },

  /**
   * Get single asset by ID
   */
  getAsset: async (id: string): Promise<AssetResponse> => {
    await new Promise((r) => setTimeout(r, 120));
    const found = sessionAssets.find(
      (a) => a.id.toUpperCase() === id.toUpperCase()
    );
    if (!found) throw new Error(`Asset ${id} not found`);
    return mapToResponse(found);
  },

  /**
   * Get raw Asset object
   */
  getRawAsset: (id: string): Asset | null => {
    const found = sessionAssets.find(
      (a) => a.id.toUpperCase() === id.toUpperCase()
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  /**
   * Check if Asset ID already exists
   */
  checkAssetIdExists: (id: string): boolean => {
    return sessionAssets.some(
      (a) => a.id.trim().toUpperCase() === id.trim().toUpperCase()
    );
  },

  /**
   * Register a new asset
   */
  registerAsset: async (
    input: RegisterAssetInput,
    registeredBy = "Rajesh Kumar (Technician)"
  ): Promise<AssetResponse> => {
    await new Promise((r) => setTimeout(r, 250));

    const trimmedId = input.id.trim().toUpperCase();

    // 1. Validation: Prevent duplicate Asset IDs
    if (assetService.checkAssetIdExists(trimmedId)) {
      throw new Error(`Asset ID "${trimmedId}" already exists in the registry. Duplicate Asset IDs are prohibited.`);
    }

    // 2. Validate required fields
    if (!trimmedId) throw new Error("Asset ID is required.");
    if (!input.batchId?.trim()) throw new Error("Batch ID is required.");
    if (!input.type?.trim()) throw new Error("Asset Type is required.");
    if (!input.model?.trim()) throw new Error("Model specification is required.");
    if (!input.serialNumber?.trim()) throw new Error("Serial Number is required.");
    if (!input.supplier?.trim()) throw new Error("Supplier / Division is required.");

    const now = new Date().toISOString();

    const newAsset: Asset = {
      id: trimmedId,
      batchId: input.batchId.trim().toUpperCase(),
      type: input.type.trim(),
      model: input.model.trim().toUpperCase(),
      serialNumber: input.serialNumber.trim().toUpperCase(),
      lifecycle: input.lifecycle || "SUPPLIER_DECLARED",
      verification: "PENDING",
      evidenceCount: 0,
      evidenceStatus: "Uploading",
      certStatus: "NOT_CERTIFIED",
      supplier: input.supplier.trim(),
      registeredBy,
      registeredAt: now,
      updatedAt: now,
      description: input.description?.trim() || `Newly registered ${input.type.trim()} record under batch ${input.batchId.trim().toUpperCase()}.`,
    };

    // Prepend to sessionAssets so it appears first in lists
    sessionAssets.unshift(newAsset);

    // Record audit event
    AUDIT_EVENTS.unshift({
      id: `AE-${Date.now()}`,
      actor: registeredBy,
      actorDid: "did:bel:actor:003",
      actorRole: "Technician",
      action: `Asset registered — ${newAsset.id}`,
      assetId: newAsset.id,
      timestamp: now,
      result: "SUCCESS",
      details: `Registered ${newAsset.type} (${newAsset.model}) in batch ${newAsset.batchId}. Initial lifecycle: ${newAsset.lifecycle}.`,
    });

    notifyListeners();
    return mapToResponse(newAsset);
  },

  /**
   * Update an existing asset
   */
  updateAsset: async (
    id: string,
    input: UpdateAssetInput,
    updatedBy = "Rajesh Kumar (Technician)"
  ): Promise<AssetResponse> => {
    await new Promise((r) => setTimeout(r, 250));

    const target = sessionAssets.find(
      (a) => a.id.toUpperCase() === id.toUpperCase()
    );
    if (!target) throw new Error(`Asset ${id} not found.`);

    // Update mutable fields only (preserving immutable id, batchId, serialNumber, registeredAt, registeredBy)
    if (input.type?.trim()) target.type = input.type.trim();
    if (input.model?.trim()) target.model = input.model.trim().toUpperCase();
    if (input.supplier?.trim()) target.supplier = input.supplier.trim();
    if (input.lifecycle) target.lifecycle = input.lifecycle;
    if (input.description !== undefined) target.description = input.description.trim();

    const now = new Date().toISOString();
    target.updatedAt = now;

    // Record audit event
    AUDIT_EVENTS.unshift({
      id: `AE-${Date.now()}`,
      actor: updatedBy,
      actorDid: "did:bel:actor:003",
      actorRole: "Technician",
      action: `Asset updated — ${target.id}`,
      assetId: target.id,
      timestamp: now,
      result: "SUCCESS",
      details: `Updated specifications and lifecycle (${target.lifecycle}) for asset ${target.id}.`,
    });

    notifyListeners();
    return mapToResponse(target);
  },

  /**
   * Reset session assets back to default mock dataset
   */
  resetToDefault: (): void => {
    sessionAssets = JSON.parse(JSON.stringify(ASSETS));
    notifyListeners();
  },
};
