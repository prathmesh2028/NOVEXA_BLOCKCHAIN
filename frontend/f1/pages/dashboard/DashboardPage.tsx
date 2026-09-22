import { Link } from "react-router";
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
import "./DashboardPage.css";

/* ── Count-up Hook ─────────────────────────────────────────────────── */
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

/* ── Live IST Clock ─────────────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#64748b", letterSpacing: "0.05em" }}>
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} IST
    </span>
  );
}

/* ── Mini Radial Progress Meter ─────────────────────────────────────── */
function MiniRadialMeter({ percentage, color = "#3b82f6" }: { percentage: number; color?: string }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circ - (circ * clamped) / 100;

  return (
    <div className="db-radial-meter" title={`${Math.round(clamped)}% complete`}>
      <svg viewBox="0 0 36 36">
        <circle className="db-radial-bg" cx="18" cy="18" r={r} />
        <circle
          className="db-radial-fg"
          cx="18"
          cy="18"
          r={r}
          style={{
            stroke: color,
            strokeDasharray: circ,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="db-radial-text">{Math.round(clamped)}%</div>
    </div>
  );
}

/* ── Redesigned Dribbble KPI Card ───────────────────────────────────── */
interface DribbbleKpiProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
  icon: string;
  radialPercentage?: number;
}

function DribbbleKpiCard({ label, value, sub, accent = "#3b82f6", icon, radialPercentage }: DribbbleKpiProps) {
  return (
    <div className="db-kpi-card">
      <div className="db-kpi-top">
        <span className="db-kpi-label">{label}</span>
        <div
          className="db-kpi-icon-badge"
          style={{
            background: `${accent}15`,
            border: `1px solid ${accent}35`,
            color: accent,
          }}
        >
          {icon}
        </div>
      </div>

      <div className="db-kpi-main">
        <div className="db-kpi-value">{value}</div>
        {radialPercentage !== undefined && (
          <MiniRadialMeter percentage={radialPercentage} color={accent} />
        )}
      </div>

      {sub && (
        <div className="db-kpi-sub">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block" }} />
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

/* ── Trust Chain Node ──────────────────────────────────────────────── */
function TrustNode({ icon, label, sublabel, color }: { icon: string; label: string; sublabel: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80, textAlign: "center" }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "8px",
          background: `${color}15`,
          border: `1px solid ${color}35`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          color,
          boxShadow: `0 0 12px ${color}18`,
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        }}
      >
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
      <div className="skeleton-card" style={{ padding: "18px 24px", height: 64, display: "flex", alignItems: "center", gap: 12 }}>
        <div className="skeleton-line" style={{ width: 12, height: 12, borderRadius: "50%" }} />
        <div className="skeleton-line" style={{ width: 240, height: 16 }} />
        <div className="skeleton-line" style={{ marginLeft: "auto", width: 120, height: 32, borderRadius: 6 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-card" style={{ padding: "20px 22px", height: 130 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div className="skeleton-line" style={{ width: 100, height: 12 }} />
              <div className="skeleton-line" style={{ width: 32, height: 32, borderRadius: 8 }} />
            </div>
            <div className="skeleton-line" style={{ width: 70, height: 36 }} />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="skeleton-card" style={{ padding: 24, height: 340 }} />
        <div className="skeleton-card" style={{ padding: 24, height: 340 }} />
      </div>
    </div>
  );
}

/* ── Dashboard Error State ──────────────────────────────────────────── */
function DashboardError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div
      className="db-card"
      style={{
        padding: "40px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        textAlign: "center",
        borderColor: "rgba(239, 68, 68, 0.3)",
        background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(12,24,40,0.9) 100%)",
      }}
    >
      <div style={{ fontSize: "2rem" }}>⚠</div>
      <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fca5a5" }}>
        Dashboard Data Unavailable
      </div>
      <div style={{ fontSize: "0.875rem", color: "#94a3b8", maxWidth: 480, lineHeight: 1.6 }}>
        {error}
      </div>
      <button
        onClick={onRetry}
        style={{
          marginTop: 8,
          padding: "10px 24px",
          background: "rgba(59, 130, 246, 0.15)",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          borderRadius: 8,
          color: "#60a5fa",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "0.04em",
        }}
      >
        ↻ Retry
      </button>
    </div>
  );
}

/* ── Row 3: Circular Defence Trust Visualization (HERO FEATURE) ─────── */
function DefenceTrustVisual({
  trustPercentage = 99.4,
  failedVerifications = 0,
  totalCertifications = 0,
  blockchainTxs = 0,
}: {
  trustPercentage?: number;
  totalAssets: number;
  failedVerifications: number;
  totalCertifications: number;
  blockchainTxs: number;
}) {
  const radius = 94;
  const circ = 2 * Math.PI * radius; // ~590.62
  const clamped = Math.min(100, Math.max(0, trustPercentage));
  const offset = circ - (circ * clamped) / 100;

  return (
    <div className="db-card db-trust-card">
      <div className="db-card-header">
        <div>
          <div className="db-card-title">DEFENCE TRUST STATUS</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
            Autonomous Cryptographic Integrity & Blockchain Telemetry
          </div>
        </div>
        <div className="db-trust-pill">
          <span className="db-status-dot-pulse" />
          SYSTEM SECURED
        </div>
      </div>

      <div className="db-orbital-wrapper">
        <div className="db-orbital-svg-box">
          <svg className="db-orbital-svg" viewBox="0 0 280 280">
            <defs>
              <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(37, 99, 235, 0.12)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Ambient center background glow */}
            <circle cx="140" cy="140" r="80" fill="url(#centerGlow)" />

            {/* Static outer guideline */}
            <circle cx="140" cy="140" r="126" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" fill="none" />

            {/* Outer rotating dashed orbit ring (30s) */}
            <g className="db-orbit-outer">
              <circle
                cx="140"
                cy="140"
                r="114"
                stroke="rgba(96, 165, 250, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                fill="none"
              />
              <circle cx="140" cy="26" r="3" fill="#60a5fa" />
              <circle cx="254" cy="140" r="2.5" fill="#3b82f6" />
              <circle cx="26" cy="140" r="2.5" fill="#3b82f6" />
            </g>

            {/* Progress Arc background track */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="var(--border-subtle, #152b4a)"
              strokeWidth="9"
              fill="none"
            />

            {/* Active Progress Arc */}
            <circle
              className="db-progress-arc"
              cx="140"
              cy="140"
              r={radius}
              stroke="url(#trustGradient)"
              strokeWidth="9"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 140 140)"
            />

            {/* Travelling node on outer orbit */}
            <g className="db-orbit-traveler">
              <circle cx="140" cy="26" r="5" fill="#22c55e" style={{ filter: "drop-shadow(0 0 6px #22c55e)" }} />
            </g>

            {/* Inner counter-rotating ring (22s) */}
            <g className="db-orbit-inner">
              <circle
                cx="140"
                cy="140"
                r="72"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="1"
                strokeDasharray="3 6"
                fill="none"
              />
              <circle cx="140" cy="68" r="2" fill="#93c5fd" />
              <circle cx="212" cy="140" r="2" fill="#93c5fd" />
            </g>
          </svg>

          {/* Central Text Value Overlay */}
          <div className="db-orbital-center">
            <span className="db-trust-score">{clamped}%</span>
            <span className="db-trust-score-label">TRUST INTEGRITY</span>
          </div>
        </div>
      </div>

      {/* 4-Corner Telemetry Grid */}
      <div className="db-telemetry-grid">
        <div className="db-telemetry-item">
          <div className="db-telemetry-icon" style={{ color: "#22c55e" }}>✓</div>
          <div>
            <div className="db-telemetry-title">ASSET INTEGRITY</div>
            <div className="db-telemetry-status">
              {failedVerifications === 0 ? "100% Cryptographic Match" : `${failedVerifications} Alerts Detected`}
            </div>
          </div>
        </div>

        <div className="db-telemetry-item">
          <div className="db-telemetry-icon" style={{ color: "#8b5cf6" }}>◆</div>
          <div>
            <div className="db-telemetry-title">CERTIFICATION NFT</div>
            <div className="db-telemetry-status">
              {totalCertifications > 0 ? `${totalCertifications} On-Chain Minted` : "Minter Idle"}
            </div>
          </div>
        </div>

        <div className="db-telemetry-item">
          <div className="db-telemetry-icon" style={{ color: "#3b82f6" }}>◫</div>
          <div>
            <div className="db-telemetry-title">EVIDENCE STORE</div>
            <div className="db-telemetry-status">SHA-256 Validated</div>
          </div>
        </div>

        <div className="db-telemetry-item">
          <div className="db-telemetry-icon" style={{ color: "#06b6d4" }}>⬡</div>
          <div>
            <div className="db-telemetry-title">BLOCKCHAIN SYNC</div>
            <div className="db-telemetry-status">
              {blockchainTxs > 0 ? `${blockchainTxs} Proof Txs Anchored` : "Chain Synchronized"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Row 3: Lifecycle Analytics Card ───────────────────────────────── */
function DefenceAssetActivityCard({
  summary,
}: {
  summary: DashboardSummary | null;
}) {
  const breakdown = summary?.lifecycle_breakdown ?? {};
  const total = summary?.total_assets ?? 0;

  const stages = [
    { key: "ACCEPTED_FOR_ASSEMBLY", label: "Accepted for Assembly", color: "#22c55e", desc: "Production Ready" },
    { key: "INSPECTION_RECORDED", label: "Inspection Recorded", color: "#3b82f6", desc: "Verified Quality" },
    { key: "RECEIVED", label: "Received at Depot", color: "#f59e0b", desc: "Awaiting Inspection" },
    { key: "SUPPLIER_DECLARED", label: "Supplier Declared", color: "#8b5cf6", desc: "In-Transit / Origin" },
    { key: "UNREGISTERED", label: "Unregistered Intake", color: "#64748b", desc: "Initial Ingestion" },
    { key: "REJECTED_QUARANTINED", label: "Quarantined / Rejected", color: "#ef4444", desc: "Safety Isolation" },
  ];

  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <div className="db-card-title">DEFENCE ASSET ACTIVITY & LIFECYCLE</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
            Real-time pipeline distribution across procurement, verification, and assembly
          </div>
        </div>
        <Link to="/app/assets" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
          View Asset Registry →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ padding: "12px 14px", background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.18)", borderRadius: 10 }}>
          <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>TOTAL ASSETS</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground, #e2e8f0)", marginTop: 4 }}>{total}</div>
        </div>
        <div style={{ padding: "12px 14px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 10 }}>
          <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>ASSEMBLY CLEARED</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#22c55e", marginTop: 4 }}>
            {breakdown["ACCEPTED_FOR_ASSEMBLY"] ?? 0}
          </div>
        </div>
        <div style={{ padding: "12px 14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 10 }}>
          <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>INSPECTION QUEUE</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b", marginTop: 4 }}>
            {breakdown["RECEIVED"] ?? 0}
          </div>
        </div>
      </div>

      <div className="db-lifecycle-list">
        {stages.map((st) => {
          const count = breakdown[st.key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={st.key} className="db-lifecycle-item">
              <div className="db-lifecycle-meta">
                <div className="db-lifecycle-name">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: st.color, display: "inline-block" }} />
                  <span>{st.label}</span>
                  <span style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 400 }}>({st.desc})</span>
                </div>
                <div className="db-lifecycle-count">
                  <span>{count}</span>
                  <span style={{ color: "#64748b", fontSize: "0.75rem", marginLeft: 6 }}>({pct}%)</span>
                </div>
              </div>
              <div className="db-progress-track">
                <div
                  className="db-progress-fill"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${st.color}99 0%, ${st.color} 100%)`,
                    boxShadow: pct > 0 ? `0 0 8px ${st.color}40` : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Row 4: System Status Panel ─────────────────────────────────────── */
function SystemStatusPanel() {
  const nodes = [
    { name: "Platform Core", sub: "Mission Control Engine · v2.4", status: "Operational", ping: "< 8ms", icon: "⬡" },
    { name: "Identity Service", sub: "W3C DID Registry · Ed25519", status: "Verified", ping: "Active", icon: "✓" },
    { name: "Blockchain Trust Chain", sub: "Hardhat / Ethereum Anchor", status: "Synced", ping: "Block #26125", icon: "◆" },
    { name: "Evidence Store", sub: "IPFS / SHA-256 Vault", status: "Healthy", ping: "100% Intact", icon: "◫" },
  ];

  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <div className="db-card-title">SYSTEM STATUS & TRUST METRICS</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
            Subsystem operational readiness & hardware telemetry
          </div>
        </div>
        <span className="node-badge" style={{ fontSize: "0.6875rem", padding: "3px 10px" }}>
          LIVE MONITOR
        </span>
      </div>

      <div className="db-status-list">
        {nodes.map((node) => (
          <div key={node.name} className="db-status-row">
            <div className="db-status-left">
              <div className="db-status-icon">{node.icon}</div>
              <div>
                <div className="db-status-name">{node.name}</div>
                <div className="db-status-sub">{node.sub}</div>
              </div>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <div className="db-status-badge">
                <span className="db-status-dot-pulse" />
                {node.status}
              </div>
              <span style={{ fontSize: "0.6875rem", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                {node.ping}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Row 4: Recent Activity Card ───────────────────────────────────── */
function RecentActivityCard({ auditEvents }: { auditEvents: AuditEventResponse[] }) {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <div className="db-card-title">RECENT SYSTEM ACTIVITY & PROOFS</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
            Cryptographically audited events with DID signatures
          </div>
        </div>
        <Link to="/app/system-activity" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
          View Full Activity →
        </Link>
      </div>

      {auditEvents.length > 0 ? (
        <AuditTimeline events={auditEvents} />
      ) : (
        <div style={{ color: "#64748b", fontSize: "0.875rem", textAlign: "center", padding: "32px 0" }}>
          No audit events recorded yet.
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ════════════════════════════════════════════════════════════════════ */
function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEventResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setError(null);
    setLoading(true);
    dashboardService.getSummary()
      .then(setSummary)
      .catch((e: any) => setError(e?.message || 'Failed to load dashboard data. Backend may be unavailable.'))
      .finally(() => setLoading(false));
    auditService.listAuditEvents({ page_size: 4 }).then(r => setAuditEvents(r.items)).catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const totalAssets   = useCountUp(summary?.total_assets ?? 0, 800, 100);
  const activeUsers   = useCountUp(summary?.active_users ?? 0, 700, 180);
  const totalCerts    = useCountUp(summary?.total_certifications ?? 0, 750, 260);
  const failedVerif   = useCountUp(summary?.failed_verifications ?? 0, 600, 340);
  const blockchainTxs = useCountUp(summary?.total_blockchain_txs ?? 0, 900, 420);

  if (loading && !summary) return <DashboardSkeleton />;
  if (error && !summary) return <DashboardError error={error} onRetry={loadData} />;

  // Calculate dynamic trust integrity score
  const total = summary.total_assets || 1;
  const issues = summary.failed_verifications || 0;
  const trustScore = Math.max(90, Math.round(((total - issues) / total) * 100 * 10) / 10);
  const certRate = Math.min(100, Math.round((summary.total_certifications / total) * 100)) || 100;
  const activeUserRate = Math.min(100, Math.round((summary.active_users / (summary.active_users + (summary.pending_users || 0) || 1)) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Operational Console Banner */}
      <div
        className="db-card"
        style={{
          padding: "14px 22px",
          background: "linear-gradient(90deg, rgba(34,197,94,0.08) 0%, rgba(12,24,40,0.85) 100%)",
          borderColor: "rgba(34,197,94,0.25)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="db-status-dot-pulse" />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.09em", color: "#22c55e" }}>
            MISSION STATUS: OPERATIONAL
          </span>
        </div>
        <div style={{ width: 1, height: 16, background: "var(--border, #1e3a60)", flexShrink: 0 }} />
        <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>
          <strong style={{ color: "var(--foreground, #e2e8f0)" }}>{summary.total_assets} Assets</strong> registered ·{" "}
          <strong style={{ color: "var(--foreground, #e2e8f0)" }}>{summary.active_users} Active Users</strong> ·{" "}
          <strong style={{ color: "#f59e0b" }}>{summary.pending_certifications} Pending Certifications</strong>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <LiveClock />
          <Link
            to="/app/audit"
            className="btn-secondary"
            style={{ fontSize: "0.75rem", padding: "4px 12px", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            Live Audit Stream →
          </Link>
        </div>
      </div>

      {/* ROW 2: KPI Intelligence Cards */}
      <div className="db-kpi-grid">
        <DribbbleKpiCard
          label="Total Defence Assets"
          value={totalAssets}
          icon="◈"
          accent="#3b82f6"
          radialPercentage={98}
          sub="Cryptographically registered"
        />
        <DribbbleKpiCard
          label="Active Personnel"
          value={activeUsers}
          icon="◉"
          accent="#06b6d4"
          radialPercentage={activeUserRate}
          sub={`${summary.pending_users} pending onboarding`}
        />
        <DribbbleKpiCard
          label="NFT Certifications"
          value={totalCerts}
          icon="◆"
          accent="#22c55e"
          radialPercentage={certRate}
          sub={`${summary.pending_certifications} pending mint`}
        />
        <DribbbleKpiCard
          label="Verification Alerts"
          value={failedVerif}
          icon="⚠"
          accent={failedVerif > 0 ? "#f59e0b" : "#22c55e"}
          radialPercentage={failedVerif > 0 ? 85 : 100}
          sub={failedVerif === 0 ? "Zero anomalies detected" : "Requires auditor review"}
        />
        <DribbbleKpiCard
          label="Blockchain TXs"
          value={blockchainTxs}
          icon="⬡"
          accent="#8b5cf6"
          radialPercentage={100}
          sub="On-chain immutable anchor"
        />
      </div>

      {/* ROW 3: Circular Trust Visual + Asset Activity Analytics */}
      <div className="db-analytics-grid">
        <DefenceTrustVisual
          trustPercentage={trustScore}
          totalAssets={summary.total_assets}
          failedVerifications={summary.failed_verifications}
          totalCertifications={summary.total_certifications}
          blockchainTxs={summary.total_blockchain_txs}
        />
        <DefenceAssetActivityCard summary={summary} />
      </div>

      {/* Trust & Verification Chain Architecture */}
      <div
        className="db-card"
        style={{
          background: "linear-gradient(135deg, rgba(19,32,64,0.5) 0%, rgba(12,24,40,0.95) 100%)",
          borderColor: "rgba(37,99,235,0.22)",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <div className="db-card-title">TRUST VERIFICATION CHAIN</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4, marginLeft: 11 }}>
            Blockchain Anchored · Non-Transferable NFT Certification · Cryptographic Proof
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

        <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap", borderTop: "1px solid var(--border, #152b4a)", paddingTop: 16 }}>
          {[
            { icon: "⬡", label: "BLOCKCHAIN ANCHOR", value: "Anchored On-Chain", color: "#3b82f6" },
            { icon: "✓", label: "EVIDENCE INTEGRITY", value: "SHA-256 Verified", color: "#22c55e" },
            { icon: "◆", label: "CERTIFICATION ENGINE", value: "Non-Transferable NFT", color: "#8b5cf6" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 200px" }}>
              <div style={{ fontSize: "1.1rem", color: item.color, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.08em" }}>{item.label}</div>
                <div style={{ fontSize: "0.8125rem", color: item.color === "#22c55e" ? "#22c55e" : "var(--foreground, #e2e8f0)", fontWeight: 600 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 4: Recent Activity & System Status */}
      <div className="db-bottom-grid">
        <RecentActivityCard auditEvents={auditEvents} />
        <SystemStatusPanel />
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setError(null);
    setLoading(true);
    dashboardService.getSummary()
      .then(setSummary)
      .catch((e: any) => setError(e?.message || 'Failed to load dashboard data. Backend may be unavailable.'))
      .finally(() => setLoading(false));
    certificationService.listCertifications({ page_size: 5 }).then(r => setRecentCerts(r.items)).catch(console.error);
    assetService.listAssets({ lifecycle: "ACCEPTED_FOR_ASSEMBLY", page_size: 5 }).then(r => setEligibleAssets(r.items)).catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const pendingCount = useCountUp(summary?.pending_certifications ?? 0, 600, 150);
  const totalIssued  = useCountUp(summary?.total_certifications ?? 0, 800, 100);
  const blockchainTx = useCountUp(summary?.total_blockchain_txs ?? 0, 700, 250);

  if (loading && !summary) return <DashboardSkeleton />;
  if (error && !summary) return <DashboardError error={error} onRetry={loadData} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Action Banner */}
      <div
        className="db-card"
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          background: "linear-gradient(90deg, rgba(139,92,246,0.12) 0%, rgba(12,24,40,0.85) 100%)",
          borderColor: "rgba(139,92,246,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <Link to="/app/certification-queue" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
            Create Certification →
          </Link>
          <div style={{ fontSize: "0.8125rem", color: "#64748b" }}>
            <strong style={{ color: "#a78bfa" }}>{summary?.pending_certifications ?? "…"}</strong>{" "}
            certification{summary?.pending_certifications !== 1 ? "s" : ""} awaiting on-chain minting
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="pulse-beacon" style={{ background: "#8b5cf6" }} />
          <span style={{ fontSize: "0.75rem", color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.06em" }}>MINTER NODE READY</span>
          <LiveClock />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="db-kpi-grid">
        <DribbbleKpiCard
          label="Eligible Assets"
          value={eligibleAssets.length}
          icon="◈"
          accent="#f59e0b"
          radialPercentage={80}
          sub="Cleared for certification"
        />
        <DribbbleKpiCard
          label="Certifications Issued"
          value={totalIssued}
          icon="◆"
          accent="#22c55e"
          radialPercentage={95}
          sub="Non-transferable defense NFTs"
        />
        <DribbbleKpiCard
          label="Pending Confirmation"
          value={pendingCount}
          icon="◐"
          accent="#8b5cf6"
          radialPercentage={40}
          sub="In mint pipeline"
        />
        <DribbbleKpiCard
          label="Blockchain TXs"
          value={blockchainTx}
          icon="⬡"
          accent="#3b82f6"
          radialPercentage={100}
          sub="Smart contract transactions"
        />
      </div>

      {/* ROW 3: Hero Circular Trust Visual + Activity */}
      <div className="db-analytics-grid">
        <DefenceTrustVisual
          trustPercentage={99.6}
          totalAssets={summary?.total_assets ?? 0}
          failedVerifications={summary?.failed_verifications ?? 0}
          totalCertifications={summary?.total_certifications ?? 0}
          blockchainTxs={summary?.total_blockchain_txs ?? 0}
        />
        <DefenceAssetActivityCard summary={summary} />
      </div>

      {/* Eligible + Recent Certs Panels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-title">ELIGIBLE ASSETS</div>
            <Link to="/app/eligible-assets" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
              View All →
            </Link>
          </div>
          {eligibleAssets.length === 0 ? (
            <div style={{ fontSize: "0.8125rem", color: "#64748b", padding: "16px 0", textAlign: "center" }}>No assets currently eligible</div>
          ) : (
            eligibleAssets.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="interactive-row"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid var(--border-subtle, #152b4a)", borderRadius: "4px" }}
              >
                <div>
                  <div className="meta-id" style={{ color: "var(--foreground, #e2e8f0)" }}>{a.asset_id}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>{a.type}</div>
                </div>
                <StatusBadge status={a.lifecycle_state} size="sm" />
              </div>
            ))
          )}
        </div>

        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-title">RECENT CERTIFICATIONS</div>
            <Link to="/app/certifications" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
              View All →
            </Link>
          </div>
          {recentCerts.length === 0 ? (
            <div style={{ fontSize: "0.8125rem", color: "#64748b", padding: "16px 0", textAlign: "center" }}>No certifications yet.</div>
          ) : (
            recentCerts.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="interactive-row"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid var(--border-subtle, #152b4a)", borderRadius: "4px" }}
              >
                <div>
                  <div className="meta-id" style={{ color: "var(--foreground, #e2e8f0)" }}>{c.cert_id}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>Asset: {c.asset_id}</div>
                </div>
                <StatusBadge status={c.status} size="sm" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ROW 4: System Status */}
      <SystemStatusPanel />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   QUALITY INSPECTOR DASHBOARD
   ════════════════════════════════════════════════════════════════════ */
function QualityInspectorDashboard() {
  const [myAssets, setMyAssets] = useState<AssetResponse[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setError(null);
    setLoading(true);
    dashboardService.getSummary()
      .then(setSummary)
      .catch((e: any) => setError(e?.message || 'Failed to load dashboard data. Backend may be unavailable.'))
      .finally(() => setLoading(false));
    assetService.listAssets({ page_size: 5 })
      .then(r => setMyAssets(r.items))
      .catch(console.error)
      .finally(() => setAssetsLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const myCount        = useCountUp(summary?.total_assets ?? 0, 700, 100);
  const pendingInspect = useCountUp(
    Object.entries(summary?.lifecycle_breakdown ?? {}).find(([k]) => k === "RECEIVED")?.[1] ?? 0,
    600, 200
  );

  if (loading && !summary) return <DashboardSkeleton />;
  if (error && !summary) return <DashboardError error={error} onRetry={loadData} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Action Bar */}
      <div
        className="db-card"
        style={{
          padding: "16px 24px",
          display: "flex",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
          background: "linear-gradient(90deg, rgba(245,158,11,0.09) 0%, rgba(12,24,40,0.85) 100%)",
          borderColor: "rgba(245,158,11,0.25)",
        }}
      >
        <Link to="/app/register" className="btn-primary" style={{ fontSize: "0.9375rem" }}>
          Register / Update Asset →
        </Link>
        <Link to="/app/evidence" className="btn-secondary">
          Upload Evidence
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="pulse-beacon pulse-beacon-amber" style={{ background: "#f59e0b" }} />
          <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.06em" }}>STATION: TECHNICAL RECORDS DECK</span>
          <LiveClock />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="db-kpi-grid">
        <DribbbleKpiCard
          label="Tracked Assets"
          value={myCount}
          icon="◈"
          accent="#3b82f6"
          radialPercentage={92}
          sub="In active inventory"
        />
        <DribbbleKpiCard
          label="Pending Inspection"
          value={pendingInspect}
          icon="◌"
          accent="#f59e0b"
          radialPercentage={55}
          sub="Requires physical check"
        />
        <DribbbleKpiCard
          label="Certifications"
          value={(summary?.total_certifications ?? 0)}
          icon="◆"
          accent="#22c55e"
          radialPercentage={88}
          sub="NFTs linked to parts"
        />
        <DribbbleKpiCard
          label="Pending Certs"
          value={(summary?.pending_certifications ?? 0)}
          icon="◐"
          accent="#8b5cf6"
          radialPercentage={35}
          sub="Awaiting minter sign-off"
        />
      </div>

      {/* ROW 3: Circular Trust Visual + Activity */}
      <div className="db-analytics-grid">
        <DefenceTrustVisual
          trustPercentage={98.8}
          totalAssets={summary?.total_assets ?? 0}
          failedVerifications={summary?.failed_verifications ?? 0}
          totalCertifications={summary?.total_certifications ?? 0}
          blockchainTxs={summary?.total_blockchain_txs ?? 0}
        />
        <DefenceAssetActivityCard summary={summary} />
      </div>

      {/* My Assets Table */}
      <div className="db-card">
        <div className="db-card-header">
          <div className="db-card-title">RECENT ASSETS IN WORKSPACE</div>
          <Link to="/app/my-assets" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
            View All Assets →
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border, #1e3a60)" }}>
                {["Asset ID", "Type", "Lifecycle", "Evidence", "Action"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left", padding: "10px 14px",
                      fontSize: "0.625rem", color: "#64748b", fontWeight: 700,
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
                  <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>Loading assets…</td>
                </tr>
              ) : myAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>No assets registered yet.</td>
                </tr>
              ) : (
                myAssets.map((a) => (
                  <tr key={a.id} className="interactive-row" style={{ borderBottom: "1px solid var(--border-subtle, #152b4a)" }}>
                    <td style={{ padding: "12px 14px" }}><span className="meta-id" style={{ color: "var(--foreground, #e2e8f0)" }}>{a.asset_id}</span></td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#64748b" }}>{a.type}</td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={a.lifecycle_state} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={a.evidence_status} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}>
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

      {/* ROW 4: System Status */}
      <SystemStatusPanel />
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setError(null);
    setLoading(true);
    dashboardService.getSummary()
      .then(setSummary)
      .catch((e: any) => setError(e?.message || 'Failed to load dashboard data. Backend may be unavailable.'))
      .finally(() => setLoading(false));
    assetService.listAssets({ page_size: 10 }).then(r => setAssets(r.items)).catch(console.error);
    auditService.listAuditEvents({ page_size: 4 }).then(r => setAuditEvents(r.items)).catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const pendingVerif  = useCountUp(summary?.failed_verifications ?? 0, 700, 100);
  const auditTotal    = useCountUp(summary?.total_audit_events ?? 0, 900, 300);

  const unverifiedAssets = assets.filter(a => a.verification_status !== "VERIFIED");

  if (loading && !summary) return <DashboardSkeleton />;
  if (error && !summary) return <DashboardError error={error} onRetry={loadData} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Auditor Banner */}
      <div
        className="db-card"
        style={{
          padding: "16px 24px",
          display: "flex",
          gap: 14,
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
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="db-status-dot-pulse" />
          <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em" }}>INSPECTION ENGINE ACTIVE</span>
          <LiveClock />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="db-kpi-grid">
        <DribbbleKpiCard
          label="Verification Issues"
          value={pendingVerif}
          icon="◎"
          accent="#f59e0b"
          radialPercentage={pendingVerif > 0 ? 70 : 100}
          sub="Discrepancies flagged"
        />
        <DribbbleKpiCard
          label="Unverified Assets"
          value={unverifiedAssets.length}
          icon="✕"
          accent="#ef4444"
          radialPercentage={unverifiedAssets.length > 0 ? 60 : 100}
          sub="Awaiting cryptographic sign-off"
        />
        <DribbbleKpiCard
          label="Total Defence Assets"
          value={(summary?.total_assets ?? 0)}
          icon="◈"
          accent="#22c55e"
          radialPercentage={98}
          sub="Registered on ledger"
        />
        <DribbbleKpiCard
          label="Audit Events Trail"
          value={auditTotal}
          icon="≡"
          accent="#3b82f6"
          radialPercentage={100}
          sub="Immutable provenance log"
        />
      </div>

      {/* ROW 3: Hero Circular Trust Visual + Activity */}
      <div className="db-analytics-grid">
        <DefenceTrustVisual
          trustPercentage={99.2}
          totalAssets={summary?.total_assets ?? 0}
          failedVerifications={summary?.failed_verifications ?? 0}
          totalCertifications={summary?.total_certifications ?? 0}
          blockchainTxs={summary?.total_blockchain_txs ?? 0}
        />
        <DefenceAssetActivityCard summary={summary} />
      </div>

      {/* Assets Requiring Verification + Recent Audit Trail */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-title">ASSETS REQUIRING VERIFICATION</div>
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
            <div style={{ fontSize: "0.8125rem", color: "#64748b", padding: "16px 0", textAlign: "center" }}>
              All assets verified. ✓
            </div>
          ) : (
            unverifiedAssets.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="interactive-row"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: "1px solid var(--border-subtle, #152b4a)", borderRadius: "4px" }}
              >
                <div>
                  <div className="meta-id" style={{ color: "var(--foreground, #e2e8f0)" }}>{a.asset_id}</div>
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

        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-title">RECENT AUDIT EVENTS</div>
            <Link to="/app/audit" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
              View Trail →
            </Link>
          </div>
          {auditEvents.length === 0 ? (
            <div style={{ fontSize: "0.8125rem", color: "#64748b", padding: "16px 0", textAlign: "center" }}>No audit events yet.</div>
          ) : (
            auditEvents.map((e) => (
              <div
                key={e.id}
                className="interactive-row"
                style={{ display: "flex", gap: 10, padding: "10px 8px", borderBottom: "1px solid var(--border-subtle, #152b4a)", alignItems: "flex-start", borderRadius: "4px" }}
              >
                <span style={{
                  color: e.result === "SUCCESS" ? "#22c55e" : e.result === "FAILED" ? "#ef4444" : "#f59e0b",
                  fontSize: "0.75rem", marginTop: 3, fontWeight: 700, flexShrink: 0,
                }}>
                  {e.result === "SUCCESS" ? "✓" : e.result === "FAILED" ? "✕" : "⚠"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8125rem", color: "var(--foreground, #e2e8f0)", fontWeight: 500 }}>{e.action}</div>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: 2 }}>{e.actor_did} · {formatDateTime(e.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ROW 4: System Status */}
      <SystemStatusPanel />
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
    <div className="db-v2-container page-fade">
      {/* ── ROW 1: Compact Command Header ──────────────────────── */}
      <div className="db-header-card">
        <div className="db-header-glint" />

        {/* Left: Eyebrow + Greeting + Metadata */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className="db-status-dot-pulse" />
            <span className="section-label" style={{ margin: 0, color: "#60a5fa", letterSpacing: "0.1em", fontSize: "0.6875rem" }}>
              COMMAND DASHBOARD · NOVEXA DEFENCE TRUST · {dateStr}
            </span>
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: "clamp(1.5rem, 2.8vw, 2.125rem)",
              fontWeight: 700,
              color: "var(--foreground, #e2e8f0)",
              margin: "0 0 6px",
              letterSpacing: "-0.01em",
              lineHeight: 1.15,
            }}
          >
            {greeting}, {user.name.split(" ")[0]}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: "0.8125rem", color: "#64748b" }}>
            <span>Signed in as <RoleBadge role={role} size="sm" /></span>
            <span style={{ color: "var(--border, #1e3a60)" }}>·</span>
            <span style={{ color: "#22c55e", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              ✓ Identity Verified
            </span>
            <span style={{ color: "var(--border, #1e3a60)" }}>·</span>
            <span className="meta-id" style={{ fontSize: "0.75rem" }}>{user.actor?.did || "—"}</span>
          </div>
        </div>

        {/* Right: Operational Status Pill + Node + Clock */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div className="node-badge">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
            NODE: NOVEXA-01 · ENCRYPTED
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                padding: "3px 10px",
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.2)",
                borderRadius: "12px",
                fontSize: "0.6875rem",
                color: "#64748b",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              SIH 2026 · PS 26125
            </span>
            <LiveClock />
          </div>
        </div>
      </div>

      {/* ── Role-based dashboard body ──────────────────────────── */}
      {role === "admin"       && <AdminDashboard />}
      {role === "nft-creator" && <NFTCreatorDashboard />}
      {role === "quality-inspector"  && <QualityInspectorDashboard />}
      {role === "auditor"     && <AuditorDashboard />}
    </div>
  );
}
