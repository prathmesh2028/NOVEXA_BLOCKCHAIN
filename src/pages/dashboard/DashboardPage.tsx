import { Link } from "react-router";
import { useRole } from "../../context/RoleContext";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import RoleBadge from "../../components/ui/RoleBadge";
import AuditTimeline from "../../components/ui/AuditTimeline";
import { useState, useEffect } from "react";
import { ASSETS, AUDIT_EVENTS, CERTIFICATIONS, formatDateTime } from "../../data/mockData";
import { dashboardService, DashboardSummary } from "../../services/dashboard";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  
  useEffect(() => {
    dashboardService.getSummary().then(setSummary).catch(console.error);
  }, []);

  if (!summary) return <div style={{ padding: 40, color: "#94a3b8" }}>Loading dashboard metrics...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* System health banner */}
      <div
        style={{
          padding: "14px 20px",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: "#22c55e", fontSize: "0.875rem" }}>●</span>
        <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
          <strong style={{ color: "#e2e8f0" }}>All systems operational.</strong> 847 assets registered · 5 users active · 2 certifications pending
        </span>
        <Link to="/app/system-activity" style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#64748b", textDecoration: "none" }}>
          View Activity →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        <StatCard label="Total Assets" value={summary.total_assets.toString()} icon="◈" />
        <StatCard label="Active Users" value={summary.active_users.toString()} icon="◉" sub={`${summary.pending_users} pending`} />
        <StatCard label="Certifications" value={summary.total_certifications.toString()} icon="◆" accent="#22c55e" sub={`${summary.pending_certifications} pending`} />
        <StatCard label="Verification Issues" value={summary.failed_verifications.toString()} icon="⚠" accent="#f59e0b" />
        <StatCard label="Blockchain TXs" value={summary.total_blockchain_txs.toString()} icon="⬡" />
        <StatCard label="Audit Events" value={summary.total_audit_events.toString()} icon="≡" />
      </div>

      {/* Attention items */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>REQUIRES ATTENTION</div>
          {[
            { msg: "Evidence fingerprint mismatch — EF-2026-00423", level: "danger", time: "2h ago" },
            { msg: "Certification CERT-2026-00088 pending confirmation", level: "warning", time: "3h ago" },
            { msg: "User USR-005 pending identity verification", level: "info", time: "1d ago" },
          ].map((item) => (
            <div
              key={item.msg}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 0",
                borderBottom: "1px solid #152b4a",
                alignItems: "flex-start",
              }}
            >
              <span style={{ color: item.level === "danger" ? "#ef4444" : item.level === "warning" ? "#f59e0b" : "#60a5fa", fontSize: "0.75rem", marginTop: 2 }}>
                {item.level === "danger" ? "✕" : item.level === "warning" ? "⚠" : "ⓘ"}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{item.msg}</div>
                <div style={{ fontSize: "0.6875rem", color: "#475569", marginTop: 2 }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>PLATFORM USERS</div>
          {[
            { name: "Arjun Mehta", role: "admin", status: "ACTIVE", last: "Now" },
            { name: "Priya Sharma", role: "nft-creator", status: "ACTIVE", last: "2h ago" },
            { name: "Rajesh Kumar", role: "technician", status: "ACTIVE", last: "4h ago" },
            { name: "Deepa Nair", role: "auditor", status: "ACTIVE", last: "1d ago" },
          ].map((u) => (
            <div
              key={u.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: "1px solid #152b4a",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#1e3a60",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  color: "#60a5fa",
                }}
              >
                {u.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.8125rem", color: "#e2e8f0" }}>{u.name}</div>
                <RoleBadge role={u.role} size="sm" />
              </div>
              <div style={{ fontSize: "0.6875rem", color: "#475569" }}>{u.last}</div>
            </div>
          ))}
          <Link to="/app/users" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: "0.75rem", color: "#2563eb", textDecoration: "none" }}>
            Manage Users →
          </Link>
        </div>
      </div>

      {/* Recent audit */}
      <div className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="section-label">RECENT AUDIT EVENTS</div>
          <Link to="/app/audit" style={{ fontSize: "0.75rem", color: "#2563eb", textDecoration: "none" }}>View all →</Link>
        </div>
        <AuditTimeline events={AUDIT_EVENTS.slice(0, 4)} />
      </div>
    </div>
  );
}

function NFTCreatorDashboard() {
  const readyCert = CERTIFICATIONS.filter((c) => c.status === "PENDING");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/app/certification-queue" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
          Create Certification →
        </Link>
        <div style={{ fontSize: "0.8125rem", color: "#64748b" }}>
          {readyCert.length} certification{readyCert.length !== 1 ? "s" : ""} awaiting confirmation
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        <StatCard label="Ready for Certification" value="3" icon="◈" accent="#f59e0b" />
        <StatCard label="Certifications Issued" value="312" icon="◆" accent="#22c55e" />
        <StatCard label="Pending Confirmation" value={readyCert.length.toString()} icon="◐" accent="#f59e0b" />
        <StatCard label="Blockchain TXs" value="47" icon="⬡" sub="This month" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>ELIGIBLE ASSETS</div>
          {ASSETS.filter((a) => a.certStatus === "NOT_CERTIFIED" && a.lifecycle !== "REJECTED_QUARANTINED" && a.evidenceStatus === "Complete").slice(0, 3).map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #152b4a" }}>
              <div>
                <div className="meta-id">{a.id}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{a.type}</div>
              </div>
              <StatusBadge status={a.lifecycle} size="sm" />
            </div>
          ))}
          {ASSETS.filter((a) => a.certStatus === "NOT_CERTIFIED" && a.lifecycle !== "REJECTED_QUARANTINED" && a.evidenceStatus === "Complete").length === 0 && (
            <div style={{ fontSize: "0.8125rem", color: "#475569", padding: "12px 0" }}>No assets currently eligible</div>
          )}
          <Link to="/app/eligible-assets" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: "0.75rem", color: "#2563eb", textDecoration: "none" }}>
            View Eligible Assets →
          </Link>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>RECENT CERTIFICATIONS</div>
          {CERTIFICATIONS.slice(0, 3).map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #152b4a" }}>
              <div>
                <div className="meta-id">{c.id}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{c.assetId}</div>
              </div>
              <StatusBadge status={c.status} size="sm" />
            </div>
          ))}
          <Link to="/app/certifications" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: "0.75rem", color: "#2563eb", textDecoration: "none" }}>
            View All →
          </Link>
        </div>
      </div>
    </div>
  );
}

function TechnicianDashboard() {
  const myAssets = ASSETS.slice(0, 4);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/app/register" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
          Register / Update Asset →
        </Link>
        <Link to="/app/evidence" className="btn-secondary">
          Upload Evidence
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        <StatCard label="My Assets" value="5" icon="◈" />
        <StatCard label="Pending Inspection" value="1" icon="◌" accent="#f59e0b" />
        <StatCard label="Missing Evidence" value="2" icon="⚠" accent="#ef4444" />
        <StatCard label="Submitted for Cert." value="1" icon="◆" accent="#22c55e" />
      </div>

      <div className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="section-label">MY ASSETS</div>
          <Link to="/app/my-assets" style={{ fontSize: "0.75rem", color: "#2563eb", textDecoration: "none" }}>View all →</Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a60" }}>
                {["Asset ID", "Type", "Lifecycle", "Evidence", "Action"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 12px", fontSize: "0.6875rem", color: "#475569", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myAssets.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #152b4a" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <span className="meta-id">{a.id}</span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "0.8125rem", color: "#94a3b8" }}>{a.type}</td>
                  <td style={{ padding: "10px 12px" }}><StatusBadge status={a.lifecycle} size="sm" /></td>
                  <td style={{ padding: "10px 12px" }}><StatusBadge status={a.evidenceStatus} size="sm" /></td>
                  <td style={{ padding: "10px 12px" }}>
                    <Link to={`/app/assets/${a.id}`} style={{ fontSize: "0.75rem", color: "#2563eb", textDecoration: "none" }}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AuditorDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/app/search" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
          Search Assets to Verify →
        </Link>
        <Link to="/app/verification" className="btn-secondary">
          Verification Center
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        <StatCard label="Pending Verification" value="2" icon="◎" accent="#f59e0b" />
        <StatCard label="Failed Records" value="1" icon="✕" accent="#ef4444" sub="Evidence mismatch" />
        <StatCard label="Verified Today" value="3" icon="✓" accent="#22c55e" />
        <StatCard label="Audit Events" value="441" icon="≡" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>ASSETS REQUIRING VERIFICATION</div>
          {ASSETS.filter((a) => a.verification !== "VERIFIED").map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #152b4a" }}>
              <div>
                <div className="meta-id">{a.id}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{a.type}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <StatusBadge status={a.verification} size="sm" />
                <Link to={`/app/assets/${a.id}`} style={{ fontSize: "0.75rem", color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center" }}>
                  →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>RECENT AUDIT EVENTS</div>
          {AUDIT_EVENTS.slice(0, 4).map((e) => (
            <div key={e.id} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #152b4a", alignItems: "flex-start" }}>
              <span style={{ color: e.result === "SUCCESS" ? "#22c55e" : e.result === "FAILED" ? "#ef4444" : "#f59e0b", fontSize: "0.75rem", marginTop: 2 }}>
                {e.result === "SUCCESS" ? "✓" : e.result === "FAILED" ? "✕" : "⚠"}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{e.action}</div>
                <div style={{ fontSize: "0.6875rem", color: "#475569" }}>{e.actor} · {formatDateTime(e.timestamp)}</div>
              </div>
            </div>
          ))}
          <Link to="/app/audit-trail" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: "0.75rem", color: "#2563eb", textDecoration: "none" }}>
            View Audit Trail →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, role } = useAuth();
  if (!user || !role) return null;

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  return (
    <div className="page-fade">
      <div style={{ marginBottom: 28 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>
          DASHBOARD · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
        </div>
        <h1
          className="font-display"
          style={{ fontSize: "1.75rem", fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px", letterSpacing: "0.02em" }}
        >
          {greeting}, {user.name.split(" ")[0]}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
          Signed in as <RoleBadge role={role} size="sm" /> · Identity{" "}
          <span style={{ color: "#22c55e", fontWeight: 600 }}>✓ Verified</span> ·{" "}
          <span className="meta-id">{user.actor?.did || "—"}</span>
        </p>
      </div>

      {role === "admin" && <AdminDashboard />}
      {role === "nft-creator" && <NFTCreatorDashboard />}
      {role === "technician" && <TechnicianDashboard />}
      {role === "auditor" && <AuditorDashboard />}
    </div>
  );
}
