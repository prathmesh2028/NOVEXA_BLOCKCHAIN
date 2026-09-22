import React, { useState } from "react";
import { Link } from "react-router";
import StatusBadge from "../../components/ui/StatusBadge";
import { DefenceAsset } from "./assetData";
import { formatDateTime } from "../../data/utils";

interface AssetDetailDrawerProps {
  asset: DefenceAsset | null;
  onClose: () => void;
}

export default function AssetDetailDrawer({ asset, onClose }: AssetDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!asset) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(asset.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const classificationColor: Record<string, { bg: string; text: string; border: string }> = {
    "RESTRICTED": { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", border: "rgba(96,165,250,0.3)" },
    "CONFIDENTIAL": { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" },
    "SECRET": { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
    "TOP SECRET / DEFENCE": { bg: "rgba(168,85,247,0.14)", text: "#c084fc", border: "rgba(168,85,247,0.4)" },
  };

  const classStyle = classificationColor[asset.classification] || classificationColor["RESTRICTED"];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3, 7, 18, 0.72)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          height: "100%",
          backgroundColor: "#0c1828",
          borderLeft: "1px solid #1e3a60",
          boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #1e3a60",
            backgroundColor: "#08131f",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  padding: "3px 8px",
                  borderRadius: "3px",
                  backgroundColor: classStyle.bg,
                  color: classStyle.text,
                  border: `1px solid ${classStyle.border}`,
                }}
              >
                {asset.classification}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>DEFENCE SPEC: MIL-STD</span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "1.25rem",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Close drawer"
            >
              ✕
            </button>
          </div>

          <div>
            <h2
              className="font-display"
              style={{
                margin: 0,
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "#e2e8f0",
                letterSpacing: "0.02em",
              }}
            >
              {asset.name}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <span className="meta-id" style={{ color: "#60a5fa", fontSize: "0.85rem" }}>
                {asset.id}
              </span>
              <button
                onClick={handleCopyId}
                style={{
                  background: "#132040",
                  border: "1px solid #1e3a60",
                  borderRadius: "3px",
                  padding: "2px 8px",
                  fontSize: "0.6875rem",
                  color: copied ? "#22c55e" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                {copied ? "✓ Copied" : "Copy ID"}
              </button>
              <span style={{ color: "#475569" }}>·</span>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{asset.type}</span>
            </div>
          </div>
        </div>

        {/* Status Indicators Banner */}
        <div
          style={{
            padding: "14px 24px",
            backgroundColor: "#070f1d",
            borderBottom: "1px solid #152b4a",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: 4 }}>LIFECYCLE STATUS</div>
            <StatusBadge status={asset.lifecycle} size="sm" />
          </div>
          <div>
            <div className="section-label" style={{ marginBottom: 4 }}>CRYPTOGRAPHIC TRUST</div>
            <StatusBadge status={asset.verification || asset.verificationStatus || "PENDING"} size="sm" />
          </div>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          
          {/* Tactical Logistics */}
          <div className="panel" style={{ padding: 16 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>TACTICAL DEPLOYMENT & LOCATION</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "#64748b" }}>Current Base Depot:</span>
                <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{asset.location}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "#64748b" }}>Command Division:</span>
                <span style={{ color: "#94a3b8" }}>{asset.department}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "#64748b" }}>Assigned Custodian:</span>
                <span style={{ color: "#94a3b8" }}>{asset.custodian || "Base Ordnance Officer"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "#64748b" }}>Maintenance Status:</span>
                <span style={{ 
                  color: asset.maintenanceStatus === "Operational" ? "#22c55e" : asset.maintenanceStatus === "Quarantined" ? "#ef4444" : "#f59e0b",
                  fontWeight: 600,
                }}>
                  {asset.maintenanceStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Identification */}
          <div className="panel" style={{ padding: 16 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>TECHNICAL SPECIFICATIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "#64748b" }}>Model Number:</span>
                <span className="meta-id">{asset.model}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "#64748b" }}>Serial Number:</span>
                <span className="meta-id">{asset.serialNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "#64748b" }}>Batch Identifier:</span>
                <span className="meta-id">{asset.batchId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "#64748b" }}>Manufacturer / Supplier:</span>
                <span style={{ color: "#94a3b8" }}>{asset.supplier}</span>
              </div>
              {asset.specsSummary && (
                <div style={{ marginTop: 6, paddingTop: 8, borderTop: "1px solid #152b4a" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Subsystem Architecture:</span>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                    {asset.specsSummary}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cryptographic Ledger & Evidence Integrity */}
          <div className="panel" style={{ padding: 16 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>IMMUTABLE LEDGER & EVIDENCE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8125rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Evidence Documents:</span>
                <span style={{ color: "#e2e8f0" }}>{asset.evidenceCount} verified hashes</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Certification Token:</span>
                <span className="meta-id" style={{ color: asset.certId ? "#22c55e" : "#64748b" }}>
                  {asset.certId || "Uncertified"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Last Audit Synchronized:</span>
                <span style={{ color: "#94a3b8" }}>{formatDateTime(asset.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ padding: "12px 16px", background: "#08131f", border: "1px solid #152b4a", borderRadius: "5px" }}>
            <div className="section-label" style={{ marginBottom: 6 }}>REGISTRY ENTRY SUMMARY</div>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.5 }}>
              {asset.description}
            </p>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #1e3a60",
            backgroundColor: "#08131f",
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
          }}
        >
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
            Close Inspector
          </button>
          <Link
            to={`/app/assets/${asset.id}`}
            className="btn-primary"
            style={{ flex: 1.5, justifyContent: "center", textDecoration: "none" }}
          >
            Open Full Classified Dossier →
          </Link>
        </div>
      </div>
    </div>
  );
}
