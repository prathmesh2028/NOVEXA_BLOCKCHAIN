import { useState } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { ASSETS, formatDateTime } from "../../data/mockData";
import { useRole } from "../../context/RoleContext";

export default function AssetsPage() {
  const { user } = useRole();
  const [search, setSearch] = useState("");
  const [filterLifecycle, setFilterLifecycle] = useState("ALL");

  const filtered = ASSETS.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.id.toLowerCase().includes(q) || a.batchId.toLowerCase().includes(q) || a.type.toLowerCase().includes(q);
    const matchLifecycle = filterLifecycle === "ALL" || a.lifecycle === filterLifecycle;
    return matchSearch && matchLifecycle;
  });

  return (
    <div className="page-fade">
      <PageHeader
        title="Assets"
        subtitle="All registered defence asset records"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Assets" }]}
        actions={
          user?.role === "technician" && (
            <Link to="/app/register" className="btn-primary">
              + Register Asset
            </Link>
          )
        }
      />

      {/* Lifecycle summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { key: "ALL", label: "All Assets", count: ASSETS.length, color: "#60a5fa" },
          { key: "ACCEPTED_FOR_ASSEMBLY", label: "Accepted", count: ASSETS.filter((a) => a.lifecycle === "ACCEPTED_FOR_ASSEMBLY").length, color: "#22c55e" },
          { key: "INSPECTION_RECORDED", label: "In Inspection", count: ASSETS.filter((a) => a.lifecycle === "INSPECTION_RECORDED").length, color: "#f59e0b" },
          { key: "RECEIVED", label: "Received", count: ASSETS.filter((a) => a.lifecycle === "RECEIVED").length, color: "#60a5fa" },
          { key: "REJECTED_QUARANTINED", label: "Rejected", count: ASSETS.filter((a) => a.lifecycle === "REJECTED_QUARANTINED").length, color: "#ef4444" },
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
            <div className="font-display" style={{ fontSize: "1.375rem", fontWeight: 700, color: filterLifecycle === s.key ? s.color : "#94a3b8" }}>
              {s.count}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: 2 }}>{s.label}</div>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#475569", fontSize: "0.875rem" }}>
                    <div style={{ marginBottom: 8, fontSize: "1.5rem", opacity: 0.4 }}>◈</div>
                    No assets match your search
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #152b4a" }} className="table-row">
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/assets/${a.id}`} style={{ textDecoration: "none" }}>
                        <span className="meta-id" style={{ color: "#60a5fa" }}>{a.id}</span>
                      </Link>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="meta-id">{a.batchId}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{a.type}</td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={a.lifecycle} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={a.evidenceStatus} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={a.certStatus} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={a.verification} size="sm" /></td>
                    <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
                      {formatDateTime(a.updatedAt)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link to={`/app/assets/${a.id}`} className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
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
          Showing {filtered.length} of {ASSETS.length} assets · Synthetic demonstration data
        </div>
      </div>
    </div>
  );
}
