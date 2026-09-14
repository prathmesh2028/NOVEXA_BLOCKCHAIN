import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import StatCard from "../../components/ui/StatCard";
import { CERTIFICATIONS, formatDateTime } from "../../data/mockData";

export default function CertificationsPage() {
  return (
    <div className="page-fade">
      <PageHeader
        title="Certifications"
        subtitle="Non-transferable blockchain certification records for defence assets"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Certifications" }]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Issued" value="312" icon="◆" accent="#22c55e" />
        <StatCard label="Pending Confirmation" value="1" icon="◐" accent="#f59e0b" />
        <StatCard label="Confirmed On-Chain" value="311" icon="⬡" accent="#22c55e" />
        <StatCard label="Failed / Revoked" value="0" icon="✕" />
      </div>

      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a60", background: "#08131f" }}>
                {["Certification ID", "Asset ID", "Batch", "Token ID", "Issued By", "Issued At", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.6875rem", color: "#475569", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CERTIFICATIONS.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #152b4a" }} className="table-row">
                  <td style={{ padding: "12px 14px" }}>
                    <Link to={`/app/certifications/${c.id}`} style={{ textDecoration: "none" }}>
                      <span className="meta-id" style={{ color: "#60a5fa" }}>{c.id}</span>
                    </Link>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Link to={`/app/assets/${c.assetId}`} style={{ textDecoration: "none" }}>
                      <span className="meta-id" style={{ color: "#94a3b8" }}>{c.assetId}</span>
                    </Link>
                  </td>
                  <td style={{ padding: "12px 14px" }}><span className="meta-id">{c.batchId}</span></td>
                  <td style={{ padding: "12px 14px" }}><span className="meta-id">{c.tokenId}</span></td>
                  <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{c.issuedBy}</td>
                  <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>{formatDateTime(c.issuedAt)}</td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={c.status} size="sm" /></td>
                  <td style={{ padding: "12px 14px" }}>
                    <Link to={`/app/certifications/${c.id}`} className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid #152b4a", fontSize: "0.75rem", color: "#475569" }}>
          {CERTIFICATIONS.length} certification records · Non-transferable · Synthetic demonstration data
        </div>
      </div>

      <div style={{ marginTop: 24, padding: "14px 18px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "6px", fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.6 }}>
        <span style={{ color: "#8b5cf6", fontWeight: 700 }}>⊠ NON-TRANSFERABLE: </span>
        These certifications are locked state records. They cannot be bought, sold, or transferred.
        Each represents the verified certification state of a defence asset at a specific point in time.
      </div>
    </div>
  );
}
