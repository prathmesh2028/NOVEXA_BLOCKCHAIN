import { Link } from "react-router";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import RoleBadge from "../../components/ui/RoleBadge";
import AuditTimeline from "../../components/ui/AuditTimeline";
import { useState, useEffect, useRef } from "react";
import { formatDateTime } from "../../data/utils";
import { dashboardService, DashboardSummary } from "../../services/dashboard";
import { assetService, AssetResponse } from "../../services/assets";
import { certificationService, CertificationResponse } from "../../services/certifications";
import { auditService, AuditEventResponse } from "../../services/audit";
import { useAuth } from "../../context/AuthContext";

/* ── Count-up hook ─────────────────────────────────────────────────── */
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

/* ── Live Clock ─────────────────────────────────────────────────────── */
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

/* ── Trust Chain Node ────────────────────────────────────────────────── */
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

/* ── Skeleton Loading ──────────────────────────────────────────────── */
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

/* ════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ════════════════════════════════════════════════════════════════════ */
function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEventResponse[]>([]);

  useEffect(() => {
    dashboardService.getSummary().then(setSummary).catch(console.error);
    auditService.listAuditEvents({ page_size: 4 }).then(r => setAuditEvents(r.items)).catch(console.error);
  }, []);

  const totalAssets   = useCountUp(summary?.total_assets ?? 0, 800, 120);
  const activeUsers   = useCountUp(summary?.active_users ?? 0, 700, 200);
  const totalCerts    = useCountUp(summary?.total_certifications ?? 0, 750, 280);
  const failedVerif   = useCountUp(summary?.failed_verifications ?? 0, 600, 360);
  const blockchainTxs = useCountUp(summary?.total_blockchain_txs ?? 0, 900, 440);
  const auditTotal    = useCountUp(summary?.total_audit_events ?? 0, 850, 520);

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
          <strong style={{ color: "#e2e8f0" }}>{summary.total_assets} Assets</strong> registered ·{" "}
          <strong style={{ color: "#e2e8f0" }}>{summary.active_users} Active Users</strong> ·{" "}
          <strong style={{ color: "#f59e0b" }}>{summary.pending_certifications} Pending Certifications</strong>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <LiveClock />
          <Link
            to="/app/audit"
            className="btn-secondary"
            style={{ fontSize: "0.75rem", padding: "4px 12px", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            View Live Feed →
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        className="stagger-in-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}
      >
        <StatCard label="Total Assets" value={totalAssets.toString()} icon="◈" />
        <StatCard label="Active Users" value={activeUsers.toString()} icon="◉" sub={`${summary.pending_users} pending`} />
        <StatCard label="Certifications" value={totalCerts.toString()} icon="◆" accent="#22c55e" sub={`${summary.pending_certifications} pending`} />
        <StatCard label="Verification Issues" value={failedVerif.toString()} icon="⚠" accent="#f59e0b" />
        <StatCard label="Blockchain TXs" value={blockchainTxs.toString()} icon="⬡" accent="#3b82f6" />
        <StatCard label="Audit Events" value={auditTotal.toString()} icon="≡" />
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
            Blockchain Anchored · Non-Transferable NFT Certification
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 4 }}>
          <TrustNode icon="◈" label="Asset" sublabel="Registered" color="#94a3b8" />
          <div className="trust-chain-connector" style={{ minWidth: 36, flex: 1 }}>
            <div className="trust-chain-pulse" />
          </div>
          <TrustNode icon="◫" label="Evidence" sublabel="SHA-256 Hash" color="#60a5fa" />
          <div className="trust-chain-connector" style={{ minWidth: 36, flex: 1 }}>
            <div className="trust-chain-pulse" style={{ animationDelay: "0.95s" }} />
          </div>
          <TrustNode icon="◎" label="Verification" sublabel="Auditor Sign-off" color="#f59e0b" />
          <div className="trust-chain-connector" style={{ minWidth: 36, flex: 1 }}>
            <div className="trust-chain-pulse" style={{ animationDelay: "1.9s" }} />
          </div>
          <TrustNode icon="◆" label="Cert NFT" sublabel="On-Chain Mint" color="#8b5cf6" />
          <div className="trust-chain-connector" style={{ minWidth: 36, flex: 1 }}>
            <div className="trust-chain-pulse" style={{ animationDelay: "2.85s" }} />
          </div>
          <TrustNode icon="⬡" label="Blockchain" sublabel="Immutable Proof" color="#22c55e" />
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap", borderTop: "1px solid #152b4a", paddingTop: 14 }}>
          {[
            { icon: "⬡", label: "BLOCKCHAIN ANCHOR", value: "Anchored On-Chain", color: "#3b82f6" },
            { icon: "✓", label: "EVIDENCE INTEGRITY", value: "SHA-256 Verified", color: "#22c55e" },
            { icon: "◆", label: "CERTIFICATION ENGINE", value: "Non-Transferable NFT", color: "#8b5cf6" },
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

      {/* Recent Audit Trail */}
      <div className="defence-panel stagger-in-4" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div className="db-section-title">RECENT AUDIT LOGS & PROOFS</div>
          <Link to="/app/audit" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
            View Full Trail →
          </Link>
        </div>
        {auditEvents.length > 0 ? (
          <AuditTimeline events={auditEvents} />
        ) : (
          <div style={{ color: "#475569", fontSize: "0.875rem", textAlign: "center", padding: "20px 0" }}>
            No audit events yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   NFT CREATOR DASHBOARD
   ════════════════════════════════════════════════════════════════════ */
function NFTCreatorDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentCerts, setRecentCerts] = useState<CertificationResponse[]>([]);
  const [eligibleAssets, setEligibleAssets] = useState<AssetResponse[]>([]);

  useEffect(() => {
    dashboardService.getSummary().then(setSummary).catch(console.error);
    certificationService.listCertifications({ page_size: 5 }).then(r => setRecentCerts(r.items)).catch(console.error);
    assetService.listAssets({ lifecycle: "ACCEPTED_FOR_ASSEMBLY", page_size: 5 }).then(r => setEligibleAssets(r.items)).catch(console.error);
  }, []);

  const pendingCount = useCountUp(summary?.pending_certifications ?? 0, 600, 200);
  const totalIssued  = useCountUp(summary?.total_certifications ?? 0, 800, 100);
  const blockchainTx = useCountUp(summary?.total_blockchain_txs ?? 0, 700, 300);

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
            Create Certification →
          </Link>
          <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
            <strong style={{ color: "#a78bfa" }}>{summary?.pending_certifications ?? "…"}</strong>{" "}
            certification{summary?.pending_certifications !== 1 ? "s" : ""} awaiting on-chain minting
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
        <StatCard label="Eligible Assets" value={eligibleAssets.length.toString()} icon="◈" accent="#f59e0b" />
        <StatCard label="Certifications Issued" value={totalIssued.toString()} icon="◆" accent="#22c55e" />
        <StatCard label="Pending Confirmation" value={pendingCount.toString()} icon="◐" accent="#8b5cf6" />
        <StatCard label="Blockchain TXs" value={blockchainTx.toString()} icon="⬡" sub="Total" accent="#3b82f6" />
      </div>

      {/* Eligible + Recent Certs */}
      <div className="stagger-in-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

        <div className="defence-panel defence-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="db-section-title">ELIGIBLE ASSETS</div>
            <Link to="/app/eligible-assets" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>
              View All →
            </Link>
          </div>
          {eligibleAssets.length === 0 ? (
            <div style={{ fontSize: "0.8125rem", color: "#475569", padding: "12px 0", textAlign: "center" }}>No assets currently eligible</div>
          ) : (
            eligibleAssets.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="interactive-row"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid #152b4a", borderRadius: "4px" }}
              >
                <div>
                  <div className="meta-id" style={{ color: "#e2e8f0" }}>{a.asset_id}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>{a.type}</div>
                </div>
                <StatusBadge status={a.lifecycle_state} size="sm" />
              </div>
            ))
          )}
        </div>

        <div className="defence-panel defence-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="db-section-title">RECENT CERTIFICATIONS</div>
            <Link to="/app/certifications" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>
              View All →
            </Link>
          </div>
          {recentCerts.length === 0 ? (
            <div style={{ fontSize: "0.8125rem", color: "#475569", padding: "12px 0", textAlign: "center" }}>No certifications yet.</div>
          ) : (
            recentCerts.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="interactive-row"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid #152b4a", borderRadius: "4px" }}
              >
                <div>
                  <div className="meta-id" style={{ color: "#e2e8f0" }}>{c.cert_id}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>Asset: {c.asset_id}</div>
                </div>
                <StatusBadge status={c.status} size="sm" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   TECHNICIAN DASHBOARD
   ════════════════════════════════════════════════════════════════════ */
function TechnicianDashboard() {
  const [myAssets, setMyAssets] = useState<AssetResponse[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [assetsLoading, setAssetsLoading] = useState(true);

  useEffect(() => {
    dashboardService.getSummary().then(setSummary).catch(console.error);
    assetService.listAssets({ page_size: 4 })
      .then(r => setMyAssets(r.items))
      .catch(console.error)
      .finally(() => setAssetsLoading(false));
  }, []);

  const myCount        = useCountUp(summary?.total_assets ?? 0, 700, 100);
  const pendingInspect = useCountUp(
    Object.entries(summary?.lifecycle_breakdown ?? {}).find(([k]) => k === "RECEIVED")?.[1] ?? 0,
    600, 200
  );

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
          Register / Update Asset →
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
        <StatCard label="Total Assets" value={myCount.toString()} icon="◈" />
        <StatCard label="Pending Inspection" value={pendingInspect.toString()} icon="◌" accent="#f59e0b" />
        <StatCard label="Certifications" value={(summary?.total_certifications ?? 0).toString()} icon="◆" accent="#22c55e" />
        <StatCard label="Pending Certs" value={(summary?.pending_certifications ?? 0).toString()} icon="◐" accent="#8b5cf6" />
      </div>

      {/* My Assets Table */}
      <div className="defence-panel stagger-in-3" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="db-section-title">RECENT ASSETS</div>
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
              {assetsLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#475569", fontSize: "0.875rem" }}>Loading assets…</td>
                </tr>
              ) : myAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#475569", fontSize: "0.875rem" }}>No assets registered yet.</td>
                </tr>
              ) : (
                myAssets.map((a) => (
                  <tr key={a.id} className="interactive-row" style={{ borderBottom: "1px solid #152b4a" }}>
                    <td style={{ padding: "10px 12px" }}><span className="meta-id" style={{ color: "#e2e8f0" }}>{a.asset_id}</span></td>
                    <td style={{ padding: "10px 12px", fontSize: "0.8125rem", color: "#94a3b8" }}>{a.type}</td>
                    <td style={{ padding: "10px 12px" }}><StatusBadge status={a.lifecycle_state} size="sm" /></td>
                    <td style={{ padding: "10px 12px" }}><StatusBadge status={a.evidence_status} size="sm" /></td>
                    <td style={{ padding: "10px 12px" }}>
                      <Link to={`/app/assets/${a.id}`} style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   AUDITOR DASHBOARD
   ════════════════════════════════════════════════════════════════════ */
function AuditorDashboard() {
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventResponse[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    dashboardService.getSummary().then(setSummary).catch(console.error);
    assetService.listAssets({ page_size: 10 }).then(r => setAssets(r.items)).catch(console.error);
    auditService.listAuditEvents({ page_size: 4 }).then(r => setAuditEvents(r.items)).catch(console.error);
  }, []);

  const pendingVerif  = useCountUp(summary?.failed_verifications ?? 0, 700, 100);
  const auditTotal    = useCountUp(summary?.total_audit_events ?? 0, 900, 400);

  const unverifiedAssets = assets.filter(a => a.verification_status !== "VERIFIED");

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
          Search Assets to Verify →
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
        <StatCard label="Verification Issues" value={pendingVerif.toString()} icon="◎" accent="#f59e0b" />
        <StatCard label="Unverified Assets" value={unverifiedAssets.length.toString()} icon="✕" accent="#ef4444" />
        <StatCard label="Total Assets" value={(summary?.total_assets ?? 0).toString()} icon="◈" accent="#22c55e" />
        <StatCard label="Audit Events" value={auditTotal.toString()} icon="≡" />
      </div>

      {/* Assets + Events */}
      <div className="stagger-in-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

        <div className="defence-panel defence-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="db-section-title">ASSETS REQUIRING VERIFICATION</div>
            {unverifiedAssets.length > 0 && (
              <span style={{
                fontSize: "0.625rem", color: "#f59e0b",
                background: "rgba(245,158,11,0.1)", padding: "3px 8px", borderRadius: "4px",
                fontWeight: 700, letterSpacing: "0.08em",
                border: "1px solid rgba(245,158,11,0.25)",
              }}>
                ACTION REQUIRED
              </span>
            )}
          </div>
          {unverifiedAssets.length === 0 ? (
            <div style={{ fontSize: "0.8125rem", color: "#475569", padding: "12px 0", textAlign: "center" }}>
              All assets verified. ✓
            </div>
          ) : (
            unverifiedAssets.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="interactive-row"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid #152b4a", borderRadius: "4px" }}
              >
                <div>
                  <div className="meta-id" style={{ color: "#e2e8f0" }}>{a.asset_id}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>{a.type}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StatusBadge status={a.verification_status} size="sm" />
                  <Link to={`/app/assets/${a.id}`} style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
                    Inspect →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="defence-panel defence-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="db-section-title">RECENT AUDIT EVENTS</div>
            <Link to="/app/audit" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>
              View Trail →
            </Link>
          </div>
          {auditEvents.length === 0 ? (
            <div style={{ fontSize: "0.8125rem", color: "#475569", padding: "12px 0", textAlign: "center" }}>No audit events yet.</div>
          ) : (
            auditEvents.map((e) => (
              <div
                key={e.id}
                className="interactive-row"
                style={{ display: "flex", gap: 10, padding: "9px 8px", borderBottom: "1px solid #152b4a", alignItems: "flex-start", borderRadius: "4px" }}
              >
                <span style={{
                  color: e.result === "SUCCESS" ? "#22c55e" : e.result === "FAILED" ? "#ef4444" : "#f59e0b",
                  fontSize: "0.75rem", marginTop: 3, fontWeight: 700, flexShrink: 0,
                }}>
                  {e.result === "SUCCESS" ? "✓" : e.result === "FAILED" ? "✕" : "⚠"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8125rem", color: "#e2e8f0" }}>{e.action}</div>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: 2 }}>{e.actor_did} · {formatDateTime(e.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ROOT DASHBOARD PAGE
   ════════════════════════════════════════════════════════════════════ */
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

      {/* ── Mission Header ──────────────────────────────────────── */}
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
              COMMAND DASHBOARD · NOVEXA DEFENCE TRUST · {dateStr}
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
            <span style={{ color: "#1e3a60" }}>·</span>
            <span style={{ color: "#22c55e", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              ✓ Identity Verified
            </span>
            <span style={{ color: "#1e3a60" }}>·</span>
            <span className="meta-id" style={{ fontSize: "0.75rem" }}>{user.actor?.did || "—"}</span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div className="node-badge">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
            NODE: NOVEXA-01 · ENCRYPTED
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
            SIH 2026 · PS 26125
          </span>
          <LiveClock />
        </div>
      </div>

      {/* ── Role-based dashboard body ──────────────────────────── */}
      {role === "admin"       && <AdminDashboard />}
      {role === "nft-creator" && <NFTCreatorDashboard />}
      {role === "technician"  && <TechnicianDashboard />}
      {role === "auditor"     && <AuditorDashboard />}
    </div>
  );
}
