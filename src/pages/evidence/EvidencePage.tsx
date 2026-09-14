import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime } from "../../data/mockData";
import { evidenceService, EvidenceResponse } from "../../services/evidence";

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<EvidenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
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
    fetchEvidence();
  }, []);

  return (
    <div className="page-fade">
      <PageHeader
        title="Evidence"
        subtitle="Evidence records with integrity verification and blockchain anchoring"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Evidence" }]}
        actions={
          <button className="btn-primary">+ Upload Evidence</button>
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
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>No evidence records found.</td>
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
    </div>
  );
}
