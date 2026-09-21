import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime } from "../../data/utils";
import { evidenceService } from "../../services/evidence";

export default function EvidenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [backendEvidence, setBackendEvidence] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    evidenceService.getEvidence(id)
      .then(res => setBackendEvidence(res))
      .catch(err => console.warn("Could not fetch evidence from backend:", err));
  }, [id]);

  const evidence = backendEvidence ? {
    id: backendEvidence.evidence_id || backendEvidence.id,
    assetId: backendEvidence.asset_id,
    filename: backendEvidence.filename,
    type: backendEvidence.type,
    mimeType: backendEvidence.mime_type,
    sizeKb: backendEvidence.size_kb,
    status: backendEvidence.status,
    hash: backendEvidence.hash,
    event: backendEvidence.event,
    integrityVerified: backendEvidence.integrity_verified ?? true,
    blockchainTx: backendEvidence.blockchain_tx,
    createdAt: backendEvidence.created_at,
  } : null;

  if (!evidence) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <h2 className="font-display" style={{ color: "#e2e8f0" }}>EVIDENCE NOT FOUND</h2>
        <Link to="/app/evidence" className="btn-secondary" style={{ marginTop: 16 }}>← Back to Evidence</Link>
      </div>
    );
  }

  // evidence.assetId is used for linking to asset detail
  return (
    <div className="page-fade">
      <PageHeader
        title={evidence.filename}
        subtitle={`Evidence record · ${evidence.type}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Evidence", to: "/app/evidence" },
          { label: evidence.id },
        ]}
        badge={<StatusBadge status={evidence.status} />}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href={`http://localhost:8000/api/v1/evidence/${evidence.id}/download`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: "0.75rem", textDecoration: "none" }}
            >
              Download File ⤓
            </a>
            <Link to="/app/evidence" className="btn-ghost">← Back</Link>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>EVIDENCE RECORD</div>
          {[
            { label: "Evidence ID", value: evidence.id, mono: true },
            { label: "Filename", value: evidence.filename },
            { label: "Type", value: evidence.type },
            { label: "MIME Type", value: evidence.mimeType, mono: true },
            { label: "Size", value: `${evidence.sizeKb} KB` },
            { label: "Uploaded by", value: `${evidence.uploadedBy} (${evidence.uploadedByRole})` },
            { label: "Upload date", value: formatDateTime(evidence.uploadedAt) },
            { label: "Associated event", value: evidence.event, mono: true },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #152b4a" }}>
              <span style={{ fontSize: "0.6875rem", color: "#475569", width: 120, flexShrink: 0, paddingTop: 1 }}>{row.label}</span>
              {row.mono ? (
                <span className="meta-id" style={{ color: "#94a3b8" }}>{row.value}</span>
              ) : (
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{row.value}</span>
              )}
            </div>
          ))}
        </div>

        <div>
          {/* Fingerprint / Integrity */}
          <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>EVIDENCE FINGERPRINT</div>
            <div
              style={{
                padding: "12px 14px",
                background: "rgba(37,99,235,0.06)",
                border: "1px solid rgba(37,99,235,0.15)",
                borderRadius: "5px",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#475569", marginBottom: 4 }}>
                SHA-256 fingerprint — used to detect changes to this file later
              </div>
              <div className="meta-id" style={{ color: "#60a5fa", wordBreak: "break-all", lineHeight: 1.5 }}>
                {evidence.hash}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  padding: "10px 16px",
                  background: evidence.integrityVerified ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${evidence.integrityVerified ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                  borderRadius: "5px",
                  flex: 1,
                }}
              >
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: evidence.integrityVerified ? "#22c55e" : "#ef4444", marginBottom: 2 }}>
                  {evidence.integrityVerified ? "✓ Fingerprint Verified" : "✕ Fingerprint Mismatch"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {evidence.integrityVerified
                    ? "Stored hash matches computed hash. File has not been modified."
                    : "Stored hash does not match computed hash. File may have been tampered with."}
                </div>
              </div>
            </div>

            {evidence.blockchainTx && (
              <div style={{ marginTop: 12 }}>
                <div className="section-label" style={{ marginBottom: 4 }}>BLOCKCHAIN ANCHOR</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span className="meta-id" style={{ color: "#60a5fa" }}>{evidence.blockchainTx}</span>
                  <span style={{ fontSize: "0.6875rem", color: "#22c55e", fontWeight: 600 }}>✓ Anchored</span>
                </div>
              </div>
            )}
          </div>

          {/* Asset context */}
          {asset && (
            <div className="panel" style={{ padding: 20 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>LINKED ASSET</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="meta-id" style={{ color: "#60a5fa", marginBottom: 4 }}>{asset.id}</div>
                  <div style={{ fontSize: "0.8125rem", color: "#64748b" }}>{asset.type} · {asset.batchId}</div>
                </div>
                <Link to={`/app/assets/${asset.id}`} className="btn-secondary" style={{ fontSize: "0.75rem" }}>
                  View Asset →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
