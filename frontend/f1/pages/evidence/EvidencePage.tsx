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

  return (
    <div className="page-fade">
      <PageHeader
        title="Evidence"
        subtitle="Evidence records with integrity verification and blockchain anchoring"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Evidence" }]}
        actions={
          <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
            + Upload Evidence
          </button>
        }
      />

      <div
        style={{
          padding: "12px 16px",
          background: "rgba(59,130,246,0.06)",
          border: "1px solid rgba(59,130,246,0.15)",
          borderRadius: "5px",
          marginBottom: 20,
          fontSize: "0.8125rem",
          color: "#64748b",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "#60a5fa" }}>Evidence fingerprinting: </strong>
        Each uploaded file generates a SHA-256 fingerprint used to detect any subsequent changes.
        The fingerprint is anchored on-chain to create a tamper-evident record.
      </div>

      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a60", background: "#08131f" }}>
                {["Filename", "Type", "Asset", "Fingerprint (SHA-256)", "Uploaded By", "Date", "Integrity", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.6875rem", color: "#475569", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>Loading evidence...</td>
                </tr>
              ) : evidence.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>No records found</td>
                </tr>
              ) : (
                evidence.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #152b4a" }} className="table-row">
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#e2e8f0" }}>{e.filename}</div>
                      <div style={{ fontSize: "0.6875rem", color: "#475569", marginTop: 1 }}>{e.size_kb} KB · {e.mime_type}</div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{e.type}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/assets/${e.asset_id}`} style={{ textDecoration: "none" }}>
                        <span className="meta-id" style={{ color: "#60a5fa" }}>{e.asset_id}</span>
                      </Link>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="meta-id" style={{ fontSize: "0.6875rem" }}>{e.hash}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{e.event}</td>
                    <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
                      {formatDateTime(e.created_at)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {e.status === "Complete" && (
                        <span style={{ fontSize: "0.75rem", color: e.integrity_verified ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                          {e.integrity_verified ? "✓ Verified" : "✕ Mismatch"}
                        </span>
                      )}
                      {e.status !== "Complete" && <StatusBadge status={e.status} size="sm" />}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/evidence/${e.id}`} className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid #152b4a", fontSize: "0.75rem", color: "#475569" }}>
          Showing {evidence.length} of {total} evidence records (Powered by Backend API)
        </div>
      </div>

      {/* Upload Evidence Modal */}
      {showUploadModal && (
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
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 460,
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              border: "1px solid #1e3a60",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>Upload Defence Evidence</div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadStatus(null);
                }}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {uploadStatus && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 4,
                    fontSize: "0.8125rem",
                    background: uploadStatus.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    border: `1px solid ${uploadStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    color: uploadStatus.type === "success" ? "#22c55e" : "#ef4444",
                  }}
                >
                  {uploadStatus.message}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Target Asset ID
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                  value={uploadAssetId}
                  onChange={(e) => setUploadAssetId(e.target.value)}
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Evidence Type / Category
                </label>
                <select
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
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
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Evidence Document (File content will be hashed via SHA-256)
                </label>
                <input
                  type="file"
                  style={{ width: "100%", padding: "8px 0", color: "#94a3b8", fontSize: "0.8125rem" }}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-ghost"
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
