import { useState } from "react";
import { useNavigate } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import { assetService } from "../../services/assets";

export default function RegisterAssetPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    assetId: "",
    batchId: "",
    type: "",
    model: "",
    serialNumber: "",
    supplier: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.assetId || !form.batchId || !form.type || !form.model || !form.serialNumber) {
      setError("All required fields must be filled");
      return;
    }

    setSubmitting(true);
    setError("");
    
    try {
      const result = await assetService.createAsset(form);
      navigate(`/app/assets/${result.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to register asset");
      setSubmitting(false);
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title="Register / Update Asset"
        subtitle="Register a new defence asset with technical data and lifecycle information"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Register Asset" },
        ]}
      />

      <div className="panel" style={{ maxWidth: 800, margin: "0 auto" }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: 12,
                background: "#7f1d1d",
                border: "1px solid #991b1b",
                borderRadius: 6,
                marginBottom: 20,
                color: "#fca5a5",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>
              Basic Information
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  marginBottom: 6,
                }}
              >
                Asset ID <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={form.assetId}
                onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                placeholder="e.g., AST-2024-0001"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0a1628",
                  border: "1px solid #1e3a60",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  marginBottom: 6,
                }}
              >
                Batch ID <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                placeholder="e.g., BATCH-2024-Q1"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0a1628",
                  border: "1px solid #1e3a60",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  marginBottom: 6,
                }}
              >
                Type <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="e.g., Communication Device"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0a1628",
                  border: "1px solid #1e3a60",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  marginBottom: 6,
                }}
              >
                Model <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="e.g., SECURE-COM-2000"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0a1628",
                  border: "1px solid #1e3a60",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  marginBottom: 6,
                }}
              >
                Serial Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                placeholder="e.g., SN-2024-A001"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0a1628",
                  border: "1px solid #1e3a60",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  marginBottom: 6,
                }}
              >
                Supplier
              </label>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="e.g., Defence Electronics Ltd"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0a1628",
                  border: "1px solid #1e3a60",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  marginBottom: 6,
                }}
              >
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional notes about this asset..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0a1628",
                  border: "1px solid #1e3a60",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  fontSize: "0.875rem",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              paddingTop: 20,
              borderTop: "1px solid #152b4a",
            }}
          >
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate("/app/dashboard")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Registering..." : "Register Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
