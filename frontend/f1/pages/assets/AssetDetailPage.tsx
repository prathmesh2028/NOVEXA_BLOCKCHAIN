import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import { formatDate, formatDateTime } from "../../data/utils";
import { DefenceAsset, INITIAL_DEFENCE_ASSETS } from "./assetData";
import { assetService, AssetResponse } from "../../services/assets";

function mapBackendToDefenceAsset(res: AssetResponse): DefenceAsset {
  return {
    id: res.asset_id || res.id,
    name: `${res.model || res.type || "Defence Asset"} [${res.asset_id || res.id}]`,
    serialNumber: res.serial_number || "N/A",
    category: (res.type as any) || "Weapon System",
    status: (res.lifecycle_state === "ACCEPTED_FOR_ASSEMBLY" || res.lifecycle_state === "SUPPLIER_DECLARED" || res.lifecycle_state === "RECEIVED" ? "Active" : "Under Maintenance") as any,
    department: "Ministry of Defence / BEL",
    location: "BEL Depot Hub",
    lastMaintenanceDate: res.updated_at ? res.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
    verificationStatus: (res.verification_status === "VERIFIED" ? "Verified" : res.verification_status === "FAILED" ? "Verification Required" : "Pending Verification") as any,
    proofStatus: res.cert_status === "CONFIRMED" ? "Anchored" : "Pending",
    manufacturer: res.supplier || "Bharat Electronics Limited",
    model: res.model || "Standard Spec",
    acquisitionDate: res.created_at ? res.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
    acquisitionMethod: "Direct Procurement",
    classification: "SECRET",
    custodian: res.registered_by_name || "Defence Procurement Officer",
    specsSummary: res.description || "Defence certified hardware component",
    description: res.description || `Tactical defence unit manufactured by ${res.supplier || "BEL"}. Registered under sovereign ledger.`,
    maintenanceHistory: [],
    blockchainProof: {
      verificationStatus: res.cert_status === "CONFIRMED" ? "Anchored" : "Pending Confirmation",
      assetHash: "0x" + (res.id ? res.id.replace(/-/g, "") : "0000000000000000000000000000000000000000"),
      transactionId: res.cert_id ? `TX-${res.cert_id}` : "PENDING_MINT",
      blockNumber: 12480,
      confirmations: res.cert_status === "CONFIRMED" ? 12 : 0,
      timestamp: res.created_at,
      network: "BEL Sovereign Blockchain",
      consensusSeal: "SHA256-IBFT2",
      proofStandard: "ERC-721 Defence Identity",
    },
    certification: res.cert_id ? {
      certificateId: res.cert_id,
      type: "Quality & Airworthiness Certificate",
      issuingAuthority: "Defence Quality Assurance Agency (DQAA)",
      issueDate: res.created_at ? res.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
      expiryDate: "2028-12-31",
      status: res.cert_status === "CONFIRMED" ? "Valid" : "Under Review",
      verificationStatus: res.cert_status === "CONFIRMED" ? "Verified" : "Pending",
      digitalSignature: "ED25519-DQAA-VALIDATED",
    } : null,
    timeline: [
      {
        id: "t-1",
        timestamp: res.created_at || new Date().toISOString(),
        title: "Asset Registration",
        description: `Asset registered by ${res.registered_by_name || "Procurement Officer"}. Initial state: ${res.lifecycle_state}.`,
        category: "registration",
      }
    ],
    batchId: res.batch_id || "BATCH-001",
    type: res.type,
    lifecycle: res.lifecycle_state,
    supplier: res.supplier,
    registeredBy: res.registered_by_name || "System",
    registeredAt: res.created_at,
    updatedAt: res.updated_at,
    evidenceCount: res.evidence_count || 0,
    certId: res.cert_id || undefined,
  };
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "maintenance" | "proof" | "timeline">("all");
  const [apiAsset, setApiAsset] = useState<DefenceAsset | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      assetService.getAsset(id)
        .then((res) => {
          if (res) {
            setApiAsset(mapBackendToDefenceAsset(res));
          }
        })
        .catch((err) => {
          console.warn("Could not fetch asset from backend:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const fallbackAsset = INITIAL_DEFENCE_ASSETS.find((a) => a.id === id || a.serialNumber === id) || null;
  const asset = apiAsset || fallbackAsset;

  const copyToClipboard = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Status badge helper
  const renderStatusBadge = (status: DefenceAsset["status"]) => {
    const config: Record<
      DefenceAsset["status"],
      { bg: string; text: string; border: string; dot: string }
    > = {
      Active: {
        bg: "rgba(34, 197, 94, 0.14)",
        text: "#22c55e",
        border: "rgba(34, 197, 94, 0.35)",
        dot: "#22c55e",
      },
      "Under Maintenance": {
        bg: "rgba(245, 158, 11, 0.14)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.35)",
        dot: "#f59e0b",
      },
      Inactive: {
        bg: "rgba(148, 163, 184, 0.12)",
        text: "#94a3b8",
        border: "rgba(148, 163, 184, 0.3)",
        dot: "#94a3b8",
      },
      Decommissioned: {
        bg: "rgba(239, 68, 68, 0.14)",
        text: "#ef4444",
        border: "rgba(239, 68, 68, 0.35)",
        dot: "#ef4444",
      },
    };

    const c = config[status] || config["Active"];

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "4px",
          fontSize: "0.8125rem",
          fontWeight: 600,
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: c.dot,
          }}
        />
        {status}
      </span>
    );
  };

  // Verification badge helper
  const renderVerificationBadge = (verification: DefenceAsset["verificationStatus"]) => {
    const config: Record<
      DefenceAsset["verificationStatus"],
      { bg: string; text: string; border: string; icon: string }
    > = {
      Verified: {
        bg: "rgba(34, 197, 94, 0.12)",
        text: "#22c55e",
        border: "rgba(34, 197, 94, 0.3)",
        icon: "✓",
      },
      "Pending Verification": {
        bg: "rgba(245, 158, 11, 0.12)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.3)",
        icon: "◐",
      },
      "Verification Required": {
        bg: "rgba(56, 189, 248, 0.12)",
        text: "#38bdf8",
        border: "rgba(56, 189, 248, 0.3)",
        icon: "⚠",
      },
    };

    const c = config[verification] || config["Verified"];

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "4px",
          fontSize: "0.8125rem",
          fontWeight: 600,
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
        }}
      >
        <span style={{ fontSize: "0.75rem" }}>{c.icon}</span>
        {verification}
      </span>
    );
  };

  // Classification styling
  const classificationColor: Record<string, { bg: string; text: string; border: string }> = {
    RESTRICTED: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", border: "rgba(96,165,250,0.3)" },
    CONFIDENTIAL: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" },
    SECRET: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
    "TOP SECRET / DEFENCE": {
      bg: "rgba(168,85,247,0.14)",
      text: "#c084fc",
      border: "rgba(168,85,247,0.4)",
    },
  };

  if (loading) {
    return (
      <div className="page-fade" style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center" }}>
        <div className="panel" style={{ padding: "60px 32px" }}>
          <div style={{ fontSize: "1.2rem", color: "#60a5fa", marginBottom: 12 }}>
            Loading Defence Asset Record...
          </div>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Querying sovereign asset registry for {id}
          </p>
        </div>
      </div>
    );
  }

  // If asset is not found
  if (!asset) {
    return (
      <div className="page-fade" style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center" }}>
        <div className="panel" style={{ padding: "60px 32px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              color: "#ef4444",
              margin: "0 auto 20px",
            }}
          >
            ✕
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 10,
              letterSpacing: "0.02em",
            }}
          >
            DEFENCE ASSET NOT FOUND
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: 24, lineHeight: 1.6 }}>
            No classified or active defence asset record exists for identifier:{" "}
            <span className="font-mono-id" style={{ color: "#f87171" }}>
              {id}
            </span>
            . Please ensure you have the correct authorization code or catalogue ID.
          </p>
          <Link
            to="/app/assets"
            className="btn-primary"
            style={{ padding: "10px 20px", textDecoration: "none" }}
          >
            ← Back to Defence Assets
          </Link>
        </div>
      </div>
    );
  }

  const classStyle =
    classificationColor[asset.classification] || classificationColor["RESTRICTED"];

  return (
    <div className="page-fade" style={{ maxWidth: "1440px", margin: "0 auto" }}>
      {/* Top Breadcrumb & Navigation Bar */}
      <PageHeader
        title={asset.name}
        subtitle={`${asset.category} · System Reference: ${asset.model}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Defence Assets", to: "/app/assets" },
          { label: asset.id },
        ]}
        badge={
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              padding: "4px 8px",
              borderRadius: "3px",
              background: classStyle.bg,
              color: classStyle.text,
              border: `1px solid ${classStyle.border}`,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {asset.classification}
          </span>
        }
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Link
              to="/app/assets"
              className="btn-secondary"
              style={{
                padding: "7px 14px",
                fontSize: "0.75rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back to Defence Assets
            </Link>
            <button
              onClick={() => window.print()}
              className="btn-ghost"
              style={{
                padding: "7px 12px",
                fontSize: "0.75rem",
                border: "1px solid #1e3a60",
                color: "#94a3b8",
              }}
            >
              🖶 Export Dossier
            </button>
          </div>
        }
      />

      {/* Section Quick Filter Tabs */}
      <div
        style={{
          borderBottom: "1px solid #1e3a60",
          marginBottom: 24,
          display: "flex",
          gap: 4,
          overflowX: "auto",
        }}
      >
        {[
          { key: "all", label: "Complete Dossier" },
          { key: "maintenance", label: `Maintenance History (${asset.maintenanceHistory.length})` },
          { key: "proof", label: "Blockchain & Proof Reference" },
          { key: "timeline", label: `Lifecycle Timeline (${asset.timeline.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`tab-btn${activeTab === t.key ? " active" : ""}`}
            style={{
              padding: "10px 18px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              borderBottom: activeTab === t.key ? "2px solid #2563eb" : "2px solid transparent",
              color: activeTab === t.key ? "#60a5fa" : "#64748b",
              background: "transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* ========================================================================= */}
        {/* 1. ASSET OVERVIEW & SUMMARY TILES */}
        {/* ========================================================================= */}
        <div
          className="panel"
          style={{
            padding: "24px 28px",
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#64748b",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                1. ASSET OVERVIEW · CLASSIFIED MATERIEL
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 700,
                  color: "var(--foreground, #171717)",
                  margin: "0 0 8px 0",
                  letterSpacing: "0.02em",
                }}
              >
                {asset.name}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8125rem", color: "var(--muted, #4A4A4A)" }}>
                  Asset ID:{" "}
                  <strong className="font-mono-id" style={{ color: "var(--primary, #2563eb)" }}>
                    {asset.id}
                  </strong>
                </span>
                <button
                  onClick={() => copyToClipboard(asset.id, "assetId")}
                  style={{
                    background: "var(--panel-muted, #132040)",
                    border: "1px solid var(--border, #1e3a60)",
                    borderRadius: "4px",
                    padding: "3px 8px",
                    fontSize: "0.6875rem",
                    color: copiedField === "assetId" ? "#22c55e" : "var(--muted, #4A4A4A)",
                    cursor: "pointer",
                  }}
                >
                  {copiedField === "assetId" ? "✓ Copied" : "Copy ID"}
                </button>
                <span style={{ color: "var(--border, #334155)" }}>|</span>
                <span style={{ fontSize: "0.8125rem", color: "var(--muted, #4A4A4A)" }}>
                  Serial No:{" "}
                  <span className="font-mono-id" style={{ color: "var(--foreground, #171717)", fontWeight: 600 }}>
                    {asset.serialNumber}
                  </span>
                </span>
                <button
                  onClick={() => copyToClipboard(asset.serialNumber, "serial")}
                  style={{
                    background: "var(--panel-muted, #132040)",
                    border: "1px solid var(--border, #1e3a60)",
                    borderRadius: "4px",
                    padding: "3px 8px",
                    fontSize: "0.6875rem",
                    color: copiedField === "serial" ? "#22c55e" : "var(--muted, #4A4A4A)",
                    cursor: "pointer",
                  }}
                >
                  {copiedField === "serial" ? "✓ Copied" : "Copy Serial"}
                </button>
                <span style={{ color: "var(--border, #334155)" }}>|</span>
                <span style={{ fontSize: "0.8125rem", color: "var(--muted, #4A4A4A)" }}>
                  Category:{" "}
                  <span style={{ color: "var(--foreground, #171717)", fontWeight: 600 }}>{asset.category}</span>
                </span>
              </div>
            </div>

            {/* Badges in Overview */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: "0.6875rem", color: "var(--subtle-text, #707070)", fontWeight: 700 }}>
                  CURRENT STATUS
                </span>
                {renderStatusBadge(asset.status)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: "0.6875rem", color: "var(--subtle-text, #707070)", fontWeight: 700 }}>
                  VERIFICATION STATUS
                </span>
                {renderVerificationBadge(asset.verificationStatus)}
              </div>
            </div>
          </div>

          {/* Quick telemetry tiles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                background: "var(--panel-muted, #181818)",
                borderRadius: "8px",
                border: "1px solid var(--border, #2a2a2a)",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "var(--subtle-text, #707070)", fontWeight: 700, marginBottom: 4 }}>
                ASSIGNED CUSTODIAN
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--foreground, #171717)", fontWeight: 600 }}>
                {asset.custodian}
              </div>
            </div>
            <div
              style={{
                padding: "14px 16px",
                background: "var(--panel-muted, #181818)",
                borderRadius: "8px",
                border: "1px solid var(--border, #2a2a2a)",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "var(--subtle-text, #707070)", fontWeight: 700, marginBottom: 4 }}>
                DEPLOYMENT BASE / DEPOT
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--foreground, #171717)", fontWeight: 600 }}>
                {asset.location}
              </div>
            </div>
            <div
              style={{
                padding: "14px 16px",
                background: "var(--panel-muted, #181818)",
                borderRadius: "8px",
                border: "1px solid var(--border, #2a2a2a)",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "var(--subtle-text, #707070)", fontWeight: 700, marginBottom: 4 }}>
                LAST SERVICING DATE
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--foreground, #171717)", fontWeight: 600 }}>
                {formatDate(asset.lastMaintenanceDate)}
              </div>
            </div>
            <div
              style={{
                padding: "14px 16px",
                background: "var(--panel-muted, #181818)",
                borderRadius: "8px",
                border: "1px solid var(--border, #2a2a2a)",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "var(--subtle-text, #707070)", fontWeight: 700, marginBottom: 4 }}>
                LEDGER CONSENSUS PROOF
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: asset.proofStatus === "Anchored" ? "#16a34a" : "#d97706",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{asset.proofStatus === "Anchored" ? "✓" : "◐"}</span>
                {asset.proofStatus}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. ASSET INFORMATION (Clean Information-Card / Grid Layout) */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "maintenance") && (
          <div className="panel" style={{ padding: "24px 28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#60a5fa",
                  textTransform: "uppercase",
                }}
              >
                2. ASSET INFORMATION SPECIFICATIONS
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                MIL-STD Compliant Configuration
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {/* Card 1: Identification */}
              <div
                style={{
                  padding: "16px 18px",
                  background: "var(--panel-muted, #181818)",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #2a2a2a)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--subtle-text, #707070)",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    marginBottom: 12,
                    textTransform: "uppercase",
                  }}
                >
                  IDENTIFICATION & CODIFICATION
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Asset ID</span>
                    <span className="font-mono-id" style={{ color: "var(--primary, #2563eb)" }}>
                      {asset.id}
                    </span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Serial Number</span>
                    <span className="font-mono-id" style={{ color: "var(--foreground, #171717)" }}>
                      {asset.serialNumber}
                    </span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Category / Class</span>
                    <span style={{ color: "var(--foreground, #171717)", fontWeight: 600 }}>{asset.category}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Model Ref</span>
                    <span style={{ color: "var(--muted, #4A4A4A)" }}>{asset.model}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Manufacture & Custody */}
              <div
                style={{
                  padding: "16px 18px",
                  background: "var(--panel-muted, #181818)",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #2a2a2a)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--subtle-text, #707070)",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    marginBottom: 12,
                    textTransform: "uppercase",
                  }}
                >
                  MANUFACTURE & CUSTODY
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Manufacturer</span>
                    <span style={{ color: "var(--foreground, #171717)" }}>{asset.manufacturer}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Current Owner / Dept</span>
                    <span style={{ color: "var(--foreground, #171717)", fontWeight: 600 }}>{asset.department}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Station Location</span>
                    <span style={{ color: "var(--muted, #4A4A4A)" }}>{asset.location}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Command Custodian</span>
                    <span style={{ color: "var(--muted, #4A4A4A)" }}>{asset.custodian}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Acquisition & Procurement */}
              <div
                style={{
                  padding: "16px 18px",
                  background: "var(--panel-muted, #181818)",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #2a2a2a)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--subtle-text, #707070)",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    marginBottom: 12,
                    textTransform: "uppercase",
                  }}
                >
                  ACQUISITION & PROCUREMENT
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Acquisition Date</span>
                    <span style={{ color: "var(--foreground, #171717)" }}>{formatDate(asset.acquisitionDate)}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Acquisition Method</span>
                    <span style={{ color: "var(--muted, #4A4A4A)" }}>{asset.acquisitionMethod}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Supplier / Entity</span>
                    <span style={{ color: "var(--muted, #4A4A4A)" }}>{asset.supplier}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Batch Codification</span>
                    <span className="font-mono-id" style={{ color: "var(--muted, #4A4A4A)" }}>
                      {asset.batchId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subsystem & Mission Description */}
            <div
              style={{
                padding: "16px 20px",
                background: "var(--panel-muted, #181818)",
                borderRadius: "8px",
                border: "1px solid var(--border, #2a2a2a)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--subtle-text, #707070)",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  TACTICAL MISSION CAPABILITIES & TECHNICAL SPECIFICATIONS
                </span>
                <p style={{ margin: "6px 0 0 0", fontSize: "0.8125rem", color: "var(--foreground, #171717)", lineHeight: 1.5 }}>
                  {asset.specsSummary}
                </p>
              </div>
              <div style={{ paddingTop: 8, borderTop: "1px solid var(--border-subtle, #242424)" }}>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--subtle-text, #707070)",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  SYSTEM PROFILE & HISTORICAL BACKGROUND
                </span>
                <p style={{ margin: "6px 0 0 0", fontSize: "0.8125rem", color: "var(--muted, #4A4A4A)", lineHeight: 1.6 }}>
                  {asset.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. MAINTENANCE HISTORY */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "maintenance") && (
          <div className="panel" style={{ padding: "24px 28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#60a5fa",
                    textTransform: "uppercase",
                  }}
                >
                  3. MAINTENANCE & SERVICING HISTORY
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                  Scheduled overhauls, diagnostic tests, and telemetry calibrations
                </div>
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  background: "#132040",
                  padding: "3px 10px",
                  borderRadius: "4px",
                  border: "1px solid #1e3a60",
                }}
              >
                {asset.maintenanceHistory.length} Logged Incidents
              </span>
            </div>

            {asset.maintenanceHistory.length === 0 ? (
              /* Empty state for maintenance */
              <div
                style={{
                  padding: "36px 20px",
                  textAlign: "center",
                  background: "var(--panel-muted, #181818)",
                  borderRadius: "8px",
                  border: "1px dashed var(--border, #2a2a2a)",
                }}
              >
                <div style={{ fontSize: "1.5rem", color: "var(--subtle-text, #707070)", marginBottom: 6 }}>⚙</div>
                <div style={{ fontSize: "0.875rem", color: "var(--foreground, #171717)", fontWeight: 700 }}>
                  No Maintenance History Recorded
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted, #4A4A4A)", marginTop: 4 }}>
                  This asset has no reported maintenance incidents or servicing cycles on file.
                </div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 780,
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
                      <th style={tableHeaderStyle}>Maintenance Date</th>
                      <th style={tableHeaderStyle}>Maintenance Type</th>
                      <th style={tableHeaderStyle}>Performed By</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle}>Notes / Telemetry Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asset.maintenanceHistory.map((rec, idx) => (
                      <tr
                        key={rec.id}
                        style={{
                          borderBottom:
                            idx === asset.maintenanceHistory.length - 1
                              ? "none"
                              : "1px solid var(--border-subtle, #242424)",
                        }}
                      >
                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span className="font-mono-id" style={{ color: "var(--muted, #4A4A4A)" }}>
                            {formatDate(rec.date)}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: "0.8125rem", color: "var(--foreground, #171717)", fontWeight: 600 }}>
                            {rec.type}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: "0.8125rem", color: "var(--foreground, #171717)" }}>
                            {rec.performedBy}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "2px 8px",
                              borderRadius: "3px",
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                              background:
                                rec.status === "Completed"
                                  ? "rgba(34, 197, 94, 0.12)"
                                  : "rgba(245, 158, 11, 0.12)",
                              color: rec.status === "Completed" ? "#16a34a" : "#d97706",
                              border:
                                rec.status === "Completed"
                                  ? "1px solid rgba(34, 197, 94, 0.3)"
                                  : "1px solid rgba(245, 158, 11, 0.3)",
                            }}
                          >
                            <span>{rec.status === "Completed" ? "✓" : "⚙"}</span>
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted, #4A4A4A)", lineHeight: 1.4 }}>
                            {rec.notes}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BLOCKCHAIN / PROOF REFERENCE */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "proof") && (
          <div
            className="panel"
            style={{
              padding: "24px 28px",
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#38bdf8",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>⬡</span>
                  4. BLOCKCHAIN & CRYPTOGRAPHIC PROOF REFERENCE
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                  Tamper-evident verification parameters registered on the NOVEXA Defence Ledger
                </div>
              </div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: "3px",
                  background: "rgba(34, 197, 94, 0.12)",
                  color: "#22c55e",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  letterSpacing: "0.04em",
                }}
              >
                ● IMMUTABLE ANCHOR ACTIVE
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
                marginBottom: 18,
              }}
            >
              {/* Proof field 1: Verification status */}
              <div style={proofBoxStyle}>
                <div style={proofBoxLabelStyle}>BLOCKCHAIN VERIFICATION STATUS</div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#38bdf8",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>🔒</span> {asset.blockchainProof.verificationStatus}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: 4 }}>
                  {asset.blockchainProof.consensusSeal}
                </div>
              </div>

              {/* Proof field 2: Block & Confirmations */}
              <div style={proofBoxStyle}>
                <div style={proofBoxLabelStyle}>BLOCK & CONFIRMATIONS</div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground, #171717)" }}>
                  Block #{asset.blockchainProof.blockNumber.toLocaleString()}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "#16a34a", marginTop: 4, fontWeight: 600 }}>
                  ✓ {asset.blockchainProof.confirmations.toLocaleString()} Multi-party Confirmations
                </div>
              </div>

              {/* Proof field 3: Timestamp */}
              <div style={proofBoxStyle}>
                <div style={proofBoxLabelStyle}>VERIFICATION TIMESTAMP</div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground, #171717)" }}>
                  {formatDateTime(asset.blockchainProof.timestamp)}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--subtle-text, #707070)", marginTop: 4 }}>
                  Consensus Standard: {asset.blockchainProof.proofStandard}
                </div>
              </div>
            </div>

            {/* Hashes and Transaction IDs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Asset Hash / Proof Reference */}
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--panel-muted, #181818)",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #2a2a2a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--subtle-text, #707070)", fontWeight: 700 }}>
                    ASSET HASH / PROOF REFERENCE (SHA-256)
                  </div>
                  <div
                    className="font-mono-id"
                    style={{
                      color: "var(--primary, #2563eb)",
                      wordBreak: "break-all",
                      fontSize: "0.8125rem",
                      marginTop: 2,
                    }}
                  >
                    {asset.blockchainProof.assetHash}
                  </div>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(asset.blockchainProof.assetHash, "assetHash")
                  }
                  className="btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "4px 10px", flexShrink: 0 }}
                >
                  {copiedField === "assetHash" ? "✓ Copied" : "Copy Hash"}
                </button>
              </div>

              {/* Transaction / Reference ID */}
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--panel-muted, #181818)",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #2a2a2a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--subtle-text, #707070)", fontWeight: 700 }}>
                    TRANSACTION / REFERENCE ID
                  </div>
                  <div
                    className="font-mono-id"
                    style={{
                      color: "var(--foreground, #171717)",
                      wordBreak: "break-all",
                      fontSize: "0.8125rem",
                      marginTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    {asset.blockchainProof.transactionId}
                  </div>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(asset.blockchainProof.transactionId, "txId")
                  }
                  className="btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "4px 10px", flexShrink: 0 }}
                >
                  {copiedField === "txId" ? "✓ Copied" : "Copy TxID"}
                </button>
              </div>
            </div>

            {/* Security note */}
            <div
              style={{
                marginTop: 14,
                padding: "12px 16px",
                background: "var(--primary-muted, rgba(37, 99, 235, 0.08))",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle, rgba(37, 99, 235, 0.2))",
                fontSize: "0.75rem",
                color: "var(--muted, #4A4A4A)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: "var(--primary, #2563eb)", fontWeight: 700 }}>ℹ</span>
              <span>
                Ledger reference is permanently anchored to the private permissioned defence ledger
                subnet. Cryptographic hashes are verifiable against Ministry of Defence Trust Roots.
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. CERTIFICATION INFORMATION */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "proof") && (
          <div className="panel" style={{ padding: "24px 28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#60a5fa",
                    textTransform: "uppercase",
                  }}
                >
                  5. CERTIFICATION INFORMATION
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                  Official military airworthiness, ballistic, or technical compliance credentials
                </div>
              </div>
              {asset.certification && (
                <button
                  onClick={() => setShowCertModal(true)}
                  className="btn-primary"
                  style={{
                    padding: "6px 14px",
                    fontSize: "0.75rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>📜</span> View Certificate
                </button>
              )}
            </div>

            {!asset.certification ? (
              /* Empty state for certification */
              <div
                style={{
                  padding: "36px 20px",
                  textAlign: "center",
                  background: "var(--panel-muted, #181818)",
                  borderRadius: "8px",
                  border: "1px dashed var(--border, #2a2a2a)",
                }}
              >
                <div style={{ fontSize: "1.5rem", color: "var(--subtle-text, #707070)", marginBottom: 6 }}>◆</div>
                <div style={{ fontSize: "0.875rem", color: "var(--foreground, #171717)", fontWeight: 700 }}>
                  No Active Certification Associated
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted, #4A4A4A)", marginTop: 4 }}>
                  This defence asset does not currently have an active quality or airworthiness
                  certificate on file.
                </div>
              </div>
            ) : (
              /* Populated Certification Info */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                  background: "var(--panel-muted, #181818)",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #2a2a2a)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Certificate ID</span>
                    <span className="font-mono-id" style={{ color: "#16a34a", fontWeight: 700 }}>
                      {asset.certification.certificateId}
                    </span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Certification Type</span>
                    <span style={{ color: "var(--foreground, #171717)", fontWeight: 600 }}>
                      {asset.certification.type}
                    </span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Issuing Authority</span>
                    <span style={{ color: "var(--foreground, #171717)" }}>
                      {asset.certification.issuingAuthority}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Issue Date</span>
                    <span style={{ color: "var(--foreground, #171717)" }}>
                      {formatDate(asset.certification.issueDate)}
                    </span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Expiry Date / Validity</span>
                    <span style={{ color: "var(--muted, #4A4A4A)" }}>
                      {formatDate(asset.certification.expiryDate)}
                    </span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Certification Status</span>
                    <span
                      style={{
                        padding: "2px 7px",
                        borderRadius: "3px",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        background:
                          asset.certification.status === "Valid" || asset.certification.status === "Active"
                            ? "rgba(34, 197, 94, 0.12)"
                            : "rgba(239, 68, 68, 0.12)",
                        color:
                          asset.certification.status === "Valid" || asset.certification.status === "Active"
                            ? "#16a34a"
                            : "#dc2626",
                        border:
                          asset.certification.status === "Valid" || asset.certification.status === "Active"
                            ? "1px solid rgba(34, 197, 94, 0.3)"
                            : "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      {asset.certification.status}
                    </span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Verification Status</span>
                    <span style={{ color: "#16a34a", fontSize: "0.75rem", fontWeight: 700 }}>
                      ✓ Cryptographically Sealed
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. ASSET TIMELINE / HISTORY */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "timeline") && (
          <div className="panel" style={{ padding: "24px 28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#60a5fa",
                    textTransform: "uppercase",
                  }}
                >
                  6. ASSET TIMELINE & AUDIT HISTORY
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                  Chronological provenance trail from initial acquisition to present state
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                {asset.timeline.length} Recorded Milestone Events
              </span>
            </div>

            {/* Timeline track */}
            <div style={{ position: "relative", paddingLeft: "24px" }}>
              {/* Vertical line connecting nodes */}
              <div
                style={{
                  position: "absolute",
                  left: 7,
                  top: 8,
                  bottom: 12,
                  width: 2,
                  background: "linear-gradient(180deg, #2563eb 0%, #1e3a60 100%)",
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {asset.timeline.map((event) => (
                  <div key={event.id} style={{ position: "relative" }}>
                    {/* Node circle */}
                    <div
                      style={{
                        position: "absolute",
                        left: -24,
                        top: 2,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: "var(--card, #08131f)",
                        border: "2px solid #3b82f6",
                        boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
                      }}
                    />

                    {/* Timeline card */}
                    <div
                      style={{
                        padding: "14px 18px",
                        background: "var(--panel-muted, #181818)",
                        borderRadius: "8px",
                        border: "1px solid var(--border, #2a2a2a)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "var(--foreground, #171717)",
                          }}
                        >
                          {event.title}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {event.referenceBadge && (
                            <span
                              className="font-mono-id"
                              style={{
                                fontSize: "0.6875rem",
                                color: "#2563eb",
                                background: "rgba(37, 99, 235, 0.1)",
                                padding: "2px 6px",
                                borderRadius: "3px",
                                border: "1px solid rgba(37, 99, 235, 0.25)",
                              }}
                            >
                              {event.referenceBadge}
                            </span>
                          )}
                          <span style={{ fontSize: "0.75rem", color: "var(--muted, #4A4A4A)" }}>
                            {formatDateTime(event.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--muted, #4A4A4A)", lineHeight: 1.5 }}>
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW CERTIFICATE MODAL */}
      {/* ========================================================================= */}
      {showCertModal && asset.certification && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 7, 18, 0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowCertModal(false)}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 620,
              background: "var(--card)",
              borderColor: "var(--border)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                background: "var(--table-header-bg)",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.25rem", color: "#22c55e" }}>🛡</span>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--foreground, #171717)",
                    }}
                  >
                    OFFICIAL DEFENCE MATERIEL CERTIFICATE
                  </h3>
                  <span style={{ fontSize: "0.6875rem", color: "var(--muted, #4A4A4A)" }}>
                    Cryptographically Validated by Ministry of Defence Authority
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted, #4A4A4A)",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Certificate Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Certificate Crest & Title */}
              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  background: "var(--panel-muted, rgba(30, 58, 96, 0.2))",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #1e3a60)",
                }}
              >
                <div style={{ fontSize: "1.75rem", marginBottom: 6 }}>⚖</div>
                <div
                  className="font-display"
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--primary, #2563eb)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {asset.certification.issuingAuthority}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--foreground, #171717)", marginTop: 4 }}>
                  {asset.certification.type}
                </div>
                <div
                  className="font-mono-id"
                  style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: 6, fontWeight: 600 }}
                >
                  CERTIFICATE NO: {asset.certification.certificateId}
                </div>
              </div>

              {/* Certificate details table */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: "0.8125rem",
                  padding: "12px 14px",
                  background: "var(--panel-muted, #08131f)",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #152b4a)",
                }}
              >
                <div style={infoRowStyle}>
                  <span style={{ color: "var(--muted, #4A4A4A)" }}>Certified Asset:</span>
                  <span style={{ color: "var(--foreground, #171717)", fontWeight: 600 }}>{asset.name}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: "var(--muted, #4A4A4A)" }}>Unique Serial Number:</span>
                  <span className="font-mono-id" style={{ color: "var(--foreground, #171717)" }}>
                    {asset.serialNumber}
                  </span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: "var(--muted, #4A4A4A)" }}>Date of Issuance:</span>
                  <span style={{ color: "var(--foreground, #171717)" }}>
                    {formatDate(asset.certification.issueDate)}
                  </span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: "var(--muted, #4A4A4A)" }}>Valid Until:</span>
                  <span style={{ color: "var(--foreground, #171717)" }}>
                    {formatDate(asset.certification.expiryDate)}
                  </span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: "var(--muted, #4A4A4A)" }}>Compliance Standard:</span>
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>MIL-STD-810G / STANAG Validated</span>
                </div>
              </div>

              {/* Digital Signature */}
              <div
                style={{
                  padding: "10px 14px",
                  background: "var(--panel-muted, #08131f)",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #152b4a)",
                }}
              >
                <div style={{ fontSize: "0.6875rem", color: "var(--muted, #4A4A4A)", fontWeight: 600 }}>
                  AUTHORITY DIGITAL SIGNATURE (ECDSA SHA-256)
                </div>
                <div
                  className="font-mono-id"
                  style={{ fontSize: "0.75rem", color: "var(--primary, #2563eb)", wordBreak: "break-all" }}
                >
                  {asset.certification.digitalSignature}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 20px",
                background: "var(--panel-muted, #08131f)",
                borderTop: "1px solid var(--border, #1e3a60)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ fontSize: "0.75rem" }}
              >
                🖶 Print Credential
              </button>
              <button
                onClick={() => setShowCertModal(false)}
                className="btn-primary"
                style={{ fontSize: "0.75rem" }}
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: "0.6875rem",
  fontWeight: 700,
  color: "var(--muted, #4A4A4A)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  background: "var(--table-header-bg, #f1f1f2)",
};

const infoRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: 6,
  borderBottom: "1px solid var(--border-subtle, #242424)",
  fontSize: "0.8125rem",
};

const infoLabelStyle: React.CSSProperties = {
  color: "var(--muted, #4A4A4A)",
  fontSize: "0.75rem",
  fontWeight: 600,
};

const proofBoxStyle: React.CSSProperties = {
  padding: "14px 16px",
  background: "var(--panel-muted, #181818)",
  borderRadius: "8px",
  border: "1px solid var(--border, #2a2a2a)",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const proofBoxLabelStyle: React.CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--muted, #4A4A4A)",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};
