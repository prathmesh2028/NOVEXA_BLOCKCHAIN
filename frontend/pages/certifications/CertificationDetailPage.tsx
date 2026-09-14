import { useParams, Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { CERTIFICATIONS, EVIDENCE_LIST, ASSETS, formatDateTime, shortHash } from "../../data/mockData";

export default function CertificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const cert = CERTIFICATIONS.find((c) => c.id === id);

  if (!cert) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: "2rem", marginBottom: 16, opacity: 0.3 }}>◆</div>
        <h2 className="font-display" style={{ color: "#e2e8f0" }}>CERTIFICATION NOT FOUND</h2>
        <Link to="/app/certifications" className="btn-secondary" style={{ marginTop: 16 }}>← Back to Certifications</Link>
      </div>
    );
  }

  const asset = ASSETS.find((a) => a.id === cert.assetId);
  const evidence = EVIDENCE_LIST.filter((e) => e.assetId === cert.assetId);

  return (
    <div className="page-fade">
      <PageHeader
        title={cert.id}
        subtitle={`Digital certification for asset ${cert.assetId}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Certifications", to: "/app/certifications" },
          { label: cert.id },
        ]}
        badge={<StatusBadge status={cert.status} />}
        actions={<Link to="/app/certifications" className="btn-ghost">← Back</Link>}
      />

      {/* Non-transferable notice — prominent */}
      <div
        style={{
          padding: "14px 20px",
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "6px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: "#8b5cf6", fontSize: "1.1rem" }}>⊠</span>
        <div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.04em" }}>NON-TRANSFERABLE CERTIFICATION</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
            This digital certification represents the recorded certification state of this asset/batch.
            It is not a physical ownership record. Transfer is permanently locked.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Certification overview */}
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>CERTIFICATION OVERVIEW</div>
          {[
            { label: "Certification ID", value: cert.id, mono: true },
            { label: "Token ID", value: cert.tokenId, mono: true },
            { label: "Asset ID", value: cert.assetId, mono: true, link: `/app/assets/${cert.assetId}` },
            { label: "Batch ID", value: cert.batchId, mono: true },
            { label: "Status", value: cert.status, badge: true },
            { label: "Issued by", value: cert.issuedBy },
            { label: "Issuer DID", value: cert.issuedByDid, mono: true },
            { label: "Issued at", value: formatDateTime(cert.issuedAt) },
            { label: "Confirmed at", value: cert.confirmedAt ? formatDateTime(cert.confirmedAt) : "Awaiting confirmation" },
            { label: "Confirmations", value: cert.confirmations.toString() },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #152b4a", alignItems: "center" }}>
              <span style={{ fontSize: "0.6875rem", color: "#475569", width: 110, flexShrink: 0 }}>{row.label}</span>
              {row.badge ? (
                <StatusBadge status={row.value} size="sm" />
              ) : row.link ? (
                <Link to={row.link} style={{ textDecoration: "none" }}>
                  <span className="meta-id" style={{ color: "#60a5fa" }}>{row.value}</span>
                </Link>
              ) : row.mono ? (
                <span className="meta-id" style={{ color: "#94a3b8" }}>{row.value}</span>
              ) : (
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{row.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Blockchain proof */}
        <div>
          <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>BLOCKCHAIN PROOF</div>
            {[
              { label: "Network", value: cert.network },
              { label: "Contract", value: shortHash(cert.contractAddress, 10), mono: true },
              { label: "Transaction", value: shortHash(cert.txHash, 10), mono: true },
              { label: "Block Number", value: cert.blockNumber > 0 ? cert.blockNumber.toLocaleString() : "Pending" },
              { label: "Confirmations", value: cert.confirmations.toString() },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #152b4a", alignItems: "center" }}>
                <span style={{ fontSize: "0.6875rem", color: "#475569", width: 110, flexShrink: 0 }}>{row.label}</span>
                {row.mono ? (
                  <span className="meta-id" style={{ color: "#94a3b8" }}>{row.value}</span>
                ) : (
                  <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{row.value}</span>
                )}
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>FULL TRANSACTION HASH</div>
              <div style={{ background: "#070f1d", padding: "10px 12px", borderRadius: "4px", border: "1px solid #152b4a", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span className="meta-id" style={{ color: "#64748b", wordBreak: "break-all", fontSize: "0.7rem" }}>{cert.txHash}</span>
              </div>
            </div>
          </div>

          {/* Evidence summary */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>EVIDENCE LINKED TO CERTIFICATION</div>
            {evidence.length === 0 ? (
              <div style={{ fontSize: "0.8125rem", color: "#475569" }}>No evidence records</div>
            ) : evidence.map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #152b4a" }}>
                <div>
                  <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{e.filename}</div>
                  <div className="meta-id" style={{ color: "#475569" }}>{e.hash}</div>
                </div>
                <StatusBadge status={e.integrityVerified ? "VERIFIED" : "FAILED"} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
        {asset && <Link to={`/app/assets/${asset.id}`} className="btn-secondary">View Asset →</Link>}
        <Link to="/app/blockchain" className="btn-secondary">View Blockchain Transactions →</Link>
      </div>
    </div>
  );
}
