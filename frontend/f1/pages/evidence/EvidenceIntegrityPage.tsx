import { useState } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";

export default function EvidenceIntegrityPage() {
  const [assetId, setAssetId] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrityReport = async () => {
    if (!assetId.trim()) {
      setError("Please enter an Asset ID");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.get<any>(`/evidence/integrity-report/${assetId}`);
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch integrity report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchIntegrityReport();
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title="Evidence Integrity"
        subtitle="SHA-256 hash verification and integrity checks"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Evidence Integrity" },
        ]}
      />

      <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>INTEGRITY VERIFICATION</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            className="input"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter Asset ID (e.g. EF-2026-00421)"
            style={{ flex: 1 }}
          />
          <button
            className="btn-primary"
            onClick={fetchIntegrityReport}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Integrity"}
          </button>
        </div>
        {error && (
          <div style={{
            marginTop: 12,
            padding: "8px 12px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 4,
            fontSize: "0.8125rem",
            color: "#ef4444",
          }}>
            {error}
          </div>
        )}
      </div>

      {report && (
        <div>
          {/* Overall Status */}
          <div className="panel" style={{ padding: 20, marginBottom: 20, background: report.overall_status === "VERIFIED" ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)", border: `1px solid ${report.overall_status === "VERIFIED" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
                  OVERALL INTEGRITY STATUS
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: report.overall_status === "VERIFIED" ? "#22c55e" : "#ef4444" }}>
                  {report.overall_status}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Asset ID</div>
                <Link to={`/app/assets/${report.asset_id}`} className="meta-id" style={{ fontSize: "1rem", color: "#60a5fa" }}>
                  {report.asset_id}
                </Link>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: "0.8125rem", color: "#94a3b8" }}>
              {report.verified_count || 0} / {report.total_count || 0} evidence items verified
            </div>
          </div>

          {/* Evidence Items */}
          {report.evidence && report.evidence.length > 0 && (
            <div className="panel">
              <div style={{ padding: 16, borderBottom: "1px solid #1e3a60" }}>
                <div className="section-label">EVIDENCE ITEMS</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Evidence ID</th>
                    <th>Filename</th>
                    <th>Type</th>
                    <th>Hash (SHA-256)</th>
                    <th>Integrity</th>
                    <th>Blockchain</th>
                  </tr>
                </thead>
                <tbody>
                  {report.evidence.map((item: any) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/app/evidence/${item.evidence_id}`} className="meta-id" style={{ color: "#60a5fa" }}>
                          {item.evidence_id}
                        </Link>
                      </td>
                      <td style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{item.filename}</td>
                      <td style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.type}</td>
                      <td>
                        <span className="meta-id" style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {item.hash?.substring(0, 16)}...
                        </span>
                      </td>
                      <td>
                        {item.integrity_verified ? (
                          <span style={{ color: "#22c55e", fontSize: "0.875rem" }}>✓ Verified</span>
                        ) : (
                          <span style={{ color: "#ef4444", fontSize: "0.875rem" }}>✗ Failed</span>
                        )}
                      </td>
                      <td>
                        {item.blockchain_tx ? (
                          <span className="meta-id" style={{ fontSize: "0.75rem", color: "#60a5fa" }}>
                            {item.blockchain_tx.substring(0, 10)}...
                          </span>
                        ) : (
                          <span style={{ color: "#64748b" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Merkle Root Info */}
          {report.merkle_root && (
            <div className="panel" style={{ padding: 20, marginTop: 20 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>MERKLE ROOT</div>
              <div className="meta-id" style={{ fontSize: "0.875rem", color: "#94a3b8", wordBreak: "break-all" }}>
                {report.merkle_root}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
