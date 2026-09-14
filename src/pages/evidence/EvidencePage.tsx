import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { EVIDENCE_LIST, formatDateTime } from "../../data/mockData";

export default function EvidencePage() {
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
              {EVIDENCE_LIST.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #152b4a" }} className="table-row">
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#e2e8f0" }}>{e.filename}</div>
                    <div style={{ fontSize: "0.6875rem", color: "#475569", marginTop: 1 }}>{e.sizeKb} KB · {e.mimeType}</div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{e.type}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <Link to={`/app/assets/${e.assetId}`} style={{ textDecoration: "none" }}>
                      <span className="meta-id" style={{ color: "#60a5fa" }}>{e.assetId}</span>
                    </Link>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="meta-id" style={{ fontSize: "0.6875rem" }}>{e.hash}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{e.uploadedBy}</td>
                  <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
                    {formatDateTime(e.uploadedAt)}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {e.status === "Complete" && (
                      <span style={{ fontSize: "0.75rem", color: e.integrityVerified ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                        {e.integrityVerified ? "✓ Verified" : "✕ Mismatch"}
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
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid #152b4a", fontSize: "0.75rem", color: "#475569" }}>
          {EVIDENCE_LIST.length} evidence records · Fingerprint = SHA-256 hash of the original file
        </div>
      </div>
    </div>
  );
}
