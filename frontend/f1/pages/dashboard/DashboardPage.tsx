import { Link } from "react-router";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import RoleBadge from "../../components/ui/RoleBadge";
import AuditTimeline from "../../components/ui/AuditTimeline";
import { useState, useEffect, useRef } from "react";
import { ASSETS, AUDIT_EVENTS, CERTIFICATIONS, formatDateTime } from "../../data/mockData";
import { dashboardService, DashboardSummary } from "../../services/dashboard";
import { useAuth } from "../../context/AuthContext";

/* â”€â”€ Count-up hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function useCountUp(target: number, duration = 900, delay = 0): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let startTime: number | null = null;

    const timer = setTimeout(() => {
      function step(ts: number) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) {
          raf.current = requestAnimationFrame(step);
        }
      }
      raf.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);

  return value;
}

/* â”€â”€ Live Clock â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#475569", letterSpacing: "0.05em" }}>
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
    </span>
  );
}

/* â”€â”€ Trust Chain Node â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function TrustNode({ icon, label, sublabel, color }: { icon: string; label: string; sublabel: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80, textAlign: "center" }}>
      <div style={{
        width: 38, height: 38, borderRadius: "8px",
        background: `${color}15`, border: `1px solid ${color}35`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.1rem", color,
        boxShadow: `0 0 12px ${color}18`,
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}>
        {icon}
      </div>
      <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 500 }}>{sublabel}</div>
    </div>
  );
}

/* â”€â”€ Skeleton Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="skeleton-card" style={{ padding: "14px 20px", height: 48, display: "flex", alignItems: "center", gap: 12 }}>
        <div className="skeleton-line" style={{ width: 10, height: 10, borderRadius: "50%" }} />
        <div className="skeleton-line" style={{ width: 220, height: 12 }} />
        <div className="skeleton-line" style={{ marginLeft: "auto", width: 100, height: 28, borderRadius: 5 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-card" style={{ padding: "18px 20px", height: 96 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div className="skeleton-line" style={{ width: 90, height: 10 }} />
              <div className="skeleton-line" style={{ width: 26, height: 26, borderRadius: 5 }} />
            </div>
            <div className="skeleton-line" style={{ width: 60, height: 28 }} />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="skeleton-card" style={{ padding: 20, height: 200 }}>
            <div className="skeleton-line" style={{ width: 140, height: 10, marginBottom: 20 }} />
            {[...Array(3)].map((_, j) => (
              <div key={j} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div className="skeleton-line" style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-line" style={{ width: "80%", height: 11, marginBottom: 6 }} />
                  <div className="skeleton-line" style={{ width: "50%", height: 9 }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADMIN DASHBOARD
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    dashboardService.getSummary().then(setSummary).catch(console.error);
  }, []);

  const totalAssets   = useCountUp(summary?.total_assets ?? 0, 800, 120);
  const activeUsers   = useCountUp(summary?.active_users ?? 0, 700, 200);
  const totalCerts    = useCountUp(summary?.total_certifications ?? 0, 750, 280);
  const failedVerif   = useCountUp(summary?.failed_verifications ?? 0, 600, 360);
  const blockchainTxs = useCountUp(summary?.total_blockchain_txs ?? 0, 900, 440);
  const auditEvents   = useCountUp(summary?.total_audit_events ?? 0, 850, 520);

  if (!summary) return <DashboardSkeleton />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* System Operational Console Banner */}
      <div
        className="defence-panel stagger-in-1"
        style={{
          padding: "13px 20px",
          background: "linear-gradient(90deg, rgba(34,197,94,0.09) 0%, rgba(12,24,40,0.85) 100%)",
          borderColor: "rgba(34,197,94,0.22)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="status-ripple"
            style={{ background: "#22c55e", width: 7, height: 7, borderRadius: "50%", display: "inline-block" }}
          />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.09em", color: "#22c55e" }}>
            MISSION STATUS: OPERATIONAL
          </span>
        </div>
        <div style={{ width: 1, height: 16, background: "#1e3a60", flexShrink: 0 }} />
        <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
          <strong style={{ color: "#e2e8f0" }}>{summary.total_assets} Assets</strong> registered Â·{" "}
          <strong style={{ color: "#e2e8f0" }}>{summary.active_users} Active Users</strong> Â·{" "}
          <strong style={{ color: "#f59e0b" }}>{summary.pending_certifications} Pending Certifications</strong>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <LiveClock />
          <Link
            to="/app/system-activity"
            className="btn-secondary"
            style={{ fontSize: "0.75rem", padding: "4px 12px", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            View Live Feed â†’
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        className="stagger-in-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}
      >
        <StatCard label="Total Assets" value={totalAssets.toString()} icon="â—ˆ" />
        <StatCard label="Active Users" value={activeUsers.toString()} icon="â—‰" sub={`${summary.pending_users} pending`} />
        <StatCard label="Certifications" value={totalCerts.toString()} icon="â—†" accent="#22c55e" sub={`${summary.pending_certifications} pending`} />
        <StatCard label="Verification Issues" value={failedVerif.toString()} icon="âš " accent="#f59e0b" />
        <StatCard label="Blockchain TXs" value={blockchainTxs.toString()} icon="â¬¡" accent="#3b82f6" />
        <StatCard label="Audit Events" value={auditEvents.toString()} icon="â‰¡" />
      </div>

      {/* Trust & Verification Chain */}
      <div
        className="defence-panel stagger-in-3"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(19,32,64,0.5) 0%, rgba(12,24,40,0.95) 100%)",
          borderColor: "rgba(37,99,235,0.18)",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <div className="db-section-title">TRUST VERIFICATION CHAIN</div>
          <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: 4, marginLeft: 11 }}>
            Sepolia Testnet (ID: 11155111) Â· Non-Transferable NFT Standard
          </div>
        </div>

        {/* Chain visualisation */}
        <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 4 }}>
          <TrustNode icon="â—ˆ" label="Asset" sublabel="Registered" color="#94a3b8" />
          <div className="trust-chain-connector" style={{ minWidth: 36, flex: 1 }}>
            <div className="trust-chain-pulse" />
          </div>
          <TrustNode icon="â—«" label="Evidence" sublabel="SHA-256 Hash" color="#60a5fa" />
          <div className="trust-chain-connector" style={{ minWidth: 36, flex: 1 }}>
            <div className="trust-chain-pulse" style={{ animationDelay: "0.95s" }} />
          </div>
          <TrustNode icon="â—Ž" label="Verification" sublabel="Auditor Sign-off" color="#f59e0b" />
          <div className="trust-chain-connector" style={{ minWidth: 36, flex: 1 }}>
            <div className="trust-chain-pulse" style={{ animationDelay: "1.9s" }} />
          </div>
          <TrustNode icon="â—†" label="Cert NFT" sublabel="On-Chain Mint" color="#8b5cf6" />
          <div className="trust-chain-connector" style={{ minWidth: 36, flex: 1 }}>
            <div className="trust-chain-pulse" style={{ animationDelay: "2.85s" }} />
          </div>
          <TrustNode icon="â¬¡" label="Blockchain" sublabel="Immutable Proof" color="#22c55e" />
        </div>

        {/* Status indicators row */}
        <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap", borderTop: "1px solid #152b4a", paddingTop: 14 }}>
          {[
            { icon: "â¬¡", label: "BLOCKCHAIN ANCHOR", value: "Sepolia Testnet (ID: 11155111)", color: "#3b82f6" },
            { icon: "âœ“", label: "EVIDENCE INTEGRITY", value: "SHA-256 Match Validated", color: "#22c55e" },
            { icon: "â—†", label: "CERTIFICATION ENGINE", value: "Non-Transferable NFT Standard", color: "#8b5cf6" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 200px" }}>
              <div style={{ fontSize: "1.1rem", color: item.color, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.08em" }}>{item.label}</div>
                <div style={{ fontSize: "0.8125rem", color: item.color === "#22c55e" ? "#22c55e" : "#e2e8f0", fontWeight: 600 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attention items & Platform Users */}
      <div className="stagger-in-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

        {/* Attention Items */}
        <div className="defence-panel defence-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="db-section-title">REQUIRES ATTENTION</div>
            <span style={{
              fontSize: "0.6875rem", color: "#ef4444", fontWeight: 700,
              background: "rgba(239,68,68,0.1)", padding: "3px 9px", borderRadius: "4px",
              border: "1px solid rgba(239,68,68,0.25)", letterSpacing: "0.06em",
            }}>
              3 ALERTS
            </span>
          </div>
          {[
            { msg: "Evidence fingerprint mismatch â€” EF-2026-00423", level: "danger", tag: "INTEGRITY", time: "2h ago" },
            { msg: "Certification CERT-2026-00088 pending confirmation", level: "warning", tag: "BLOCKCHAIN", time: "3h ago" },
            { msg: "User USR-005 pending identity verification", level: "info", tag: "RBAC", time: "1d ago" },
          ].map((item) => (
            <div
              key={item.msg}
              className={`interactive-row alert-row alert-row-${item.level}`}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 8px",
                borderBottom: "1px solid #152b4a",
                alignItems: "flex-start",
                borderRadius: "4px",
                marginBottom: 2,
              }}
            >
              <span style={{
                color: item.level === "danger" ? "#ef4444" : item.level === "warning" ? "#f59e0b" : "#60a5fa",
                fontSize: "0.8125rem", marginTop: 2, fontWeight: 700, flexShrink: 0,
              }}>
                {item.level === "danger" ? "âœ•" : item.level === "warning" ? "âš " : "â“˜"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.8125rem", color: "#e2e8f0" }}>{item.msg}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{
                    fontSize: "0.625rem", fontWeight: 700,
                    color: item.level === "danger" ? "#ef4444" : item.level === "warning" ? "#f59e0b" : "#60a5fa",
                    background: item.level === "danger" ? "rgba(239,68,68,0.1)" : item.level === "warning" ? "rgba(245,158,11,0.1)" : "rgba(96,165,250,0.1)",
                    padding: "1px 5px", borderRadius: "3px",
                    border: `1px solid ${item.level === "danger" ? "rgba(239,68,68,0.25)" : item.level === "warning" ? "rgba(245,158,11,0.25)" : "rgba(96,165,250,0.25)"}`,
                    letterSpacing: "0.06em",
                  }}>
                    {item.tag}
                  </span>
                  <span style={{ fontSize: "0.6875rem", color: "#475569" }}>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Users */}
        <div className="defence-panel defence-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="db-section-title">PLATFORM USERS</div>
            <Link to="/app/users" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>
              Manage Users â†’
            </Link>
          </div>
          {[
            { name: "Arjun Mehta", role: "admin", last: "Now", roleColor: "#ef4444" },
            { name: "Priya Sharma", role: "nft-creator", last: "2h ago", roleColor: "#8b5cf6" },
            { name: "Rajesh Kumar", role: "technician", last: "4h ago", roleColor: "#f59e0b" },
            { name: "Deepa Nair", role: "auditor", last: "1d ago", roleColor: "#22c55e" },
          ].map((u) => (
            <div
              key={u.name}
              className="interactive-row"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 8px", borderBottom: "1px solid #152b4a", borderRadius: "4px" }}
            >
              <div
                className="avatar-ring"
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: `${u.roleColor}18`, border: `1.5px solid ${u.roleColor}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6875rem", fontWeight: 700, color: u.roleColor, flexShrink: 0,
                  boxShadow: `0 0 10px ${u.roleColor}18`,
                }}
              >
                {u.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.8125rem", color: "#e2e8f0", fontWeight: 500 }}>{u.name}</div>
                <div style={{ marginTop: 2 }}><RoleBadge role={u.role as any} size="sm" /></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span className="pulse-beacon" style={{ background: "#22c55e", width: 5, height: 5 }} />
                <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>{u.last}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Trail */}
      <div className="defence-panel stagger-in-5" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div className="db-section-title">RECENT AUDIT LOGS &amp; PROOFS</div>
          <Link to="/app/audit" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
            View Full Trail â†’
          </Link>
        </div>
        <AuditTimeline events={AUDIT_EVENTS.slice(0, 4)} />
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NFT CREATOR DASHBOARD
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function NFTCreatorDashboard() {
  const readyCert = CERTIFICATIONS.filter((c) => c.status === "PENDING");

  const totalIssued  = useCountUp(312, 800, 100);
  const pendingCount = useCountUp(readyCert.length, 600, 200);
  const blockchainTx = useCountUp(47, 700, 300);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

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
          borderColor: "rgba(139,92,246,0.28)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/app/certification-queue" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
            Create Certification â†’
          </Link>
          <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
            <strong style={{ color: "#a78bfa" }}>{readyCert.length}</strong> certification{readyCert.length !== 1 ? "s" : ""} awaiting on-chain minting
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="pulse-beacon" style={{ background: "#8b5cf6" }} />
          <span style={{ fontSize: "0.75rem", color: "#8b5cf6", fontWeight: 600, letterSpacing: "0.06em" }}>MINTER NODE READY</span>
          <LiveClock />
        </div>
      </div>

      {/* KPI Grid */}
      <div
        className="stagger-in-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}
      >
        <StatCard label="Ready for Certification" value="3" icon="â—ˆ" accent="#f59e0b" />
        <StatCard label="Certifications Issued" value={totalIssued.toString()} icon="â—†" accent="#22c55e" />
        <StatCard label="Pending Confirmation" value={pendingCount.toString()} icon="â—" accent="#8b5cf6" />
        <StatCard label="Blockchain TXs" value={blockchainTx.toString()} icon="â¬¡" sub="This month" accent="#3b82f6" />
      </div>

      {/* Eligible + Recent Certs */}
      <div className="stagger-in-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

        <div className="defence-panel defence-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="db-section-title">ELIGIBLE ASSETS</div>
            <Link to="/app/eligible-assets" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>
              View Eligible Assets â†’
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
            <div style={{ fontSize: "0.8125rem", color: "#475569", padding: "12px 0", textAlign: "center" }}>No assets currently eligible</div>
          )}
        </div>

        <div className="defence-panel defence-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="db-section-title">RECENT CERTIFICATIONS</div>
            <Link to="/app/certifications" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>
              View All â†’
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TECHNICIAN DASHBOARD
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function TechnicianDashboard() {
  const myAssets = ASSETS.slice(0, 4);

  const myCount       = useCountUp(5, 700, 100);
  const pendingCount  = useCountUp(1, 600, 200);
  const missingCount  = useCountUp(2, 650, 300);
  const submittedCount = useCountUp(1, 600, 400);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

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
          borderColor: "rgba(245,158,11,0.22)",
        }}
      >
        <Link to="/app/register" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
          Register / Update Asset â†’
        </Link>
        <Link to="/app/evidence" className="btn-secondary">
          Upload Evidence
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="pulse-beacon pulse-beacon-amber" style={{ background: "#f59e0b" }} />
          <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 600, letterSpacing: "0.06em" }}>STATION: TECHNICAL RECORDS DECK</span>
          <LiveClock />
        </div>
      </div>

      {/* KPI Grid */}
      <div
        className="stagger-in-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}
      >
        <StatCard label="My Assets" value={myCount.toString()} icon="â—ˆ" />
        <StatCard label="Pending Inspection" value={pendingCount.toString()} icon="â—Œ" accent="#f59e0b" />
        <StatCard label="Missing Evidence" value={missingCount.toString()} icon="âš " accent="#ef4444" />
        <StatCard label="Submitted for Cert." value={submittedCount.toString()} icon="â—†" accent="#22c55e" />
      </div>

      {/* My Assets Table */}
      <div className="defence-panel stagger-in-3" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="db-section-title">MY ASSIGNED ASSETS</div>
          <Link to="/app/my-assets" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
            View All Assets â†’
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
                      textAlign: "left", padding: "9px 12px",
                      fontSize: "0.625rem", color: "#475569", fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap",
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
                  <td style={{ padding: "10px 12px" }}><span className="meta-id" style={{ color: "#e2e8f0" }}>{a.id}</span></td>
                  <td style={{ padding: "10px 12px", fontSize: "0.8125rem", color: "#94a3b8" }}>{a.type}</td>
                  <td style={{ padding: "10px 12px" }}><StatusBadge status={a.lifecycle} size="sm" /></td>
                  <td style={{ padding: "10px 12px" }}><StatusBadge status={a.evidenceStatus} size="sm" /></td>
                  <td style={{ padding: "10px 12px" }}>
                    <Link to={`/app/assets/${a.id}`} style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
                      View Details â†’
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   AUDITOR DASHBOARD
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function AuditorDashboard() {
  const pendingVerif   = useCountUp(2, 700, 100);
  const failedRecords  = useCountUp(1, 600, 200);
  const verifiedToday  = useCountUp(3, 700, 300);
  const auditTotal     = useCountUp(441, 900, 400);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

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
          borderColor: "rgba(34,197,94,0.22)",
        }}
      >
        <Link to="/app/search" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
          Search Assets to Verify â†’
        </Link>
        <Link to="/app/verification" className="btn-secondary">
          Verification Center
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="status-ripple"
            style={{ background: "#22c55e", width: 7, height: 7, borderRadius: "50%", display: "inline-block" }}
          />
          <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600, letterSpacing: "0.06em" }}>INSPECTION ENGINE ACTIVE</span>
          <LiveClock />
        </div>
      </div>

      {/* KPI Grid */}
      <div
        className="stagger-in-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}
      >
        <StatCard label="Pending Verification" value={pendingVerif.toString()} icon="â—Ž" accent="#f59e0b" />
        <StatCard label="Failed Records" value={failedRecords.toString()} icon="âœ•" accent="#ef4444" sub="Evidence mismatch" />
        <StatCard label="Verified Today" value={verifiedToday.toString()} icon="âœ“" accent="#22c55e" />
        <StatCard label="Audit Events" value={auditTotal.toString()} icon="â‰¡" />
      </div>

      {/* Assets + Events */}
      <div className="stagger-in-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

        <div className="defence-panel defence-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="db-section-title">ASSETS REQUIRING VERIFICATION</div>
            <span style={{
              fontSize: "0.625rem", color: "#f59e0b",
              background: "rgba(245,158,11,0.1)", padding: "3px 8px", borderRadius: "4px",
              fontWeight: 700, letterSpacing: "0.08em",
              border: "1px solid rgba(245,158,11,0.25)",
            }}>
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
                  Inspect â†’
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="defence-panel defence-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="db-section-title">RECENT AUDIT EVENTS</div>
            <Link to="/app/audit-trail" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>
              View Trail â†’
            </Link>
          </div>
          {AUDIT_EVENTS.slice(0, 4).map((e) => (
            <div
              key={e.id}
              className="interactive-row"
              style={{ display: "flex", gap: 10, padding: "9px 8px", borderBottom: "1px solid #152b4a", alignItems: "flex-start", borderRadius: "4px" }}
            >
              <span style={{
                color: e.result === "SUCCESS" ? "#22c55e" : e.result === "FAILED" ? "#ef4444" : "#f59e0b",
                fontSize: "0.75rem", marginTop: 3, fontWeight: 700, flexShrink: 0,
              }}>
                {e.result === "SUCCESS" ? "âœ“" : e.result === "FAILED" ? "âœ•" : "âš "}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.8125rem", color: "#e2e8f0" }}>{e.action}</div>
                <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: 2 }}>{e.actor} Â· {formatDateTime(e.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ROOT DASHBOARD PAGE
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function DashboardPage() {
  const { user, role } = useAuth();
  if (!user || !role) return null;

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const dateStr = new Date()
    .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <div className="db-bg page-fade" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Subtle background scan line */}
      <div className="db-scan-line" />

      {/* â”€â”€ Mission Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className="defence-panel"
        style={{
          padding: "22px 26px",
          background: "linear-gradient(180deg, #0d1c34 0%, #08131f 100%)",
          border: "1px solid #1e3a60",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="db-header-glint" />

        {/* Left */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span
              className="status-ripple"
              style={{ background: "#22c55e", width: 7, height: 7, borderRadius: "50%", display: "inline-block" }}
            />
            <span className="section-label" style={{ margin: 0, color: "#60a5fa", letterSpacing: "0.1em", fontSize: "0.6875rem" }}>
              COMMAND DASHBOARD Â· NOVEXA DEFENCE TRUST Â· {dateStr}
            </span>
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
              fontWeight: 700,
              color: "#e2e8f0",
              margin: "0 0 8px",
              letterSpacing: "0.025em",
              lineHeight: 1.1,
            }}
          >
            {greeting}, {user.name.split(" ")[0]}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: "0.8125rem", color: "#64748b" }}>
            <span>Signed in as <RoleBadge role={role} size="sm" /></span>
            <span style={{ color: "#1e3a60" }}>Â·</span>
            <span style={{ color: "#22c55e", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              âœ“ Identity Verified
            </span>
            <span style={{ color: "#1e3a60" }}>Â·</span>
            <span className="meta-id" style={{ fontSize: "0.75rem" }}>{user.actor?.did || "â€”"}</span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div className="node-badge">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
            NODE: NOVEXA-01 Â· ENCRYPTED
          </div>
          <span style={{
            padding: "3px 10px",
            background: "rgba(37,99,235,0.08)",
            border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: "12px",
            fontSize: "0.6875rem",
            color: "#475569",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}>
            SIH 2026 Â· PS 26125 Â· Synthetic Platform
          </span>
          <LiveClock />
        </div>
      </div>

      {/* â”€â”€ Role-based dashboard body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {role === "admin"       && <AdminDashboard />}
      {role === "nft-creator" && <NFTCreatorDashboard />}
      {role === "technician"  && <TechnicianDashboard />}
      {role === "auditor"     && <AuditorDashboard />}
    </div>
  );
}
