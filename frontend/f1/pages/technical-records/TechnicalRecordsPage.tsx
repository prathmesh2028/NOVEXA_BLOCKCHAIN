import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime } from "../../data/utils";
import { technicalRecordsService, TechnicalRecordResponse } from "../../services/technical-records";

export default function TechnicalRecordsPage() {
  const [records, setRecords] = useState<TechnicalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    asset_id: "",
    record_type: "MAINTENANCE",
    data: {},
    classification: "INTERNAL",
  });
  const [dataFields, setDataFields] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await technicalRecordsService.listTechnicalRecords({ page_size: 100 });
      setRecords(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setDataFields([...dataFields, { key: "", value: "" }]);
  };

  const handleRemoveField = (index: number) => {
    setDataFields(dataFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...dataFields];
    updated[index][field] = value;
    setDataFields(updated);
  };

  const handleCreate = async () => {
    if (!createForm.asset_id || !createForm.record_type) {
      setError("Asset ID and Record Type are required");
      return;
    }

    const data: any = {};
    dataFields.forEach((field) => {
      if (field.key) {
        data[field.key] = field.value;
      }
    });

    setSubmitting(true);
    setError("");
    try {
      await technicalRecordsService.createTechnicalRecord({
        ...createForm,
        data,
      });
      setShowCreateModal(false);
      setCreateForm({ asset_id: "", record_type: "MAINTENANCE", data: {}, classification: "INTERNAL" });
      setDataFields([{ key: "", value: "" }]);
      fetchRecords();
    } catch (err: any) {
      setError(err.message || "Failed to create technical record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title="Technical Records"
        subtitle="Technical data records associated with assets. Maintenance logs, specifications, and updates."
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Technical Records" },
        ]}
        actions={
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + Add Record
          </button>
        }
      />

      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a60", background: "#08131f" }}>
                {["Record ID", "Asset ID", "Type", "Model", "Record Type", "Classification", "Created", "Updated", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.6875rem", color: "#475569", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>
                    Loading technical records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>
                    No technical records found. Create your first record to get started.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} style={{ borderBottom: "1px solid #152b4a" }} className="table-row">
                    <td style={{ padding: "12px 14px" }}>
                      <span className="meta-id">{record.id.slice(0, 8)}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/assets/${record.asset_id}`} className="meta-id" style={{ color: "#60a5fa", textDecoration: "none" }}>
                        {record.asset_id}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{record.asset_type}</td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{record.asset_model}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={record.record_type} size="sm" />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={record.classification} size="sm" />
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b" }}>{formatDateTime(record.created_at)}</td>
                    <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b" }}>{formatDateTime(record.updated_at)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/assets/${record.asset_id}`} className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem", textDecoration: "none", display: "inline-block" }}>
                        View Asset →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid #152b4a", fontSize: "0.75rem", color: "#475569" }}>
          Showing {records.length} of {total} records (Powered by Backend API)
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div className="panel" style={{ width: 600, maxWidth: "90%", padding: 0, maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #152b4a" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>Add Technical Record</h2>
            </div>
            <div style={{ padding: 24 }}>
              {error && (
                <div style={{ padding: 12, background: "#7f1d1d", border: "1px solid #991b1b", borderRadius: 6, marginBottom: 16, color: "#fca5a5", fontSize: "0.875rem" }}>
                  {error}
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                  Asset ID <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={createForm.asset_id}
                  onChange={(e) => setCreateForm({ ...createForm, asset_id: e.target.value })}
                  placeholder="e.g., AST-2024-0001"
                  style={{ width: "100%", padding: "10px 12px", background: "#0a1628", border: "1px solid #1e3a60", borderRadius: 6, color: "#e2e8f0", fontSize: "0.875rem" }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                  Record Type <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={createForm.record_type}
                  onChange={(e) => setCreateForm({ ...createForm, record_type: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", background: "#0a1628", border: "1px solid #1e3a60", borderRadius: 6, color: "#e2e8f0", fontSize: "0.875rem" }}
                >
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INSPECTION">Inspection</option>
                  <option value="CALIBRATION">Calibration</option>
                  <option value="REPAIR">Repair</option>
                  <option value="SPECIFICATION">Specification</option>
                  <option value="UPDATE">Update</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>Classification</label>
                <select
                  value={createForm.classification}
                  onChange={(e) => setCreateForm({ ...createForm, classification: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", background: "#0a1628", border: "1px solid #1e3a60", borderRadius: 6, color: "#e2e8f0", fontSize: "0.875rem" }}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="INTERNAL">Internal</option>
                  <option value="SENSITIVE">Sensitive</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>Technical Data</label>
                {dataFields.map((field, index) => (
                  <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                      placeholder="Field name"
                      style={{ flex: 1, padding: "8px 10px", background: "#0a1628", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0", fontSize: "0.8125rem" }}
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleFieldChange(index, "value", e.target.value)}
                      placeholder="Value"
                      style={{ flex: 2, padding: "8px 10px", background: "#0a1628", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0", fontSize: "0.8125rem" }}
                    />
                    {dataFields.length > 1 && (
                      <button onClick={() => handleRemoveField(index)} className="btn-ghost" style={{ padding: "8px 12px", fontSize: "0.8125rem" }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={handleAddField} className="btn-ghost" style={{ padding: "6px 12px", fontSize: "0.8125rem", marginTop: 4 }}>
                  + Add Field
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid #152b4a" }}>
                <button className="btn-ghost" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleCreate} disabled={submitting}>
                  {submitting ? "Creating..." : "Create Record"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
