import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";
import { formatDateTime } from "../../data/utils";

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({
    asset_id: "",
    result: "PASS",
    notes: "",
    evidence_ids: [] as string[],
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

  const handleRecordInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/inspections/record", recordForm);
      alert("Inspection recorded successfully");
      setShowRecordModal(false);
      setRecordForm({ asset_id: "", result: "PASS", notes: "", evidence_ids: [] });
      fetchInspections();
    } catch (err: any) {
      alert(`Failed to record inspection: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title="Inspections"
        subtitle="Asset inspection records and QA verification"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Inspections" },
        ]}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={() => setShowRecordModal(true)}>
              + Record Inspection
            </button>
            <button className="btn-ghost" onClick={fetchInspections}>
              ↻ Refresh
            </button>
          </div>
        }
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          Loading inspections...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>
          <button className="btn-secondary" onClick={fetchInspections}>Retry</button>
        </div>
      ) : inspections.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          No inspections recorded yet.
        </div>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Inspector</th>
                <th>Result</th>
                <th>Notes</th>
                <th>Evidence Count</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection: any) => (
                <tr key={inspection.id}>
                  <td>
                    <Link to={`/app/assets/${inspection.asset_id}`} className="meta-id" style={{ color: "#60a5fa" }}>
                      {inspection.asset_id}
                    </Link>
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    {inspection.inspector_did || "Inspector"}
                  </td>
                  <td>
                    <StatusBadge status={inspection.result} />
                  </td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#94a3b8" }}>
                    {inspection.notes || "—"}
                  </td>
                  <td style={{ textAlign: "center" }}>{inspection.evidence_ids?.length || 0}</td>
                  <td style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                    {formatDateTime(inspection.created_at)}
                  </td>
                  <td>
                    <Link to={`/app/assets/${inspection.asset_id}`} className="btn-ghost" style={{ fontSize: "0.75rem" }}>
                      View Asset
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showRecordModal && (
        <div
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
          <div className="panel" style={{ width: "100%", maxWidth: 500, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>Record Inspection</div>
              <button
                onClick={() => setShowRecordModal(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordInspection} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Asset ID
                </label>
                <input
                  type="text"
                  className="input"
                  value={recordForm.asset_id}
                  onChange={(e) => setRecordForm({ ...recordForm, asset_id: e.target.value })}
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Result
                </label>
                <select
                  className="input"
                  value={recordForm.result}
                  onChange={(e) => setRecordForm({ ...recordForm, result: e.target.value })}
                >
                  <option value="PASS">PASS</option>
                  <option value="FAIL">FAIL</option>
                  <option value="CONDITIONAL">CONDITIONAL</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Notes
                </label>
                <textarea
                  className="input"
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="Inspection notes..."
                  rows={3}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowRecordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
