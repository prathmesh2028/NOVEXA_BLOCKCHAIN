import {
  Inspection,
  InspectionStatus,
  InspectionPriority,
  ChecklistItemState,
  INSPECTIONS_LIST,
} from "../data/mockData";

export interface ListInspectionsParams {
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: "date-desc" | "date-asc" | "priority" | "id";
  page?: number;
  pageSize?: number;
}

export interface ListInspectionsResult {
  items: Inspection[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InspectionStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  attentionRequired: number;
}

// In-memory clone to maintain state mutations during the current user session
let sessionInspections: Inspection[] = JSON.parse(JSON.stringify(INSPECTIONS_LIST));

// Subscribers for reactive updates across components
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error("Error in inspection listener:", err);
    }
  });
}

const PRIORITY_ORDER: Record<InspectionPriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  STANDARD: 1,
};

export const inspectionService = {
  /**
   * Subscribe to inspection state changes
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Get dynamic counts derived from the in-memory dataset
   */
  getStats(): InspectionStats {
    let scheduled = 0;
    let inProgress = 0;
    let completed = 0;
    let attentionRequired = 0;

    for (const item of sessionInspections) {
      if (item.status === "SCHEDULED") scheduled++;
      else if (item.status === "IN_PROGRESS") inProgress++;
      else if (item.status === "COMPLETED") completed++;
      else if (item.status === "ATTENTION_REQUIRED") attentionRequired++;
    }

    return {
      total: sessionInspections.length,
      scheduled,
      inProgress,
      completed,
      attentionRequired,
    };
  },

  /**
   * Query inspections with filtering, search, sorting, and pagination
   */
  async listInspections(params: ListInspectionsParams = {}): Promise<ListInspectionsResult> {
    // Artificial small latency for realistic enterprise responsiveness
    await new Promise((resolve) => setTimeout(resolve, 200));

    let filtered = [...sessionInspections];

    // Text search (Inspection ID, Asset ID, Asset Name, Technician, Type)
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.assetId.toLowerCase().includes(q) ||
          i.assetName.toLowerCase().includes(q) ||
          i.assignedTechnician.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.batchId.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (params.status && params.status !== "ALL") {
      filtered = filtered.filter((i) => i.status === params.status);
    }

    // Priority filter
    if (params.priority && params.priority !== "ALL") {
      filtered = filtered.filter((i) => i.priority === params.priority);
    }

    // Sorting
    const sortBy = params.sortBy || "date-desc";
    filtered.sort((a, b) => {
      if (sortBy === "date-asc") {
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      }
      if (sortBy === "priority") {
        return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      }
      if (sortBy === "id") {
        return a.id.localeCompare(b.id);
      }
      // Default: date-desc
      return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
    });

    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  /**
   * Fetch single inspection record
   */
  async getInspection(id: string): Promise<Inspection | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const found = sessionInspections.find((i) => i.id.toUpperCase() === id.toUpperCase());
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  /**
   * Update state of a single checklist item
   */
  async updateChecklistItem(
    inspectionId: string,
    itemId: string,
    state: ChecklistItemState,
    notes?: string
  ): Promise<Inspection> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const target = sessionInspections.find((i) => i.id === inspectionId);
    if (!target) throw new Error(`Inspection ${inspectionId} not found`);

    if (target.status === "COMPLETED") {
      throw new Error("Cannot modify checklist on a finalized inspection.");
    }

    const item = target.checklist.find((c) => c.id === itemId);
    if (!item) throw new Error(`Checklist item ${itemId} not found`);

    item.state = state;
    if (notes !== undefined) {
      item.notes = notes;
    }

    // Advance SCHEDULED to IN_PROGRESS if technician starts checking
    if (target.status === "SCHEDULED" && state !== "Not Checked") {
      target.status = "IN_PROGRESS";
      target.history.unshift({
        id: `IH-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: target.assignedTechnician,
        actorRole: "Technician",
        action: "Inspection commenced",
        details: `First checklist item ${item.id} verified. Status changed to IN_PROGRESS.`,
      });
    }

    target.updatedAt = new Date().toISOString();
    notifyListeners();
    return JSON.parse(JSON.stringify(target));
  },

  /**
   * Update findings text
   */
  async updateFindings(inspectionId: string, findings: string): Promise<Inspection> {
    const target = sessionInspections.find((i) => i.id === inspectionId);
    if (!target) throw new Error(`Inspection ${inspectionId} not found`);

    if (target.status === "COMPLETED") {
      throw new Error("Cannot modify findings on a finalized inspection.");
    }

    target.findings = findings;
    target.updatedAt = new Date().toISOString();
    notifyListeners();
    return JSON.parse(JSON.stringify(target));
  },

  /**
   * Complete inspection with validation
   */
  async completeInspection(
    inspectionId: string,
    technicianName: string,
    technicianDid: string,
    findings: string
  ): Promise<{ success: boolean; inspection: Inspection; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const target = sessionInspections.find((i) => i.id === inspectionId);
    if (!target) throw new Error(`Inspection ${inspectionId} not found`);

    if (target.status === "COMPLETED") {
      return {
        success: false,
        inspection: JSON.parse(JSON.stringify(target)),
        message: "Inspection is already marked as completed.",
      };
    }

    // 1. Validate: all mandatory checklist items must be checked
    const uncheckedMandatory = target.checklist.filter(
      (c) => c.mandatory && c.state === "Not Checked"
    );

    if (uncheckedMandatory.length > 0) {
      const names = uncheckedMandatory.map((c) => `"${c.criterion}"`).join(", ");
      return {
        success: false,
        inspection: JSON.parse(JSON.stringify(target)),
        message: `Validation Error: ${uncheckedMandatory.length} mandatory check(s) remain unchecked: ${names}. All mandatory items must be evaluated before completing.`,
      };
    }

    // 2. Validate: findings cannot be completely empty
    if (!findings.trim()) {
      return {
        success: false,
        inspection: JSON.parse(JSON.stringify(target)),
        message: "Validation Error: Technician observations & findings must be recorded before completing.",
      };
    }

    target.findings = findings;
    target.updatedAt = new Date().toISOString();

    // 3. Determine status based on failed checks
    const hasFailures = target.checklist.some((c) => c.state === "Fail");
    const newStatus: InspectionStatus = hasFailures ? "ATTENTION_REQUIRED" : "COMPLETED";
    target.status = newStatus;

    // 4. Record audit history
    const failedItems = target.checklist.filter((c) => c.state === "Fail");
    target.history.unshift({
      id: `IH-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: technicianName || target.assignedTechnician,
      actorRole: "Technician",
      action: `Inspection finalized — ${newStatus}`,
      details: hasFailures
        ? `Marked ATTENTION_REQUIRED due to ${failedItems.length} failed check(s): ${failedItems.map((f) => f.id).join(", ")}. Escalated for senior review.`
        : `Marked COMPLETED. All ${target.checklist.length} quality criteria passed without non-conformances.`,
    });

    notifyListeners();

    return {
      success: true,
      inspection: JSON.parse(JSON.stringify(target)),
      message: hasFailures
        ? `Inspection finalized with ATTENTION REQUIRED status due to ${failedItems.length} failed check(s). Asset requires QA escalation.`
        : "Inspection successfully finalized. All checks passed conforming to defence quality standards.",
    };
  },

  /**
   * Reset session mock data to original defaults
   */
  resetToDefault(): void {
    sessionInspections = JSON.parse(JSON.stringify(INSPECTIONS_LIST));
    notifyListeners();
  },
};
