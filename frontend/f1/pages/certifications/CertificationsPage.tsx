import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import StatCard from "../../components/ui/StatCard";
import { useState, useEffect } from "react";
import { formatDateTime } from "../../data/utils";
import { certificationService, CertificationResponse } from "../../services/certifications";
import { dashboardService } from "../../services/dashboard";

export default function CertificationsPage() {
  const [certs, setCerts] = useState<CertificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [confirmed, setConfirmed] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assetIdInput, setAssetIdInput] = useState("");
  const [batchIdInput, setBatchIdInput] = useState("");
  const [createStatus, setCreateStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        certificationService.listCertifications({ page_size: 100 }),
        dashboardService.getSummary()
      ]);
      setCerts(listRes.items);
      setTotal(listRes.total);
      setPending(summaryRes.pending_certifications);
      setConfirmed(summaryRes.confirmed_certifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetIdInput.trim()) return;

    setIsSubmitting(true);
    setCreateStatus(null);
    try {
      await certificationService.createCertification({
        asset_id: assetIdInput.trim(),
        batch_id: batchIdInput.trim() || undefined,
      });
      setCreateStatus({ type: "success", message: "Certification created successfully!" });
      setAssetIdInput("");
      setBatchIdInput("");
      fetchData();
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateStatus(null);
      }, 1500);
    } catch (err: any) {
      setCreateStatus({
        type: "error",
        message: err.data?.message || err.message || "Failed to create certification",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCerts = certs.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const s = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (c.cert_id && c.cert_id.toLowerCase().includes(s)) ||
      (c.asset_id && c.asset_id.toLowerCase().includes(s)) ||
      (c.batch_id && c.batch_id.toLowerCase().includes(s));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="page-fade">
      <PageHeader
        title="Certifications"
        subtitle="Non-transferable blockchain certification records for defence assets"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Certifications" }]}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              + Create Certification
            </button>
            <button className="btn-ghost" onClick={fetchData}>
              ↻ Refresh
            </button>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Issued" value={total.toString()} icon="◆" accent="#22c55e" />
        <StatCard label="Pending Confirmation" value={pending.toString()} icon="◐" accent="#f59e0b" />
        <StatCard label="Confirmed On-Chain" value={confirmed.toString()} icon="⬡" accent="#22c55e" />
        <StatCard label="Failed / Revoked" value="0" icon="✕" />
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "ALL", label: `All (${certs.length})` },
            { key: "CONFIRMED", label: `Confirmed (${certs.filter((c) => c.status === "CONFIRMED").length})` },
            { key: "PENDING", label: `Pending (${certs.filter((c) => c.status === "PENDING").length})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                padding: "6px 14px",
                background: statusFilter === f.key ? "rgba(37,99,235,0.2)" : "transparent",
                border: `1px solid ${statusFilter === f.key ? "#2563eb" : "#1e3a60"}`,
                borderRadius: "4px",
                color: statusFilter === f.key ? "#e2e8f0" : "#64748b",
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ minWidth: 260 }}>
          <input
            type="text"
            className="input"
            style={{ width: "100%", padding: "6px 12px", fontSize: "0.8125rem", background: "#08131f", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
            placeholder="Search cert ID, asset ID, or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>Loading certifications...</td>
                </tr>
              ) : certs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>No certifications found.</td>
                </tr>
              ) : filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>No certifications match your filter criteria.</td>
                </tr>
              ) : (
                filteredCerts.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #152b4a" }} className="table-row">
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/certifications/${c.id}`} style={{ textDecoration: "none" }}>
                        <span className="meta-id" style={{ color: "#60a5fa" }}>{c.cert_id}</span>
                      </Link>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/assets/${c.asset_id}`} style={{ textDecoration: "none" }}>
                        <span className="meta-id" style={{ color: "#94a3b8" }}>{c.asset_id}</span>
                      </Link>
                    </td>
                    <td style={{ padding: "12px 14px" }}><span className="meta-id">{c.batch_id}</span></td>
                    <td style={{ padding: "12px 14px" }}><span className="meta-id">{c.token_id || "—"}</span></td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{c.issued_by || "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>{formatDateTime(c.issued_at)}</td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={c.status} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/certifications/${c.id}`} className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid #152b4a", fontSize: "0.75rem", color: "#475569", display: "flex", justifyContent: "space-between" }}>
          <span>Showing {filteredCerts.length} of {certs.length} certification records</span>
          <span>BEL-TRUST-CHAIN ERC-5192 Records</span>
        </div>
      </div>

      <div style={{ marginTop: 24, padding: "14px 18px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "6px", fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.6 }}>
        <span style={{ color: "#8b5cf6", fontWeight: 700 }}>⊠ NON-TRANSFERABLE: </span>
        These certifications are locked state records. They cannot be bought, sold, or transferred.
        Each represents the verified certification state of a defence asset at a specific point in time.
      </div>

      {/* Create Certification Modal */}
      {showCreateModal && (
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
          <div className="panel" style={{ width: "100%", maxWidth: 460, padding: 24, border: "1px solid #1e3a60" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>Create Certification</div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateStatus(null);
                }}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {createStatus && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 4,
                    fontSize: "0.8125rem",
                    background: createStatus.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    border: `1px solid ${createStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    color: createStatus.type === "success" ? "#22c55e" : "#ef4444",
                  }}
                >
                  {createStatus.message}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Asset ID *
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                  value={assetIdInput}
                  onChange={(e) => setAssetIdInput(e.target.value)}
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Batch ID (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                  value={batchIdInput}
                  onChange={(e) => setBatchIdInput(e.target.value)}
                  placeholder="e.g. BATCH-2026-Q1"
                />
              </div>

              <div style={{ padding: "10px 12px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 4, fontSize: "0.75rem", color: "#94a3b8" }}>
                Creating a certification initiates cryptographic verification and Soulbound Token generation on BEL-TRUST-CHAIN.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateStatus(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !assetIdInput.trim()}
                >
                  {isSubmitting ? "Creating..." : "Create Certification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
