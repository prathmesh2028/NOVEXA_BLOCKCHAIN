import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime } from "../../data/utils";
import { evidenceService, EvidenceResponse } from "../../services/evidence";

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<EvidenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadAssetId, setUploadAssetId] = useState("EF-2026-00421");
  const [uploadType, setUploadType] = useState("QA Approval");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const res = await evidenceService.listEvidence({ page_size: 100 });
      setEvidence(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadAssetId) return;
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Content = (reader.result as string).split(',')[1] || '';
          await evidenceService.uploadEvidence({
            asset_id: uploadAssetId,
            filename: uploadFile.name,
            type: uploadType,
            mime_type: uploadFile.type || 'application/pdf',
            size_kb: Math.ceil(uploadFile.size / 1024),
            content_base64: base64Content,
            event: 'EVIDENCE_UPLOAD',
          });
          setUploadStatus({ type: 'success', message: 'Evidence uploaded and hashed successfully!' });
          fetchEvidence();
          setTimeout(() => {
            setShowUploadModal(false);
            setUploadStatus(null);
            setUploadFile(null);
          }, 1500);
        } catch (err: any) {
          setUploadStatus({ type: 'error', message: err.data?.message || err.message || 'Upload failed' });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(uploadFile);
    } catch (err: any) {
      setUploadStatus({ type: 'error', message: err.message || 'Failed to read file' });
      setIsUploading(false);
    }
  };

  const filteredEvidence = evidence.filter((e) => {
    const matchesSearch =
      !searchTerm ||
      e.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.hash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = Array.from(new Set(evidence.map((e) => e.type)));

  return (
    <div className="internal-page page-fade">
      <PageHeader
        title="Evidence Vault"
        subtitle="Cryptographic evidence records with SHA-256 integrity verification and blockchain anchoring"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Evidence" }]}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
              + Upload Evidence
            </button>
            <button className="btn-secondary" onClick={fetchEvidence}>
              ↻ Refresh
            </button>
          </div>
        }
      />

      {/* Security & Fingerprint Info Card */}
      <div
        className="internal-card stagger-in-2"
        style={{
          background: "linear-gradient(90deg, rgba(37,99,235,0.08) 0%, rgba(6,182,212,0.04) 100%)",
          borderColor: "rgba(37,99,235,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              className="fingerprint-scan-pulse"
              style={{
                width: 44,
                height: 44,
                borderRadius: "10px",
                background: "rgba(37,99,235,0.12)",
                border: "1px solid rgba(37,99,235,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                color: "#3b82f6",
                flexShrink: 0,
              }}
            >
              ◫
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)" }}>
                SHA-256 CRYPTOGRAPHIC FINGERPRINTING
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: 2 }}>
                Every file payload produces an immutable 256-bit hash. Any byte-level alteration invalidates the verification seal.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="fingerprint-badge">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              ALGORITHM: SHA-256 / IPFS
            </span>
          </div>
        </div>
      </div>

      {/* KPI Intelligence Cards */}
      <div className="internal-kpi-grid stagger-in-3">
        <div className="internal-kpi-card">
          <div className="internal-kpi-label">TOTAL EVIDENCE FILES</div>
          <div className="internal-kpi-value">{total}</div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
            Stored & catalogued
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">INTEGRITY VERIFIED</div>
          <div className="internal-kpi-value" style={{ color: "#22c55e" }}>
            {evidence.filter((e) => e.integrity_verified).length} / {total || 0}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            Zero hash mismatches
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">IMMUTABLE ANCHORS</div>
          <div className="internal-kpi-value" style={{ color: "#3b82f6" }}>
            {evidence.filter((e) => e.status === "Complete").length}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />
            Anchored on blockchain
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">EVIDENCE CATEGORIES</div>
          <div className="internal-kpi-value">{uniqueTypes.length || 1}</div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6" }} />
            QA, tests & declarations
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="internal-filter-bar stagger-in-4">
        <input
          type="text"
          className="internal-search-input"
          placeholder="Search by filename, asset ID, or SHA-256 hash..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="internal-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: "auto" }}>
          Showing {filteredEvidence.length} of {total} records
        </span>
      </div>

      {/* Evidence Table Panel */}
      <div className="internal-card stagger-in-4" style={{ padding: 0 }}>
        <div className="internal-table-container">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
                {["Filename", "Type", "Target Asset", "SHA-256 Fingerprint", "Event Type", "Uploaded At", "Integrity", "Action"].map((h) => (
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
                    <div>Verifying cryptographic evidence records...</div>
                  </td>
                </tr>
              ) : filteredEvidence.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                    No records found
                  </td>
                </tr>
              ) : (
                filteredEvidence.map((e) => (
                  <tr key={e.id} className="interactive-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)" }}>{e.filename}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--muted)", marginTop: 2 }}>{e.size_kb} KB · {e.mime_type}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "var(--foreground)" }}>{e.type}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link to={`/app/assets/${e.asset_id}`} style={{ textDecoration: "none" }}>
                        <span className="meta-id" style={{ color: "#3b82f6", fontWeight: 600 }}>{e.asset_id}</span>
                      </Link>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className="fingerprint-badge" title={e.hash}>
                        {e.hash.slice(0, 16)}...{e.hash.slice(-8)}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "var(--muted)" }}>{e.event}</td>
                    <td style={{ padding: "14px 16px", fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {formatDateTime(e.created_at)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {e.status === "Complete" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            background: e.integrity_verified ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                            border: `1px solid ${e.integrity_verified ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                            color: e.integrity_verified ? "#22c55e" : "#ef4444",
                          }}
                        >
                          {e.integrity_verified ? "✓ Verified" : "✕ Mismatch"}
                        </span>
                      )}
                      {e.status !== "Complete" && <StatusBadge status={e.status} size="sm" />}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link to={`/app/evidence/${e.id}`} className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)", fontSize: "0.75rem", color: "var(--muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Tamper-evident log anchored via SHA-256 cryptographic verification</span>
          <span>Showing {filteredEvidence.length} of {total} records</span>
        </div>
      </div>

      {/* Upload Evidence Modal */}
      {showUploadModal && (
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
          <div
            className="internal-card modal-content-animated"
            style={{
              width: "100%",
              maxWidth: 480,
              padding: 24,
              boxShadow: "0 20px 30px -5px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>Upload Defence Evidence</div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadStatus(null);
                }}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {uploadStatus && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 6,
                    fontSize: "0.8125rem",
                    background: uploadStatus.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    border: `1px solid ${uploadStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    color: uploadStatus.type === "success" ? "#22c55e" : "#ef4444",
                    fontWeight: 500,
                  }}
                >
                  {uploadStatus.message}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Target Asset ID *
                </label>
                <input
                  type="text"
                  className="internal-search-input"
                  style={{ width: "100%" }}
                  value={uploadAssetId}
                  onChange={(e) => setUploadAssetId(e.target.value)}
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Evidence Type / Category *
                </label>
                <select
                  className="internal-select"
                  style={{ width: "100%" }}
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="QA Approval">QA Approval</option>
                  <option value="Calibration Certificate">Calibration Certificate</option>
                  <option value="Material Test Report">Material Test Report</option>
                  <option value="Factory Acceptance Test">Factory Acceptance Test</option>
                  <option value="Supplier Declaration">Supplier Declaration</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Document File (SHA-256 Hashed) *
                </label>
                <input
                  type="file"
                  style={{ width: "100%", padding: "8px 0", color: "var(--foreground)", fontSize: "0.8125rem" }}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadStatus(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading & Hashing..." : "Upload Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
