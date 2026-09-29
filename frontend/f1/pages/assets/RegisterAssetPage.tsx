import { useState } from "react";
import { useNavigate } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import { assetService } from "../../services/assets";

interface AssetPreset {
  name: string;
  category: string;
  type: string;
  model: string;
  prefix: string;
  supplier: string;
  description: string;
}

const DUMMY_ASSET_PRESETS: AssetPreset[] = [
  {
    name: "Electronic Fuze Mk-IV",
    category: "Electronic Warfare",
    type: "Electronic Fuze",
    model: "EF-MK4-SYNTH",
    prefix: "EF",
    supplier: "BEL Synthetic Procurement Div.",
    description: "High-precision artillery electronic fuze unit with cryptographic arming verification and dual detonator failsafe.",
  },
  {
    name: "Thermal Imaging Sensor",
    category: "Surveillance Equipment",
    type: "Surveillance Equipment",
    model: "TIR-MOD-900",
    prefix: "TIR",
    supplier: "BEL Electro-Optics Div. - Pune",
    description: "Cryogenically cooled long-range MWIR thermal imaging payload with onboard crypto coprocessor for battlefield target acquisition.",
  },
  {
    name: "Tactical UHF Transceiver",
    category: "Communication Equipment",
    type: "Communication Equipment",
    model: "SECURE-COM-4000",
    prefix: "COM",
    supplier: "Bharat Electronics Ltd - Ghaziabad",
    description: "Software-defined frequency-hopping tactical communication module with Type-1 military encryption compliance.",
  },
  {
    name: "Inertial Navigation Unit",
    category: "Guidance System",
    type: "Guidance System",
    model: "INU-NAV-SPEC7",
    prefix: "INU",
    supplier: "BEL Synthetic Guidance Div.",
    description: "Ring laser gyroscope inertial guidance unit with MIL-STD-810H shock and high-g acceleration tolerance.",
  },
  {
    name: "Pressure Transducer Assembly",
    category: "Sensors & Instrumentation",
    type: "Pressure Transducer",
    model: "PT-SEN-SYNTH",
    prefix: "PT",
    supplier: "BEL Synthetic Sensors Div. - Bangalore",
    description: "High-frequency dynamic piezoelectric aerospace pressure transducer calibrated for extreme ballistic pressure profiles.",
  },
];

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
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  const applyPreset = (preset: AssetPreset, index: number) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const randomBatch = Math.floor(10 + Math.random() * 90);
    const randomSerial = Math.floor(10000 + Math.random() * 90000);

    setForm({
      assetId: `${preset.prefix}-2026-00${randomSuffix}`,
      batchId: `${preset.prefix}-BATCH-2026-${randomBatch}`,
      type: preset.type,
      model: preset.model,
      serialNumber: `SN-${preset.prefix}-${randomSerial}`,
      supplier: preset.supplier,
      description: preset.description,
    });
    setSelectedPresetIndex(index);
    setError("");
  };

  const handleRandomFill = () => {
    const randIdx = Math.floor(Math.random() * DUMMY_ASSET_PRESETS.length);
    applyPreset(DUMMY_ASSET_PRESETS[randIdx], randIdx);
  };

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
      navigate(`/app/assets/${result.id || result.asset_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to register asset");
      setSubmitting(false);
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title="Register / Update Asset"
        subtitle="Register a new defence asset with technical data, batch lineage, and cryptographic lifecycle clearance"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Quality Inspection", to: "/app/my-assets" },
          { label: "Register Asset" },
        ]}
        actions={
          <button
            type="button"
            className="btn-secondary"
            onClick={handleRandomFill}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>⚡</span> Quick Fill Random Dummy Asset
          </button>
        }
      />

      {/* DUMMY DATA PRESET TOOLBAR */}
      <div
        className="panel"
        style={{
          maxWidth: 820,
          margin: "0 auto 20px auto",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1rem" }}>📋</span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quality Inspector Dummy Asset Presets
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--subtle-text)" }}>
            Click any template to auto-populate the registration form:
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DUMMY_ASSET_PRESETS.map((preset, idx) => {
            const isSelected = selectedPresetIndex === idx;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset, idx)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s ease",
                  background: isSelected ? "var(--hover-bg, #242424)" : "transparent",
                  border: isSelected ? "1px solid var(--foreground, #f5f5f5)" : "1px solid var(--border, #2a2a2a)",
                  color: isSelected ? "var(--foreground, #ffffff)" : "var(--muted, #a3a3a3)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isSelected ? "#22c55e" : "var(--subtle-text, #737373)",
                  }}
                />
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: 12,
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 6,
                marginBottom: 20,
                color: "#ef4444",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
                Basic Asset Identification
              </h3>
              {form.assetId && (
                <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>
                  ✓ Dummy Data Loaded
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--muted)",
                    marginBottom: 6,
                  }}
                >
                  Asset ID <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={form.assetId}
                  onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                  placeholder="e.g., EF-2026-00421"
                  required
                  style={{
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--muted)",
                    marginBottom: 6,
                  }}
                >
                  Batch ID <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  placeholder="e.g., EF-BATCH-2026-017"
                  required
                  style={{
                    fontFamily: "monospace",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--muted)",
                    marginBottom: 6,
                  }}
                >
                  Type / Classification <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="e.g., Electronic Fuze"
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--muted)",
                    marginBottom: 6,
                  }}
                >
                  Model Number <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="e.g., EF-MK4-SYNTH"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--muted)",
                    marginBottom: 6,
                  }}
                >
                  Serial Number <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  placeholder="e.g., SN-EF-00421"
                  required
                  style={{
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--muted)",
                    marginBottom: 6,
                  }}
                >
                  Supplier / Defence Vendor
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  placeholder="e.g., BEL Synthetic Procurement Div."
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                Technical Description & Lifecycle Notes
              </label>
              <textarea
                className="input-field"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Technical specifications, environmental tolerances, or custody notes..."
                rows={3}
                style={{
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 20,
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setForm({
                  assetId: "",
                  batchId: "",
                  type: "",
                  model: "",
                  serialNumber: "",
                  supplier: "",
                  description: "",
                });
                setSelectedPresetIndex(null);
              }}
              disabled={submitting}
            >
              Clear Form
            </button>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => navigate("/app/dashboard")}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Registering Asset..." : "Register Asset"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
