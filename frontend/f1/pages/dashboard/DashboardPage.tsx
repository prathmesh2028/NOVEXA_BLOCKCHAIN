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

  if (!summary) {
    return (
      <div className="defence-panel" style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
        <div className="pulse-beacon pulse-beacon-amber" style={{ marginBottom: 12 }} />
        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>Initializing Mission Telemetry…</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* System Operational Console Banner */}
      <div
        className="defence-panel stagger-in-1"
        style={{
          padding: "14px 20px",
          background: "linear-gradient(90deg, rgba(34,197,94,0.09) 0%, rgba(12,24,40,0.85) 100%)",
          borderColor: "rgba(34,197,94,0.25)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="pulse-beacon" style={{ background: "#22c55e" }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "#22c55e" }}>
            MISSION STATUS: OPERATIONAL
          </span>
        </div>
        <div style={{ width: 1, height: 16, background: "#1e3a60" }} />
        <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
          <strong style={{ color: "#e2e8f0" }}>{summary.total_assets} Assets</strong> registered ·{" "}
          <strong style={{ color: "#e2e8f0" }}>{summary.active_users} Active Users</strong> ·{" "}
          <strong style={{ color: "#f59e0b" }}>{summary.pending_certifications} Pending Certifications</strong>
        </span>
        <Link
          to="/app/system-activity"
          className="btn-secondary"
          style={{ marginLeft: "auto", fontSize: "0.75rem", padding: "4px 12px", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          View Live Feed →
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div
        className="stagger-in-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}
      >
        <StatCard label="Total Assets" value={summary.total_assets.toString()} icon="◈" />
        <StatCard label="Active Users" value={summary.active_users.toString()} icon="◉" sub={`${summary.pending_users} pending`} />
        <StatCard label="Certifications" value={summary.total_certifications.toString()} icon="◆" accent="#22c55e" sub={`${summary.pending_certifications} pending`} />
        <StatCard label="Verification Issues" value={summary.failed_verifications.toString()} icon="⚠" accent="#f59e0b" />
        <StatCard label="Blockchain TXs" value={summary.total_blockchain_txs.toString()} icon="⬡" accent="#3b82f6" />
        <StatCard label="Audit Events" value={summary.total_audit_events.toString()} icon="≡" />
      </div>

      {/* Trust & Verification Matrix */}
      <div
        className="defence-panel stagger-in-3"
        style={{
          padding: "16px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          background: "linear-gradient(135deg, rgba(19, 32, 64, 0.4) 0%, rgba(12, 24, 40, 0.9) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: "1.25rem", color: "#3b82f6" }}>⬡</div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em" }}>BLOCKCHAIN ANCHOR</div>
            <div style={{ fontSize: "0.8125rem", color: "#e2e8f0", fontWeight: 600 }}>Sepolia Testnet (ID: 11155111)</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: "1.25rem", color: "#22c55e" }}>✓</div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em" }}>EVIDENCE INTEGRITY</div>
            <div style={{ fontSize: "0.8125rem", color: "#22c55e", fontWeight: 600 }}>SHA-256 Match Validated</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: "1.25rem", color: "#8b5cf6" }}>◆</div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em" }}>CERTIFICATION ENGINE</div>
            <div style={{ fontSize: "0.8125rem", color: "#e2e8f0", fontWeight: 600 }}>Non-Transferable NFT Standard</div>
          </div>
        </div>
      </div>

      {/* Attention items & Platform Users */}
      <div className="stagger-in-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {/* Attention Items */}
        <div className="defence-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="section-label" style={{ margin: 0 }}>REQUIRES ATTENTION</div>
            <span style={{ fontSize: "0.6875rem", color: "#ef4444", fontWeight: 600, background: "rgba(239,68,68,0.12)", padding: "2px 8px", borderRadius: "4px" }}>
              3 ALERTS
            </span>
          </div>
          {[
            { msg: "Evidence fingerprint mismatch — EF-2026-00423", level: "danger", tag: "INTEGRITY", time: "2h ago" },
            { msg: "Certification CERT-2026-00088 pending confirmation", level: "warning", tag: "BLOCKCHAIN", time: "3h ago" },
            { msg: "User USR-005 pending identity verification", level: "info", tag: "RBAC", time: "1d ago" },
          ].map((item) => (
            <div
              key={item.msg}
              className="interactive-row"
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 8px",
                borderBottom: "1px solid #152b4a",
                alignItems: "flex-start",
                borderRadius: "4px",
              }}
            >
              <span
                style={{
                  color: item.level === "danger" ? "#ef4444" : item.level === "warning" ? "#f59e0b" : "#60a5fa",
                  fontSize: "0.75rem",
                  marginTop: 2,
                  fontWeight: 700,
                }}
              >
                {item.level === "danger" ? "✕" : item.level === "warning" ? "⚠" : "ⓘ"}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.8125rem", color: "#e2e8f0" }}>{item.msg}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      color: item.level === "danger" ? "#ef4444" : item.level === "warning" ? "#f59e0b" : "#60a5fa",
                      background: item.level === "danger" ? "rgba(239,68,68,0.1)" : item.level === "warning" ? "rgba(245,158,11,0.1)" : "rgba(96,165,250,0.1)",
                      padding: "1px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    {item.tag}
                  </span>
                  <span style={{ fontSize: "0.6875rem", color: "#475569" }}>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Users */}
        <div className="defence-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="section-label" style={{ margin: 0 }}>PLATFORM USERS</div>
            <Link to="/app/users" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>
              Manage Users →
            </Link>
          </div>
          {[
            { name: "Arjun Mehta", role: "admin", status: "ACTIVE", last: "Now" },
            { name: "Priya Sharma", role: "nft-creator", status: "ACTIVE", last: "2h ago" },
            { name: "Rajesh Kumar", role: "technician", status: "ACTIVE", last: "4h ago" },
            { name: "Deepa Nair", role: "auditor", status: "ACTIVE", last: "1d ago" },
          ].map((u) => (
            <div
              key={u.name}
              className="interactive-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 8px",
                borderBottom: "1px solid #152b4a",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#1e3a60",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "#60a5fa",
                  flexShrink: 0,
                }}
              >
                {u.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.8125rem", color: "#e2e8f0", fontWeight: 500 }}>{u.name}</div>
                <div style={{ marginTop: 2 }}>
                  <RoleBadge role={u.role as any} size="sm" />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="pulse-beacon" style={{ background: "#22c55e", width: 5, height: 5 }} />
                <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>{u.last}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Timeline */}
      <div className="defence-panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="section-label" style={{ margin: 0 }}>RECENT AUDIT LOGS & PROOFS</div>
          <Link to="/app/audit" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
            View Full Trail →
          </Link>
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
      {/* Action Banner */}
      <div
        className="defence-panel stagger-in-1"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          background: "linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(12,24,40,0.85) 100%)",
          borderColor: "rgba(139,92,246,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/app/certification-queue" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
            Create Certification →
          </Link>
          <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
            <strong style={{ color: "#a78bfa" }}>{readyCert.length}</strong> certification{readyCert.length !== 1 ? "s" : ""} awaiting on-chain minting
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#64748b" }}>
          <span className="pulse-beacon" style={{ background: "#8b5cf6" }} />
          <span>MINTER NODE READY</span>
        </div>
      </div>

      <div
        className="stagger-in-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}
      >
        <StatCard label="Ready for Certification" value="3" icon="◈" accent="#f59e0b" />
        <StatCard label="Certifications Issued" value="312" icon="◆" accent="#22c55e" />
        <StatCard label="Pending Confirmation" value={readyCert.length.toString()} icon="◐" accent="#8b5cf6" />
        <StatCard label="Blockchain TXs" value="47" icon="⬡" sub="This month" accent="#3b82f6" />
      </div>

      <div className="stagger-in-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div className="defence-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="section-label" style={{ margin: 0 }}>ELIGIBLE ASSETS</div>
            <Link to="/app/eligible-assets" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none" }}>
              View Eligible Assets →
            </Link>
          </div>
          {ASSETS.filter((a) => a.certStatus === "NOT_CERTIFIED" && a.lifecycle !== "REJECTED_QUARANTINED" && a.evidenceStatus === "Complete").slice(0, 3).map((a) => (
            <div
              key={a.id}
              className="interactive-row"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid #152b4a", borderRadius: "4px" }}
            >
              <div>
                <div className="meta-id" style={{ color: "#e2e8f0" }}>{a.id}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>{a.type}</div>
              </div>
              <StatusBadge status={a.lifecycle} size="sm" />
            </div>
          ))}
          {ASSETS.filter((a) => a.certStatus === "NOT_CERTIFIED" && a.lifecycle !== "REJECTED_QUARANTINED" && a.evidenceStatus === "Complete").length === 0 && (
            <div style={{ fontSize: "0.8125rem", color: "#475569", padding: "12px 0" }}>No assets currently eligible</div>
          )}
        </div>

        <div className="defence-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="section-label" style={{ margin: 0 }}>RECENT CERTIFICATIONS</div>
            <Link to="/app/certifications" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none" }}>
              View All →
            </Link>
          </div>
          {CERTIFICATIONS.slice(0, 3).map((c) => (
            <div
              key={c.id}
              className="interactive-row"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid #152b4a", borderRadius: "4px" }}
            >
              <div>
                <div className="meta-id" style={{ color: "#e2e8f0" }}>{c.id}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>Asset: {c.assetId}</div>
              </div>
              <StatusBadge status={c.status} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TechnicianDashboard() {
  const myAssets = ASSETS.slice(0, 4);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Action Bar */}
      <div
        className="defence-panel stagger-in-1"
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          background: "linear-gradient(90deg, rgba(245,158,11,0.08) 0%, rgba(12,24,40,0.85) 100%)",
          borderColor: "rgba(245,158,11,0.25)",
        }}
      >
        <Link to="/app/register" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
          Register / Update Asset →
        </Link>
        <Link to="/app/evidence" className="btn-secondary">
          Upload Evidence
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#64748b" }}>
          <span className="pulse-beacon pulse-beacon-amber" style={{ background: "#f59e0b" }} />
          <span>STATION: TECHNICAL RECORDS DECK</span>
        </div>
      </div>

      <div
        className="stagger-in-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}
      >
        <StatCard label="My Assets" value="5" icon="◈" />
        <StatCard label="Pending Inspection" value="1" icon="◌" accent="#f59e0b" />
        <StatCard label="Missing Evidence" value="2" icon="⚠" accent="#ef4444" />
        <StatCard label="Submitted for Cert." value="1" icon="◆" accent="#22c55e" />
      </div>

      <div className="defence-panel stagger-in-3" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="section-label" style={{ margin: 0 }}>MY ASSIGNED ASSETS</div>
          <Link to="/app/my-assets" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
            View All Assets →
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a60" }}>
                {["Asset ID", "Type", "Lifecycle", "Evidence", "Action"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: "0.6875rem",
                      color: "#64748b",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myAssets.map((a) => (
                <tr key={a.id} className="interactive-row" style={{ borderBottom: "1px solid #152b4a" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <span className="meta-id" style={{ color: "#e2e8f0" }}>{a.id}</span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "0.8125rem", color: "#94a3b8" }}>{a.type}</td>
                  <td style={{ padding: "10px 12px" }}><StatusBadge status={a.lifecycle} size="sm" /></td>
                  <td style={{ padding: "10px 12px" }}><StatusBadge status={a.evidenceStatus} size="sm" /></td>
                  <td style={{ padding: "10px 12px" }}>
                    <Link to={`/app/assets/${a.id}`} style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
                      View Details →
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
      {/* Auditor Banner */}
      <div
        className="defence-panel stagger-in-1"
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          background: "linear-gradient(90deg, rgba(34,197,94,0.08) 0%, rgba(12,24,40,0.85) 100%)",
          borderColor: "rgba(34,197,94,0.25)",
        }}
      >
        <Link to="/app/search" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
          Search Assets to Verify →
        </Link>
        <Link to="/app/verification" className="btn-secondary">
          Verification Center
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#64748b" }}>
          <span className="pulse-beacon" style={{ background: "#22c55e" }} />
          <span>INSPECTION ENGINE ACTIVE</span>
        </div>
      </div>

      <div
        className="stagger-in-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}
      >
        <StatCard label="Pending Verification" value="2" icon="◎" accent="#f59e0b" />
        <StatCard label="Failed Records" value="1" icon="✕" accent="#ef4444" sub="Evidence mismatch" />
        <StatCard label="Verified Today" value="3" icon="✓" accent="#22c55e" />
        <StatCard label="Audit Events" value="441" icon="≡" />
      </div>

      <div className="stagger-in-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div className="defence-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="section-label" style={{ margin: 0 }}>ASSETS REQUIRING VERIFICATION</div>
            <span style={{ fontSize: "0.6875rem", color: "#f59e0b", background: "rgba(245,158,11,0.12)", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
              ACTION REQUIRED
            </span>
          </div>
          {ASSETS.filter((a) => a.verification !== "VERIFIED").map((a) => (
            <div
              key={a.id}
              className="interactive-row"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid #152b4a", borderRadius: "4px" }}
            >
              <div>
                <div className="meta-id" style={{ color: "#e2e8f0" }}>{a.id}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>{a.type}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <StatusBadge status={a.verification} size="sm" />
                <Link to={`/app/assets/${a.id}`} style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
                  Inspect →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="defence-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="section-label" style={{ margin: 0 }}>RECENT AUDIT EVENTS</div>
            <Link to="/app/audit-trail" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none" }}>
              View Trail →
            </Link>
          </div>
          {AUDIT_EVENTS.slice(0, 4).map((e) => (
            <div
              key={e.id}
              className="interactive-row"
              style={{ display: "flex", gap: 10, padding: "8px 8px", borderBottom: "1px solid #152b4a", alignItems: "flex-start", borderRadius: "4px" }}
            >
              <span
                style={{
                  color: e.result === "SUCCESS" ? "#22c55e" : e.result === "FAILED" ? "#ef4444" : "#f59e0b",
                  fontSize: "0.75rem",
                  marginTop: 2,
                  fontWeight: 700,
                }}
              >
                {e.result === "SUCCESS" ? "✓" : e.result === "FAILED" ? "✕" : "⚠"}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.8125rem", color: "#e2e8f0" }}>{e.action}</div>
                <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: 2 }}>{e.actor} · {formatDateTime(e.timestamp)}</div>
              </div>
            </div>
          ))}
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

  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <div className="page-fade" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Mission Header */}
      <div
        className="defence-panel"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(180deg, #0c1828 0%, #08131f 100%)",
          border: "1px solid #1e3a60",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className="pulse-beacon" style={{ background: "#22c55e" }} />
            <span className="section-label" style={{ margin: 0, color: "#60a5fa" }}>
              COMMAND DASHBOARD · NOVEXA DEFENCE TRUST · {dateStr}
            </span>
          </div>
          <h1
            className="font-display"
            style={{ fontSize: "2rem", fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px", letterSpacing: "0.02em" }}
          >
            {greeting}, {user.name.split(" ")[0]}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: "0.8125rem", color: "#64748b" }}>
            <span>Signed in as <RoleBadge role={role} size="sm" /></span>
            <span>·</span>
            <span style={{ color: "#22c55e", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              ✓ Identity Verified
            </span>
            <span>·</span>
            <span className="meta-id">{user.actor?.did || "—"}</span>
          </div>
        </div>

        {/* Tactical Badges */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div
            style={{
              padding: "4px 12px",
              background: "rgba(37,99,235,0.12)",
              border: "1px solid rgba(37,99,235,0.3)",
              borderRadius: "20px",
              fontSize: "0.75rem",
              color: "#60a5fa",
              fontWeight: 600,
              letterSpacing: "0.04em",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            NODE: NOVEXA-01 · ENCRYPTED
          </div>
          <div style={{ fontSize: "0.6875rem", color: "#475569" }}>
            SIH 2026 · PS 26125 · Synthetic Platform
          </div>
        </div>
      </div>

      {role === "admin" && <AdminDashboard />}
      {role === "nft-creator" && <NFTCreatorDashboard />}
      {role === "technician" && <TechnicianDashboard />}
      {role === "auditor" && <AuditorDashboard />}
    </div>
  );
}
