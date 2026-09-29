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
  const [searchTerm, setSearchTerm] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("ALL");
  const [classificationFilter, setClassificationFilter] = useState("ALL");
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

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.asset_type && r.asset_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.asset_model && r.asset_model.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = recordTypeFilter === "ALL" || r.record_type === recordTypeFilter;
    const matchesClass = classificationFilter === "ALL" || r.classification === classificationFilter;
    return matchesSearch && matchesType && matchesClass;
  });

  const maintenanceCount = records.filter((r) => r.record_type === "MAINTENANCE").length;
  const specCount = records.filter((r) => r.record_type === "SPECIFICATION").length;
  const sensitiveCount = records.filter((r) => r.classification === "SENSITIVE" || r.classification === "SECRET").length;

  return (
    <div className="internal-page page-fade">
      <PageHeader
        title="Technical Records"
        subtitle="Technical data records, maintenance histories, sensor telemetry, and cryptographic specifications for defence assets"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Technical Records" },
        ]}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              + Add Record
            </button>
            <button className="btn-secondary" onClick={fetchRecords}>
              ↻ Refresh
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="internal-kpi-grid stagger-in-2">
        <div className="internal-kpi-card">
          <div className="internal-kpi-label">TOTAL TECHNICAL RECORDS</div>
          <div className="internal-kpi-value">{total}</div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
            Indexed in defence database
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">MAINTENANCE ENTRIES</div>
          <div className="internal-kpi-value" style={{ color: "#3b82f6" }}>
            {maintenanceCount}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />
            Service logs & overhauls
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">SPECIFICATIONS</div>
          <div className="internal-kpi-value" style={{ color: "#22c55e" }}>
            {specCount}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            Engineering baselines
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">RESTRICTED CLASSIFICATION</div>
          <div className="internal-kpi-value" style={{ color: "#f59e0b" }}>
            {sensitiveCount}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
            Sensitive or internal only
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="internal-filter-bar stagger-in-3">
        <input
          type="text"
          className="internal-search-input"
          placeholder="Search by Record ID, Asset ID, or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="internal-select"
          value={recordTypeFilter}
          onChange={(e) => setRecordTypeFilter(e.target.value)}
        >
          <option value="ALL">All Record Types</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="INSPECTION">Inspection</option>
          <option value="CALIBRATION">Calibration</option>
          <option value="REPAIR">Repair</option>
          <option value="SPECIFICATION">Specification</option>
          <option value="UPDATE">Update</option>
        </select>

        <select
          className="internal-select"
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
        >
          <option value="ALL">All Classifications</option>
          <option value="PUBLIC">Public</option>
          <option value="INTERNAL">Internal</option>
          <option value="SENSITIVE">Sensitive</option>
        </select>

        <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: "auto" }}>
          Showing {filteredRecords.length} of {total} records
        </span>
      </div>

      {/* Technical Records Table */}
      <div className="internal-card stagger-in-4" style={{ padding: 0 }}>
        <div className="internal-table-container">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
                {["Record ID", "Target Asset", "Type / Subsystem", "Model Spec", "Record Category", "Classification", "Logged At", "Action"].map((h) => (
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
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)" }}>
                    <div style={{ display: "inline-block", width: 24, height: 24, borderRadius: "50%", border: "2px solid #3b82f6", borderTopColor: "transparent", animation: "orbitRotateSlow 1s linear infinite", marginBottom: 8 }} />
                    <div>Loading technical records database...</div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                    No technical records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="interactive-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <span className="meta-id" style={{ color: "var(--foreground)", fontWeight: 600 }}>
                        {record.id.slice(0, 10)}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link to={`/app/assets/${record.asset_id}`} style={{ textDecoration: "none" }}>
                        <span className="meta-id" style={{ color: "#3b82f6", fontWeight: 700 }}>
                          {record.asset_id}
                        </span>
                      </Link>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "var(--foreground)" }}>
                      {record.asset_type || "Propulsion"}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "var(--muted)" }}>
                      {record.asset_model || "Mark IV"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={record.record_type} size="sm" />
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={record.classification} size="sm" />
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {formatDateTime(record.created_at)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link to={`/app/assets/${record.asset_id}`} className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                        View Asset →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)", fontSize: "0.75rem", color: "var(--muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Military technical logs anchored via cryptographic hash verification</span>
          <span>Showing {filteredRecords.length} of {total} records</span>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-backdrop"
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
          <div
            className="internal-card modal-content-animated"
            style={{ width: 600, maxWidth: "90%", padding: 0, maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Add Technical Record</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              {error && (
                <div style={{ padding: 12, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, marginBottom: 16, color: "#ef4444", fontSize: "0.875rem" }}>
                  {error}
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Asset ID <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="internal-search-input"
                  style={{ width: "100%" }}
                  value={createForm.asset_id}
                  onChange={(e) => setCreateForm({ ...createForm, asset_id: e.target.value })}
                  placeholder="e.g., AST-2024-0001"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Record Type <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className="internal-select"
                  style={{ width: "100%" }}
                  value={createForm.record_type}
                  onChange={(e) => setCreateForm({ ...createForm, record_type: e.target.value })}
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
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Classification
                </label>
                <select
                  className="internal-select"
                  style={{ width: "100%" }}
                  value={createForm.classification}
                  onChange={(e) => setCreateForm({ ...createForm, classification: e.target.value })}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="INTERNAL">Internal</option>
                  <option value="SENSITIVE">Sensitive</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Technical Parameters & Data Fields
                </label>
                {dataFields.map((field, index) => (
                  <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      className="internal-search-input"
                      value={field.key}
                      onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                      placeholder="Field name (e.g. Torque_Nm)"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      className="internal-search-input"
                      value={field.value}
                      onChange={(e) => handleFieldChange(index, "value", e.target.value)}
                      placeholder="Value (e.g. 450)"
                      style={{ flex: 2 }}
                    />
                    {dataFields.length > 1 && (
                      <button onClick={() => handleRemoveField(index)} className="btn-ghost" style={{ padding: "8px 12px" }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={handleAddField} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem", marginTop: 4 }}>
                  + Add Parameter Field
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <button className="btn-secondary" onClick={() => setShowCreateModal(false)} disabled={submitting}>
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
