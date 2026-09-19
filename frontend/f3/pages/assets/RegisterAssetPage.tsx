import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { assetService } from "../../services/assets";
import { useAuth } from "../../context/AuthContext";
import type { LifecycleState } from "../../data/mockData";

const PRESET_TYPES = [
  "Electronic Fuze",
  "Pressure Transducer",
  "Ignition Module",
  "Missile Guidance Unit",
  "Radar Transceiver",
  "Optical Gyroscope Sensor",
  "Telemetry Receiver Module",
  "Cryptographic Hardware Security Unit",
];

const PRESET_SUPPLIERS = [
  "BEL Synthetic Procurement Div.",
  "BEL Synthetic Sensors Div.",
  "BEL Synthetic Ignition Div.",
  "BEL Radar & Avionics Div.",
  "BEL Cleanroom Component Bay 4",
  "BEL Strategic Electronics Center",
];

export default function RegisterAssetPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Form State
  const [assetId, setAssetId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [type, setType] = useState(PRESET_TYPES[0]);
  const [customType, setCustomType] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [supplier, setSupplier] = useState(PRESET_SUPPLIERS[0]);
  const [customSupplier, setCustomSupplier] = useState("");
  const [lifecycle, setLifecycle] = useState<LifecycleState>("SUPPLIER_DECLARED");
  const [description, setDescription] = useState("");

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredSuccessAssetId, setRegisteredSuccessAssetId] = useState<string | null>(null);

  // Live duplicate check
  const isDuplicateId = useMemo(() => {
    if (!assetId.trim()) return false;
    return assetService.checkAssetIdExists(assetId.trim());
  }, [assetId]);

  // Field validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    const trimmedId = assetId.trim().toUpperCase();

    if (!trimmedId) {
      errs.assetId = "Asset ID is required.";
    } else if (trimmedId.length < 5) {
      errs.assetId = "Asset ID must be at least 5 characters (e.g. EF-2026-00424).";
    } else if (isDuplicateId) {
      errs.assetId = `Asset ID "${trimmedId}" is already registered. Duplicate IDs are prohibited.`;
    }

    if (!batchId.trim()) {
      errs.batchId = "Batch Identifier is required (e.g. EF-BATCH-2026-018).";
    }

    if (type === "OTHER" && !customType.trim()) {
      errs.type = "Please specify custom asset equipment type.";
    }

    if (!model.trim()) {
      errs.model = "Model specification code is required (e.g. EF-MK4-SYNTH).";
    }

    if (!serialNumber.trim()) {
      errs.serialNumber = "Physical hardware serial number is required.";
    }

    if (supplier === "OTHER" && !customSupplier.trim()) {
      errs.supplier = "Please specify manufacturing supplier / division.";
    }

    return errs;
  }, [assetId, isDuplicateId, batchId, type, customType, model, serialNumber, supplier, customSupplier]);

  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      assetId: true,
      batchId: true,
      type: true,
      model: true,
      serialNumber: true,
      supplier: true,
    });

    if (!isValid) {
      setSubmitError("Please resolve validation errors before submitting registration.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const finalType = type === "OTHER" ? customType.trim() : type;
    const finalSupplier = supplier === "OTHER" ? customSupplier.trim() : supplier;

    try {
      const res = await assetService.registerAsset(
        {
          id: assetId.trim().toUpperCase(),
          batchId: batchId.trim().toUpperCase(),
          type: finalType,
          model: model.trim().toUpperCase(),
          serialNumber: serialNumber.trim().toUpperCase(),
          supplier: finalSupplier,
          lifecycle,
          description: description.trim(),
        },
        user?.name ? `${user.name} (${role || "Technician"})` : "Rajesh Kumar (Technician)"
      );

      setRegisteredSuccessAssetId(res.asset_id);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to register asset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setAssetId("");
    setBatchId("");
    setType(PRESET_TYPES[0]);
    setCustomType("");
    setModel("");
    setSerialNumber("");
    setSupplier(PRESET_SUPPLIERS[0]);
    setCustomSupplier("");
    setLifecycle("SUPPLIER_DECLARED");
    setDescription("");
    setTouched({});
    setSubmitError(null);
    setRegisteredSuccessAssetId(null);
  };

  return (
    <div className="page-fade">
      {/* Page Header */}
      <PageHeader
        title="Register Defence Asset"
        subtitle="Intake new defence equipment records into the BEL cryptographic ledger."
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Assets", to: "/app/assets" },
          { label: "Register Asset" },
        ]}
        badge={
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              background: "rgba(37,99,235,0.12)",
              border: "1px solid rgba(59,130,246,0.35)",
              borderRadius: "4px",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "#60a5fa",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <span>⊕</span>
            <span>DEMO DATA · SIMULATED SESSION</span>
          </div>
        }
        actions={
          <Link to="/app/assets" className="btn-secondary" style={{ fontSize: "0.75rem" }}>
            ← Cancel & Back to Assets
          </Link>
        }
      />

      {/* BEL Authority Notice Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(15, 23, 42, 0.7)",
          border: "1px solid #1e3a60",
          borderRadius: "6px",
          marginBottom: 20,
          fontSize: "0.8125rem",
          color: "#94a3b8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#38bdf8", fontSize: "1.1rem" }}>ℹ</span>
          <span>
            <strong style={{ color: "#e2e8f0" }}>BEL Defence Asset Registration Protocol:</strong>{" "}
            New equipment records initialize provenance with immutable hardware serial stamping and batch allocation.
          </span>
        </div>
        <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
          REGISTRY VERIFICATION ACTIVE
        </span>
      </div>

      {/* Error Alert */}
      {submitError && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: 20,
            borderRadius: "6px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#f87171",
            fontSize: "0.8125rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>✕</span>
            <span>{submitError}</span>
          </div>
          <button
            onClick={() => setSubmitError(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Modal Confirmation */}
      {registeredSuccessAssetId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 15, 29, 0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            className="panel-elevated"
            style={{
              maxWidth: 520,
              width: "100%",
              padding: 26,
              border: "1px solid #22c55e",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid #22c55e",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                color: "#4ade80",
                marginBottom: 16,
              }}
            >
              ✓
            </div>

            <h3 className="font-display" style={{ fontSize: "1.5rem", color: "#e2e8f0", margin: "0 0 6px" }}>
              ASSET REGISTRATION CONFIRMED
            </h3>

            <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.5, margin: "0 0 16px" }}>
              Asset record <strong style={{ color: "#60a5fa" }}>{registeredSuccessAssetId}</strong> has been successfully entered into the active session ledger and audit provenance trail.
            </p>

            <div
              style={{
                background: "#08131f",
                border: "1px solid #152b4a",
                borderRadius: "6px",
                padding: "12px 16px",
                marginBottom: 20,
                textAlign: "left",
                fontSize: "0.75rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#64748b" }}>Asset ID:</span>
                <span className="meta-id" style={{ color: "#60a5fa" }}>{registeredSuccessAssetId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#64748b" }}>Initial Lifecycle:</span>
                <StatusBadge status={lifecycle} size="sm" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Registered By:</span>
                <span style={{ color: "#e2e8f0" }}>{user?.name || "Rajesh Kumar (Technician)"}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link
                to={`/app/assets/${registeredSuccessAssetId}`}
                className="btn-primary"
                style={{ fontSize: "0.8125rem", padding: "8px 18px" }}
              >
                View Asset Details →
              </Link>
              <button
                type="button"
                onClick={handleResetForm}
                className="btn-secondary"
                style={{ fontSize: "0.8125rem" }}
              >
                + Register Another
              </button>
              <Link
                to="/app/assets"
                className="btn-ghost"
                style={{ fontSize: "0.8125rem" }}
              >
                Assets List
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Layout (Split Form + Live Card Preview) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Left: Input Form */}
        <form onSubmit={handleSubmit} className="panel" style={{ padding: 24 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>
            DEFENCE ASSET IDENTIFIERS & TRACEABILITY
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Asset ID */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                ASSET IDENTIFIER (ID) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="input-field"
                placeholder="e.g. EF-2026-00424"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value.toUpperCase())}
                onBlur={() => handleBlur("assetId")}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  borderColor: touched.assetId && errors.assetId ? "#ef4444" : undefined,
                }}
              />
              {touched.assetId && errors.assetId ? (
                <div style={{ fontSize: "0.6875rem", color: "#f87171", marginTop: 4 }}>
                  {errors.assetId}
                </div>
              ) : assetId.trim() && !isDuplicateId ? (
                <div style={{ fontSize: "0.6875rem", color: "#4ade80", marginTop: 4 }}>
                  ✓ ID available for registration
                </div>
              ) : null}
            </div>

            {/* Batch Identifier */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                BATCH NUMBER <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="input-field"
                placeholder="e.g. EF-BATCH-2026-018"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value.toUpperCase())}
                onBlur={() => handleBlur("batchId")}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  borderColor: touched.batchId && errors.batchId ? "#ef4444" : undefined,
                }}
              />
              {touched.batchId && errors.batchId && (
                <div style={{ fontSize: "0.6875rem", color: "#f87171", marginTop: 4 }}>
                  {errors.batchId}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Serial Number */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                HARDWARE SERIAL NUMBER <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="input-field"
                placeholder="e.g. SN-EF-00424"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                onBlur={() => handleBlur("serialNumber")}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  borderColor: touched.serialNumber && errors.serialNumber ? "#ef4444" : undefined,
                }}
              />
              {touched.serialNumber && errors.serialNumber && (
                <div style={{ fontSize: "0.6875rem", color: "#f87171", marginTop: 4 }}>
                  {errors.serialNumber}
                </div>
              )}
            </div>

            {/* Model Specification */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                MODEL SPECIFICATION <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="input-field"
                placeholder="e.g. EF-MK4-SYNTH"
                value={model}
                onChange={(e) => setModel(e.target.value.toUpperCase())}
                onBlur={() => handleBlur("model")}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  borderColor: touched.model && errors.model ? "#ef4444" : undefined,
                }}
              />
              {touched.model && errors.model && (
                <div style={{ fontSize: "0.6875rem", color: "#f87171", marginTop: 4 }}>
                  {errors.model}
                </div>
              )}
            </div>
          </div>

          <div className="section-label" style={{ marginBottom: 16, paddingTop: 8, borderTop: "1px solid #152b4a" }}>
            EQUIPMENT CATEGORY & MANUFACTURING DIVISION
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Equipment Type */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                ASSET TYPE <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                className="input-field"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ fontSize: "0.8125rem" }}
              >
                {PRESET_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="OTHER">Other Equipment Type (Custom)</option>
              </select>

              {type === "OTHER" && (
                <input
                  className="input-field"
                  placeholder="Enter custom asset equipment type…"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  onBlur={() => handleBlur("type")}
                  style={{ marginTop: 8 }}
                />
              )}
              {touched.type && errors.type && (
                <div style={{ fontSize: "0.6875rem", color: "#f87171", marginTop: 4 }}>
                  {errors.type}
                </div>
              )}
            </div>

            {/* Supplier Division */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                SUPPLIER / DEFENCE DIVISION <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                className="input-field"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                style={{ fontSize: "0.8125rem" }}
              >
                {PRESET_SUPPLIERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="OTHER">Other Supplier / Division (Custom)</option>
              </select>

              {supplier === "OTHER" && (
                <input
                  className="input-field"
                  placeholder="Enter custom supplier division name…"
                  value={customSupplier}
                  onChange={(e) => setCustomSupplier(e.target.value)}
                  onBlur={() => handleBlur("supplier")}
                  style={{ marginTop: 8 }}
                />
              )}
              {touched.supplier && errors.supplier && (
                <div style={{ fontSize: "0.6875rem", color: "#f87171", marginTop: 4 }}>
                  {errors.supplier}
                </div>
              )}
            </div>
          </div>

          {/* Initial Lifecycle State */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
              INTAKE LIFECYCLE STATE <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              className="input-field"
              value={lifecycle}
              onChange={(e) => setLifecycle(e.target.value as LifecycleState)}
              style={{ fontSize: "0.8125rem" }}
            >
              <option value="SUPPLIER_DECLARED">SUPPLIER_DECLARED (Initial supplier intake)</option>
              <option value="RECEIVED">RECEIVED (Material physically checked at warehouse gate)</option>
              <option value="UNREGISTERED">UNREGISTERED (Pre-intake placeholder)</option>
            </select>
            <span style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: 4, display: "block" }}>
              Standard intake begins in SUPPLIER_DECLARED state prior to physical warehouse receipt.
            </span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
              TECHNICAL SPECIFICATIONS & OBSERVATIONS
            </label>
            <textarea
              className="input-field"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter technical details, casing dimensions, baseline electrical parameters, or supplier contract references…"
              style={{ fontSize: "0.8125rem", lineHeight: 1.5 }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid #152b4a", paddingTop: 18 }}>
            <button
              type="button"
              onClick={() => navigate("/app/assets")}
              className="btn-secondary"
              style={{ fontSize: "0.8125rem" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (touched.assetId && !isValid)}
              className="btn-primary"
              style={{
                fontSize: "0.8125rem",
                padding: "8px 22px",
                background: "#2563eb",
              }}
            >
              {isSubmitting ? "Registering Record..." : "⊕ Register Defence Asset"}
            </button>
          </div>
        </form>

        {/* Right: Live Preview Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel" style={{ padding: 20 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>
              LIVE ASSET LEDGER PREVIEW
            </div>

            <div
              style={{
                background: "#08131f",
                border: "1px solid #1e3a60",
                borderRadius: "6px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div className="meta-id" style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.9375rem" }}>
                    {assetId.trim() || "EF-2026-XXXXX"}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#e2e8f0", fontWeight: 600, marginTop: 2 }}>
                    {type === "OTHER" ? customType || "Custom Equipment" : type}
                  </div>
                </div>
                <StatusBadge status={lifecycle} size="sm" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.75rem", color: "#94a3b8" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Batch:</span>
                  <span className="meta-id">{batchId.trim() || "BATCH-XXXX-XXX"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Model:</span>
                  <span className="meta-id">{model.trim() || "MODEL-CODE"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Serial:</span>
                  <span className="meta-id">{serialNumber.trim() || "SN-XXXXX"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Supplier:</span>
                  <span>{supplier === "OTHER" ? customSupplier || "Custom Supplier" : supplier}</span>
                </div>
              </div>

              {description && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "1px solid #152b4a",
                    fontSize: "0.6875rem",
                    color: "#64748b",
                    fontStyle: "italic",
                    lineHeight: 1.4,
                  }}
                >
                  "{description.slice(0, 100)}{description.length > 100 ? "..." : ""}"
                </div>
              )}
            </div>
          </div>

          {/* Validation Checklist Card */}
          <div className="panel" style={{ padding: 18 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>
              PRE-REGISTRATION CHECKS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: assetId.trim().length >= 5 && !isDuplicateId ? "#22c55e" : "#64748b" }}>
                  {assetId.trim().length >= 5 && !isDuplicateId ? "✓" : "○"}
                </span>
                <span style={{ color: assetId.trim().length >= 5 && !isDuplicateId ? "#cbd5e1" : "#64748b" }}>
                  Unique Asset Identifier assigned
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: batchId.trim() ? "#22c55e" : "#64748b" }}>
                  {batchId.trim() ? "✓" : "○"}
                </span>
                <span style={{ color: batchId.trim() ? "#cbd5e1" : "#64748b" }}>
                  Batch traceability code linked
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: serialNumber.trim() && model.trim() ? "#22c55e" : "#64748b" }}>
                  {serialNumber.trim() && model.trim() ? "✓" : "○"}
                </span>
                <span style={{ color: serialNumber.trim() && model.trim() ? "#cbd5e1" : "#64748b" }}>
                  Hardware serial & model code recorded
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#22c55e" }}>✓</span>
                <span style={{ color: "#cbd5e1" }}>
                  Provenance actor: {user?.name || "Rajesh Kumar (Technician)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
