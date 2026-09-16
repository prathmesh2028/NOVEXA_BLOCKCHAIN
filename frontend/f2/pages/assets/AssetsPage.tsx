import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { assetService, AssetResponse } from "../../services/assets";

export default function AssetsPage() {
  const { user, role } = useAuth();
  const [search, setSearch] = useState("");
  const [filterLifecycle, setFilterLifecycle] = useState("ALL");
  
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const res = await assetService.listAssets({
          search: search || undefined,
          lifecycle: filterLifecycle !== "ALL" ? filterLifecycle : undefined,
          page_size: 100, // Load enough for demo
        });
        setAssets(res.items);
        setTotal(res.total);
      } catch (err) {
        console.error("Failed to load assets", err);
      } finally {
        setLoading(false);
      }
    };
    
    const debounce = setTimeout(fetchAssets, 300);
    return () => clearTimeout(debounce);
  }, [search, filterLifecycle]);

  return (
    <div className="page-fade">
      <PageHeader
        title="Assets"
        subtitle="All registered defence asset records"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Assets" }]}
        actions={
          role === "technician" && (
            <Link to="/app/register" className="btn-primary">
              + Register Asset
            </Link>
          )
        }
      />

      {/* Lifecycle summary cards (simplified since backend pagination hides exact counts, for now just show static categories) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { key: "ALL", label: "All Assets", color: "#60a5fa" },
          { key: "ACCEPTED_FOR_ASSEMBLY", label: "Accepted", color: "#22c55e" },
          { key: "INSPECTION_RECORDED", label: "In Inspection", color: "#f59e0b" },
          { key: "RECEIVED", label: "Received", color: "#60a5fa" },
          { key: "REJECTED_QUARANTINED", label: "Rejected", color: "#ef4444" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilterLifecycle(s.key)}
            style={{
              padding: "10px 12px",
              background: filterLifecycle === s.key ? s.color + "18" : "#0c1828",
              border: `1px solid ${filterLifecycle === s.key ? s.color : "#1e3a60"}`,
              borderRadius: "5px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: "0.8125rem", color: "#e2e8f0", fontWeight: 600 }}>{s.label}</div>
            {filterLifecycle === s.key && <div style={{ height: 3, width: 20, background: s.color, marginTop: 4, borderRadius: 2 }} />}
          </button>
        ))}
      </div>

      {/* Search & filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: "0.75rem", pointerEvents: "none" }}>◎</span>
          <input
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Asset ID, Batch ID, or Type…"
            style={{ paddingLeft: 28 }}
          />
        </div>
        <select
          className="input-field"
          value={filterLifecycle}
          onChange={(e) => setFilterLifecycle(e.target.value)}
          style={{ width: "auto", minWidth: 180 }}
        >
          <option value="ALL">All Lifecycle States</option>
          <option value="UNREGISTERED">Unregistered</option>
          <option value="SUPPLIER_DECLARED">Supplier Declared</option>
          <option value="RECEIVED">Received</option>
          <option value="INSPECTION_RECORDED">Inspection Recorded</option>
          <option value="ACCEPTED_FOR_ASSEMBLY">Accepted for Assembly</option>
          <option value="REJECTED_QUARANTINED">Rejected / Quarantined</option>
        </select>
      </div>

      {/* Table */}
      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a60", background: "#08131f" }}>
                {["Asset ID", "Batch", "Type", "Lifecycle", "Evidence", "Certification", "Verification", "Updated", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.6875rem", color: "#475569", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>Loading assets...</td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#475569", fontSize: "0.875rem" }}>
                    <div style={{ marginBottom: 8, fontSize: "1.5rem", opacity: 0.4 }}>◈</div>
                    No assets match your search
                  </td>
                </tr>
              ) : (
                assets.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #152b4a" }} className="table-row">
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/assets/${a.asset_id}`} style={{ textDecoration: "none" }}>
                        <span className="meta-id" style={{ color: "#60a5fa" }}>{a.asset_id}</span>
                      </Link>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="meta-id">{a.batch_id}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{a.type}</td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={a.lifecycle_state} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={a.evidence_status} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={a.cert_status} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={a.verification_status} size="sm" /></td>
                    <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
                      {formatDateTime(a.updated_at)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/assets/${a.asset_id}`} className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
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
          Showing {assets.length} of {total} assets (Powered by Backend API)
        </div>
      </div>
    </div>
  );
}
