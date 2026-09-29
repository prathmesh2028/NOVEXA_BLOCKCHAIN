import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";
import { formatDateTime } from "../../data/utils";
import "./InspectionsPage.css";

const DEMO_INSPECTION_DATA = {
  assetId: "EF-2026-001",
  result: "PASS",
  notes:
    "Visual inspection completed. Assembly integrity verified. Connector pins inspected and found within acceptable limits. Calibration status confirmed. No critical defects observed.",
  evidenceIds: [] as string[],
};

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [recordForm, setRecordForm] = useState({
    assetId: "",
    result: "PASS",
    notes: "",
    evidenceIds: [] as string[],
  });

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<any>("/inspections");
      setInspections(data.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch inspections");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoData = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setRecordForm({
      assetId: DEMO_INSPECTION_DATA.assetId,
      result: DEMO_INSPECTION_DATA.result,
      notes: DEMO_INSPECTION_DATA.notes,
      evidenceIds: [],
    });
    setRecordError(null);
    setDemoLoaded(true);
    setTimeout(() => {
      setDemoLoaded(false);
    }, 2500);
  };

  const handleRecordInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordError(null);
    try {
      await api.post("/inspections/record", recordForm);
      setShowRecordModal(false);
      setRecordForm({ assetId: "", result: "PASS", notes: "", evidenceIds: [] });
      fetchInspections();
    } catch (err: any) {
      setRecordError(err.message || "Failed to record inspection");
    }
  };

  const filteredInspections = inspections.filter((ins) => {
    const matchesSearch =
      !searchTerm ||
      (ins.assetId && ins.assetId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ins.inspectorDid && ins.inspectorDid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ins.notes && ins.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesResult = resultFilter === "ALL" || ins.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  const passedCount = inspections.filter((i) => i.result === "PASS").length;
  const failedCount = inspections.filter((i) => i.result === "FAIL").length;
  const pendingCount = inspections.filter((i) => i.result !== "PASS" && i.result !== "FAIL").length;

  return (
    <div className="internal-page page-fade">
      <PageHeader
        title="Quality & Inspection Deck"
        subtitle="Defence asset physical inspections, QA verification checkpoints, and auditor sign-offs"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Inspections" },
        ]}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={() => setShowRecordModal(true)}>
              + Record Inspection
            </button>
            <button className="btn-secondary" onClick={fetchInspections}>
              ↻ Refresh
            </button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="internal-kpi-grid stagger-in-2">
        <div className="internal-kpi-card">
          <div className="internal-kpi-label">TOTAL INSPECTIONS</div>
          <div className="internal-kpi-value">{inspections.length}</div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
            Logged in system
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">PASSED QA AUDIT</div>
          <div className="internal-kpi-value" style={{ color: "#22c55e" }}>
            {passedCount}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            Cleared for assembly
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">DISCREPANCIES / FAILED</div>
          <div className="internal-kpi-value" style={{ color: failedCount > 0 ? "#ef4444" : "#64748b" }}>
            {failedCount}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: failedCount > 0 ? "#ef4444" : "#64748b" }} />
            {failedCount > 0 ? "Requires re-inspection" : "Zero defects recorded"}
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">PENDING REVIEW</div>
          <div className="internal-kpi-value" style={{ color: "#f59e0b" }}>
            {pendingCount}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
            In QA queue
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="internal-filter-bar stagger-in-3">
        <input
          type="text"
          className="internal-search-input"
          placeholder="Search by Asset ID, inspector DID, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="internal-select"
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
        >
          <option value="ALL">All Inspection Results</option>
          <option value="PASS">PASS Only</option>
          <option value="FAIL">FAIL Only</option>
          <option value="CONDITIONAL">Conditional</option>
        </select>

        <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: "auto" }}>
          Showing {filteredInspections.length} of {inspections.length} inspection records
        </span>
      </div>

      {/* Main Inspection Table */}
      {loading ? (
        <div className="internal-card" style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)" }}>
          <div style={{ display: "inline-block", width: 24, height: 24, borderRadius: "50%", border: "2px solid #3b82f6", borderTopColor: "transparent", animation: "orbitRotateSlow 1s linear infinite", marginBottom: 8 }} />
          <div>Retrieving QA inspection records...</div>
        </div>
      ) : error ? (
        <div className="internal-card" style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ color: "#ef4444", marginBottom: 12, fontWeight: 600 }}>{error}</div>
          <button className="btn-secondary" onClick={fetchInspections}>Retry</button>
        </div>
      ) : filteredInspections.length === 0 ? (
        <div className="internal-card internal-empty-state">
          <div className="internal-empty-icon">✓</div>
          <div className="internal-empty-title">NO INSPECTIONS FOUND</div>
          <div className="internal-empty-desc">
            No inspection records match your current filter criteria. Record a new inspection to update asset QA state.
          </div>
        </div>
      ) : (
        <div className="internal-card stagger-in-4" style={{ padding: 0 }}>
          <div className="internal-table-container">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
                  {["Target Asset", "Inspector DID", "Result Status", "Inspection Notes", "Evidence", "Timestamp", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "0.6875rem",
                        color: "var(--muted)",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInspections.map((inspection: any) => (
                  <tr key={inspection.id} className="interactive-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <Link to={`/app/assets/${inspection.assetId}`} className="meta-id" style={{ color: "#3b82f6", fontWeight: 700, textDecoration: "none" }}>
                        {inspection.assetId}
                      </Link>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "var(--muted)" }}>
                      {inspection.inspectorDid || "DID:NOVEXA-INSPECTOR-01"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={inspection.result} size="sm" />
                    </td>
                    <td style={{ padding: "14px 16px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--foreground)" }}>
                      {inspection.notes || "—"}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <span style={{ padding: "2px 8px", background: "rgba(37,99,235,0.08)", borderRadius: "10px", fontSize: "0.75rem", color: "#3b82f6", fontWeight: 600 }}>
                        {inspection.evidenceIds?.length || 0} files
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {formatDateTime(inspection.createdAt)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link to={`/app/assets/${inspection.assetId}`} className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                        View Asset
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)", fontSize: "0.75rem", color: "var(--muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Cryptographic inspection logs anchored on-chain</span>
            <span>Total {filteredInspections.length} inspections</span>
          </div>
        </div>
      )}

      {/* Record Inspection Modal */}
      {showRecordModal && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="internal-card modal-content-animated" style={{ width: "100%", maxWidth: 500, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>Record Defence Inspection</div>
              <button
                onClick={() => setShowRecordModal(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordInspection} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {recordError && (
                <div style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: 6, color: "#f87171", fontSize: "0.8125rem" }}>
                  {recordError}
                </div>
              )}

              {/* DEMO DATA QUICK FILL BAR */}
              <div className="insp-demo-bar">
                <div className="insp-demo-bar-info">
                  <span className="insp-demo-badge">SIH DEMO</span>
                  <span className="insp-demo-text">Pre-fill realistic QA inspection report</span>
                </div>
                <button
                  type="button"
                  id="insp-load-demo-btn"
                  className={`insp-load-demo-btn ${demoLoaded ? "insp-demo-btn--loaded" : ""}`}
                  onClick={handleLoadDemoData}
                  title="Automatically fill inspection form with realistic demo values"
                >
                  <span className="insp-demo-icon">{demoLoaded ? "✓" : "⚡"}</span>
                  <span>{demoLoaded ? "DEMO DATA LOADED" : "LOAD DEMO DATA"}</span>
                </button>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Target Asset ID *
                </label>
                <input
                  type="text"
                  className="internal-search-input"
                  style={{ width: "100%" }}
                  value={recordForm.assetId}
                  onChange={(e) => setRecordForm({ ...recordForm, assetId: e.target.value })}
                  placeholder="e.g. EF-2026-00421 or UUID"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Inspection Result *
                </label>
                <select
                  className="internal-select"
                  style={{ width: "100%" }}
                  value={recordForm.result}
                  onChange={(e) => setRecordForm({ ...recordForm, result: e.target.value })}
                >
                  <option value="PASS">PASS — Complies with Defence QA Specs</option>
                  <option value="FAIL">FAIL — Quarantined / Defect Detected</option>
                  <option value="CONDITIONAL">CONDITIONAL — Requires Secondary Check</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Inspection Findings & Notes
                </label>
                <textarea
                  className="internal-search-input"
                  style={{ width: "100%", minHeight: 80, resize: "vertical" }}
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="Enter detailed technical findings, equipment IDs, and calibration notes..."
                  rows={3}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 10, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <button
                  type="button"
                  id="insp-load-demo-footer-btn"
                  className={`insp-load-demo-footer-btn ${demoLoaded ? "insp-demo-btn--loaded" : ""}`}
                  onClick={handleLoadDemoData}
                  title="Pre-fill form with synthetic inspection parameters"
                >
                  <span>{demoLoaded ? "✓" : "⚡"}</span>
                  <span>{demoLoaded ? "Demo Data Applied" : "USE DUMMY DATA"}</span>
                </button>

                <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowRecordModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Record Inspection
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
