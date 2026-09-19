import { Certification, CERTIFICATIONS, CertStatus } from '../data/mockData';

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
  cert_type?: string;
  asset_name?: string;
  expiry_date?: string | null;
  review_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
}

export interface CertificationListResponse {
  items: CertificationResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  total_pages?: number;
}

export interface CertificationQueueStats {
  total: number;
  pending: number;
  confirmed: number;
  failed: number;
  revoked: number;
}

export interface ListCertificationsParams {
  search?: string;
  status_filter?: string;
  status?: string;
  sort_by?: "date-desc" | "date-asc" | "id" | "status";
  page?: number;
  page_size?: number;
}

// In-memory clone to maintain state across session navigation
let sessionCertifications: Certification[] = JSON.parse(JSON.stringify(CERTIFICATIONS));

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error("Error in certification listener:", err);
    }
  });
}

function mapToResponse(c: Certification): CertificationResponse {
  return {
    id: c.id,
    cert_id: c.id,
    asset_id: c.assetId,
    batch_id: c.batchId,
    token_id: c.tokenId || null,
    contract_address: c.contractAddress || null,
    network: c.network || null,
    tx_hash: c.txHash || null,
    block_number: c.blockNumber ?? null,
    status: c.status,
    issued_by: c.issuedBy || null,
    issued_at: c.issuedAt,
    confirmed_at: c.confirmedAt || null,
    confirmations: c.confirmations,
    cert_type: c.certType,
    asset_name: c.assetName,
    expiry_date: c.expiryDate || null,
    review_notes: c.reviewNotes || null,
    reviewed_by: c.reviewedBy || null,
    reviewed_at: c.reviewedAt || null,
    rejection_reason: c.rejectionReason || null,
  };
}

export const certificationService = {
  /**
   * Subscribe to state modifications (e.g. approval, rejection)
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Get dynamic stats derived directly from dataset
   */
  getStats(): CertificationQueueStats {
    let pending = 0;
    let confirmed = 0;
    let failed = 0;
    let revoked = 0;

    for (const c of sessionCertifications) {
      if (c.status === "PENDING") pending++;
      else if (c.status === "CONFIRMED") confirmed++;
      else if (c.status === "FAILED") failed++;
      else if (c.status === "REVOKED") revoked++;
    }

    return {
      total: sessionCertifications.length,
      pending,
      confirmed,
      failed,
      revoked,
    };
  },

  /**
   * List certifications with search, filter, sort, and pagination
   */
  listCertifications: async (params: ListCertificationsParams = {}): Promise<CertificationListResponse> => {
    // Artificial small delay for realistic responsiveness
    await new Promise((resolve) => setTimeout(resolve, 180));

    let filtered = [...sessionCertifications];

    // Search query
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.assetId.toLowerCase().includes(q) ||
          (c.assetName && c.assetName.toLowerCase().includes(q)) ||
          (c.certType && c.certType.toLowerCase().includes(q)) ||
          c.batchId.toLowerCase().includes(q) ||
          (c.tokenId && c.tokenId.toLowerCase().includes(q)) ||
          (c.issuedBy && c.issuedBy.toLowerCase().includes(q))
      );
    }

    // Status filter
    const statusFilter = params.status_filter || params.status;
    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Sorting
    const sortBy = params.sort_by || "date-desc";
    filtered.sort((a, b) => {
      if (sortBy === "date-asc") {
        return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
      }
      if (sortBy === "id") {
        return a.id.localeCompare(b.id);
      }
      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      // date-desc default
      return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
    });

    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.page_size || 10);
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const pagedItems = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items: pagedItems.map(mapToResponse),
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
      has_next: page < totalPages,
    };
  },

  /**
   * Get single certification by ID
   */
  getCertification: async (id: string): Promise<Certification | null> => {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const found = sessionCertifications.find(
      (c) => c.id.toUpperCase() === id.toUpperCase() || c.assetId.toUpperCase() === id.toUpperCase()
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  /**
   * Approve a pending certification
   */
  approveCertification: async (
    id: string,
    notes: string,
    reviewerName: string,
    reviewerDid: string
  ): Promise<{ success: boolean; certification: Certification; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const target = sessionCertifications.find((c) => c.id === id);

    if (!target) {
      throw new Error(`Certification record ${id} not found.`);
    }

    if (target.status !== "PENDING") {
      return {
        success: false,
        certification: JSON.parse(JSON.stringify(target)),
        message: `Cannot approve certification with current status: ${target.status}.`,
      };
    }

    const now = new Date().toISOString();
    target.status = "CONFIRMED";
    target.confirmedAt = now;
    target.confirmations = 1;
    target.blockNumber = 19842360;
    target.reviewNotes = notes || "Approved by Authorized NFT Creator following evidence verification.";
    target.reviewedBy = reviewerName || "Priya Sharma";
    target.reviewedByDid = reviewerDid || "did:bel:actor:002";
    target.reviewedAt = now;

    notifyListeners();

    return {
      success: true,
      certification: JSON.parse(JSON.stringify(target)),
      message: `Certification ${id} successfully approved and minted on BEL-TRUST-CHAIN.`,
    };
  },

  /**
   * Reject a pending certification
   */
  rejectCertification: async (
    id: string,
    reason: string,
    reviewerName: string,
    reviewerDid: string
  ): Promise<{ success: boolean; certification: Certification; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const target = sessionCertifications.find((c) => c.id === id);

    if (!target) {
      throw new Error(`Certification record ${id} not found.`);
    }

    if (target.status !== "PENDING") {
      return {
        success: false,
        certification: JSON.parse(JSON.stringify(target)),
        message: `Cannot reject certification with current status: ${target.status}.`,
      };
    }

    if (!reason || !reason.trim()) {
      return {
        success: false,
        certification: JSON.parse(JSON.stringify(target)),
        message: "A rejection reason must be provided.",
      };
    }

    const now = new Date().toISOString();
    target.status = "FAILED";
    target.rejectionReason = reason;
    target.reviewedBy = reviewerName || "Priya Sharma";
    target.reviewedByDid = reviewerDid || "did:bel:actor:002";
    target.reviewedAt = now;

    notifyListeners();

    return {
      success: true,
      certification: JSON.parse(JSON.stringify(target)),
      message: `Certification ${id} rejected. Status marked FAILED and asset flagged for review.`,
    };
  },

  /**
   * Reset session certifications to initial baseline
   */
  resetToDefault: (): void => {
    sessionCertifications = JSON.parse(JSON.stringify(CERTIFICATIONS));
    notifyListeners();
  },
};
