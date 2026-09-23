import { Link } from "react-router";
import StatusBadge from "../../components/ui/StatusBadge";
import RoleBadge from "../../components/ui/RoleBadge";
import { useState, useEffect, useRef } from "react";
import { formatDateTime } from "../../data/utils";
import { dashboardService, DashboardSummary } from "../../services/dashboard";
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

/* ── Decorative SVG Sparkline with Draw Animation ───────────────────── */
function KpiSparkline({ color = "#3b82f6", variant = 1 }: { color?: string; variant?: number }) {
  const paths: Record<number, string> = {
    1: "M 0,22 Q 18,12 36,18 T 72,6",
    2: "M 0,24 Q 18,20 36,10 T 72,4",
    3: "M 0,20 Q 20,24 40,8 T 72,5",
    4: "M 0,16 Q 22,18 44,14 T 72,8",
    5: "M 0,25 Q 15,10 35,16 T 72,3",
  };
  const pathD = paths[variant] || paths[1];

  return (
    <svg className="db-kpi-sparkline" viewBox="0 0 72 28" fill="none">
      <defs>
        <linearGradient id={`sparkGrad-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L 72,28 L 0,28 Z`} fill={`url(#sparkGrad-${variant})`} />
      <path
        d={pathD}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        className="db-sparkline-path"
      />
    </svg>
  );
}

/* ── Reference-Style KPI Card ───────────────────────────────────────── */
interface KpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
  icon: string;
  sparklineVariant?: number;
}

function KpiCard({ label, value, sub, accent = "#3b82f6", icon, sparklineVariant = 1 }: KpiCardProps) {
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
        <KpiSparkline color={accent} variant={sparklineVariant} />
      </div>

      {sub && (
        <div className="db-kpi-sub">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block", flexShrink: 0 }} />
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

/* ── Defence Hero Vector Atmosphere with Parallax & Visible Motion ──── */
interface HeroVisualProps {
  parallax: {
    bg: { x: number; y: number };
    net: { x: number; y: number };
    sat: { x: number; y: number };
    jet: { x: number; y: number };
  };
}

function DefenceHeroVisual({ parallax }: HeroVisualProps) {
  return (
    <svg className="db-hero-bg-visual" viewBox="0 0 600 200" fill="none">
      <defs>
        <radialGradient id="heroRadarGlow" cx="70%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1e3a60" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="heroLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="radarArmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
          <stop offset="100%" stopColor="rgba(56, 189, 248, 0.7)" />
        </linearGradient>
      </defs>

      {/* Background layer (Parallax 2–4px) */}
      <g transform={`translate(${parallax.bg.x}, ${parallax.bg.y})`}>
        {/* Radar concentric circular guidelines */}
        <circle cx="440" cy="100" r="140" stroke="rgba(59, 130, 246, 0.16)" strokeWidth="1" strokeDasharray="4 6" fill="url(#heroRadarGlow)" />
        <circle cx="440" cy="100" r="95" stroke="rgba(59, 130, 246, 0.22)" strokeWidth="1" />
        <circle cx="440" cy="100" r="50" stroke="rgba(14, 165, 233, 0.28)" strokeWidth="1" strokeDasharray="2 4" />

        {/* Crosshairs & Angle Lines */}
        <line x1="300" y1="100" x2="580" y2="100" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" />
        <line x1="440" y1="0" x2="440" y2="200" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" />

        {/* Continuous rotating radar sweep arm */}
        <line x1="440" y1="100" x2="575" y2="100" stroke="url(#radarArmGrad)" strokeWidth="1.5" className="db-radar-sweep-arm" />
      </g>

      {/* Network Communication Mesh Layer (Parallax 4–7px) */}
      <g transform={`translate(${parallax.net.x}, ${parallax.net.y})`}>
        {/* Network communication lines */}
        <path d="M 220,130 Q 330,70 480,45" stroke="url(#heroLineGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M 220,130 Q 330,150 440,100" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />

        {/* Data Stream traveling between command nodes */}
        <path d="M 220,130 Q 330,70 480,45" stroke="#38bdf8" strokeWidth="2" fill="none" className="db-data-stream-1" />
        <path d="M 220,130 Q 330,150 440,100" stroke="#22c55e" strokeWidth="1.8" fill="none" className="db-data-stream-3" />

        {/* Telemetry nodes with varied breathing rates */}
        <g transform="translate(220, 130)">
          <circle cx="0" cy="0" r="8" fill="none" stroke="#38bdf8" strokeWidth="1" className="db-node-pulse-1" />
          <circle cx="0" cy="0" r="3.5" fill="#38bdf8" />
        </g>
        <g transform="translate(440, 100)">
          <circle cx="0" cy="0" r="10" fill="none" stroke="#22c55e" strokeWidth="1" className="db-node-pulse-2" />
          <circle cx="0" cy="0" r="4.5" fill="#22c55e" />
        </g>
      </g>

      {/* Naval Ship Patrol Layer (Continuous motion + wake) */}
      <g className="db-anim-naval">
        <g opacity="0.85">
          {/* Waterline wake ripples */}
          <ellipse cx="0" cy="8" rx="24" ry="3" fill="none" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1" className="db-naval-wake" />
          {/* Ship hull */}
          <path d="M -20,4 L 20,4 L 14,-4 L -12,-4 Z" fill="rgba(24, 48, 80, 0.85)" stroke="#38bdf8" strokeWidth="1" />
          {/* Bridge tower & mast */}
          <rect x="-4" y="-9" width="8" height="5" fill="#3b82f6" />
          <line x1="0" y1="-9" x2="0" y2="-13" stroke="#60a5fa" strokeWidth="1" />
          <circle cx="0" cy="-13" r="1.5" fill="#22c55e" />
        </g>
      </g>

      {/* Defence Satellite Layer (Parallax 8–12px + 26s Orbit Motion) */}
      <g transform={`translate(${parallax.sat.x}, ${parallax.sat.y})`}>
        <g className="db-anim-satellite">
          {/* Signal beam down to ground radar node */}
          <line x1="0" y1="0" x2="-45" y2="60" stroke="#38bdf8" strokeDasharray="3 4" className="db-satellite-beam" />
          {/* Satellite body */}
          <rect x="-9" y="-5" width="18" height="10" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          {/* Solar array wings */}
          <rect x="-28" y="-4" width="15" height="8" rx="1" fill="rgba(56,189,248,0.6)" stroke="#38bdf8" strokeWidth="0.8" />
          <line x1="-20" y1="-4" x2="-20" y2="4" stroke="#0369a1" strokeWidth="0.8" />
          <rect x="13" y="-4" width="15" height="8" rx="1" fill="rgba(56,189,248,0.6)" stroke="#38bdf8" strokeWidth="0.8" />
          <line x1="21" y1="-4" x2="21" y2="4" stroke="#0369a1" strokeWidth="0.8" />
          {/* Optical lens */}
          <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
          <circle cx="0" cy="0" r="4.5" fill="none" stroke="#22c55e" strokeWidth="0.8" />
        </g>
      </g>

      {/* Stealth Fighter Aircraft Layer (Parallax 10–14px + 20s Flight Path) */}
      <g transform={`translate(${parallax.jet.x}, ${parallax.jet.y})`}>
        <g className="db-anim-fighter">
          {/* Engine exhaust plume */}
          <line x1="-22" y1="0" x2="-6" y2="0" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" className="db-fighter-trail" />
          <line x1="-32" y1="0" x2="-20" y2="0" stroke="rgba(56,189,248,0.3)" strokeWidth="1" strokeDasharray="2 3" />
          {/* Aircraft fuselage & swept wings */}
          <path
            d="M 22,0 L 4,-6 L -8,-14 L -4,-3 L -12,0 L -4,3 L -8,14 L 4,6 Z"
            fill="#38bdf8"
            stroke="#93c5fd"
            strokeWidth="0.8"
            opacity="0.95"
          />
        </g>
      </g>
    </svg>
  );
}

/* ── Circular Trust Visualization (Concentric Rotating Telemetry) ───── */
function DefenceTrustVisual({
  trustPercentage = 99.4,
  totalCertifications = 0,
  failedVerifications = 0,
  blockchainTxs = 0,
}: {
  trustPercentage?: number;
  totalAssets: number;
  failedVerifications: number;
  totalCertifications: number;
  blockchainTxs: number;
}) {
  const radius = 94;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, trustPercentage));
  const offset = circ - (circ * clamped) / 100;

  return (
    <div className="db-v4-card db-trust-card">
      <div className="db-card-header">
        <div>
          <div className="db-card-title">DEFENCE TRUST STATUS</div>
          <div className="db-card-subtitle">
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
          <svg className="db-orbital-svg" viewBox="0 0 290 290">
            <defs>
              <linearGradient id="trustGradientV4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="45%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <radialGradient id="centerGlowV4" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.2)" />
                <stop offset="60%" stopColor="rgba(37, 99, 235, 0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Ambient center background glow */}
            <circle cx="145" cy="145" r="90" fill="url(#centerGlowV4)" />

            {/* Periodic Expanding Shockwave Ring (3.5s) */}
            <circle
              cx="145"
              cy="145"
              r="105"
              stroke="#38bdf8"
              fill="none"
              className="db-orbit-pulse-ring"
            />

            {/* Static outer guideline */}
            <circle cx="145" cy="145" r="132" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" fill="none" />

            {/* Outer rotating dashed orbit ring (Clockwise 30s) */}
            <g className="db-orbit-outer">
              <circle
                cx="145"
                cy="145"
                r="120"
                stroke="rgba(96, 165, 250, 0.45)"
                strokeWidth="1.5"
                strokeDasharray="5 8"
                fill="none"
              />
              <circle cx="145" cy="25" r="3.5" fill="#60a5fa" />
              <circle cx="265" cy="145" r="3" fill="#38bdf8" />
              <circle cx="25" cy="145" r="3" fill="#38bdf8" />
              <circle cx="145" cy="265" r="2.5" fill="#22c55e" />
            </g>

            {/* Progress Arc background track */}
            <circle
              cx="145"
              cy="145"
              r={radius}
              stroke="var(--border-subtle, #172d4c)"
              strokeWidth="9"
              fill="none"
            />

            {/* Active Progress Arc */}
            <circle
              cx="145"
              cy="145"
              r={radius}
              stroke="url(#trustGradientV4)"
              strokeWidth="9"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 145 145)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />

            {/* Traveling node on outer orbit (12s Continuous Orbit) */}
            <g className="db-orbit-traveler">
              <circle cx="145" cy="25" r="5" fill="#22c55e" style={{ filter: "drop-shadow(0 0 6px #22c55e)" }} />
            </g>

            {/* Inner counter-rotating ring (Counter-Clockwise 22s) */}
            <g className="db-orbit-inner">
              <circle
                cx="145"
                cy="145"
                r="72"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="1"
                strokeDasharray="3 6"
                fill="none"
              />
              <circle cx="145" cy="73" r="2.5" fill="#93c5fd" />
              <circle cx="217" cy="145" r="2.5" fill="#93c5fd" />
            </g>
          </svg>

          {/* Central Text Value Overlay with Breathing Glow */}
          <div className="db-orbital-center">
            <span className="db-trust-score">{clamped}%</span>
            <span className="db-trust-score-label">TRUST INTEGRITY</span>
          </div>
        </div>
      </div>

      {/* 4-Item Telemetry Matrix */}
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
              {totalCertifications > 0 ? `${totalCertifications} On-Chain Minted` : "Minter Ready"}
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
              {blockchainTxs > 0 ? `${blockchainTxs} Proof TXs Anchored` : "Chain Synchronized"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Lifecycle Analytics & Stacked Bar Chart with Interactive Hover ─── */
function DefenceAssetActivityCard({ summary }: { summary: DashboardSummary | null }) {
  const breakdown = summary?.lifecycle_breakdown ?? {};
  const total = summary?.total_assets ?? 0;
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const stages = [
    { key: "ACCEPTED_FOR_ASSEMBLY", label: "Accepted for Assembly", color: "#22c55e", desc: "Production Ready" },
    { key: "INSPECTION_RECORDED", label: "Inspection Recorded", color: "#3b82f6", desc: "Verified Quality" },
    { key: "RECEIVED", label: "Received at Depot", color: "#f59e0b", desc: "Awaiting Inspection" },
    { key: "SUPPLIER_DECLARED", label: "Supplier Declared", color: "#8b5cf6", desc: "In-Transit / Origin" },
    { key: "UNREGISTERED", label: "Unregistered Intake", color: "#64748b", desc: "Initial Ingestion" },
    { key: "REJECTED_QUARANTINED", label: "Quarantined / Rejected", color: "#ef4444", desc: "Safety Isolation" },
  ];

  return (
    <div className="db-v4-card">
      <div className="db-card-header">
        <div>
          <div className="db-card-title">DEFENCE ASSET ACTIVITY & LIFECYCLE</div>
          <div className="db-card-subtitle">
            Real-time pipeline distribution across procurement, verification, and assembly
          </div>
        </div>
        <Link to="/app/assets" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
          View Asset Registry →
        </Link>
      </div>

      {/* Top 3 High-Level Metrics */}
      <div className="db-pipeline-overview">
        <div className="db-pipeline-stat" style={{ background: "rgba(37,99,235,0.06)", borderColor: "rgba(37,99,235,0.18)" }}>
          <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>TOTAL ASSETS</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground, #e2e8f0)", marginTop: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>{total}</div>
        </div>
        <div className="db-pipeline-stat" style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.18)" }}>
          <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>ASSEMBLY CLEARED</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e", marginTop: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {breakdown["ACCEPTED_FOR_ASSEMBLY"] ?? 0}
          </div>
        </div>
        <div className="db-pipeline-stat" style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.18)" }}>
          <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>INSPECTION QUEUE</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b", marginTop: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {breakdown["RECEIVED"] ?? 0}
          </div>
        </div>
      </div>

      {/* Stacked Bar with Interactive Hover Focus */}
      <div className="db-stacked-chart-container">
        <div className="db-stacked-bar">
          {stages.map((st) => {
            const count = breakdown[st.key] ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            if (pct <= 0) return null;
            const isHovered = hoveredStage === st.key;
            const isAnyHovered = hoveredStage !== null;
            return (
              <div
                key={st.key}
                className="db-stacked-segment"
                onMouseEnter={() => setHoveredStage(st.key)}
                onMouseLeave={() => setHoveredStage(null)}
                style={{
                  width: `${pct}%`,
                  background: st.color,
                  opacity: isAnyHovered && !isHovered ? 0.45 : 1,
                  filter: isHovered ? `drop-shadow(0 0 8px ${st.color})` : "none",
                }}
                title={`${st.label}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Individual Stage Breakdown */}
      <div className="db-lifecycle-list">
        {stages.map((st) => {
          const count = breakdown[st.key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isHovered = hoveredStage === st.key;
          return (
            <div
              key={st.key}
              className="db-lifecycle-item"
              onMouseEnter={() => setHoveredStage(st.key)}
              onMouseLeave={() => setHoveredStage(null)}
              style={{
                background: isHovered ? "rgba(30, 58, 96, 0.25)" : undefined,
              }}
            >
              <div className="db-lifecycle-meta">
                <div className="db-lifecycle-name">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: st.color, display: "inline-block", flexShrink: 0 }} />
                  <span>{st.label}</span>
                  <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>({st.desc})</span>
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
                    boxShadow: isHovered ? `0 0 10px ${st.color}` : pct > 0 ? `0 0 6px ${st.color}40` : "none",
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

/* ── Live Activity Feed with Animated Flow ──────────────────────────── */
function LiveActivityFeed({ auditEvents }: { auditEvents: AuditEventResponse[] }) {
  return (
    <div className="db-v4-card">
      <div className="db-card-header">
        <div>
          <div className="db-card-title">LIVE ACTIVITY FEED</div>
          <div className="db-card-subtitle">
            Cryptographically audited events with DID signatures
          </div>
        </div>
        <Link to="/app/system-activity" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
          View Full Activity →
        </Link>
      </div>

      {auditEvents.length > 0 ? (
        <div className="db-activity-feed">
          {/* Vertical timeline line with traveling light flow */}
          <div className="db-activity-timeline-line">
            <div className="db-activity-timeline-pulse" />
          </div>

          {auditEvents.slice(0, 5).map((e) => {
            const isSuccess = e.result === "SUCCESS";
            const nodeColor = isSuccess ? "#22c55e" : e.result === "FAILED" ? "#ef4444" : "#f59e0b";
            return (
              <div key={e.id} className="db-activity-item">
                <div className="db-activity-node" style={{ borderColor: nodeColor, color: nodeColor }} />
                <div className="db-activity-content">
                  <div className="db-activity-title">{e.action}</div>
                  <div className="db-activity-meta">
                    <span className="meta-id">{e.resource_id || e.resource_type || "SYSTEM"}</span>
                    <span>·</span>
                    <span>{e.actor_name || e.actor_role || e.actor_did}</span>
                    <span>·</span>
                    <span>{formatDateTime(e.timestamp)}</span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: 600,
                    background: `${nodeColor}15`,
                    color: nodeColor,
                    border: `1px solid ${nodeColor}30`,
                    flexShrink: 0,
                  }}
                >
                  {e.result}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ color: "#64748b", fontSize: "0.875rem", textAlign: "center", padding: "36px 0" }}>
          No audit events recorded yet.
        </div>
      )}
    </div>
  );
}

/* ── Global Defence Network Card with Traveling Mesh Packets ────────── */
function GlobalDefenceNetworkCard() {
  const nodes = [
    { city: "New Delhi", label: "Strategic HQ", x: 420, y: 85, color: "#38bdf8", pulseClass: "db-node-pulse-1" },
    { city: "Bengaluru", label: "BEL Defence Complex", x: 415, y: 145, color: "#22c55e", pulseClass: "db-node-pulse-2" },
    { city: "Mumbai", label: "Naval Command Deck", x: 385, y: 118, color: "#3b82f6", pulseClass: "db-node-pulse-3" },
    { city: "Hyderabad", label: "Avionics Research Node", x: 425, y: 124, color: "#8b5cf6", pulseClass: "db-node-pulse-4" },
    { city: "Kolkata", label: "Eastern Fleet Depot", x: 470, y: 105, color: "#f59e0b", pulseClass: "db-node-pulse-5" },
  ];

  return (
    <div className="db-v4-card db-network-card">
      <div className="db-card-header" style={{ marginBottom: 12 }}>
        <div>
          <div className="db-card-title" style={{ color: "#38bdf8" }}>GLOBAL DEFENCE NETWORK</div>
          <div className="db-card-subtitle">
            Real-time encrypted mesh telemetry & distributed ledger synchronization
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="db-status-dot-pulse" />
          <span style={{ fontSize: "0.7rem", color: "#38bdf8", fontWeight: 700, letterSpacing: "0.08em" }}>
            MESH ACTIVE
          </span>
        </div>
      </div>

      <div className="db-network-map-wrapper">
        <svg className="db-network-svg" viewBox="0 0 600 230" fill="none">
          <defs>
            <radialGradient id="netGlobeGlowV4" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a60" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#08131f" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid Lat/Long Lines */}
          <ellipse cx="300" cy="115" rx="270" ry="95" stroke="rgba(30, 58, 96, 0.45)" strokeWidth="1" strokeDasharray="3 6" fill="url(#netGlobeGlowV4)" />
          <ellipse cx="300" cy="115" rx="190" ry="70" stroke="rgba(30, 58, 96, 0.35)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="30" y1="115" x2="570" y2="115" stroke="rgba(30, 58, 96, 0.35)" strokeWidth="1" />

          {/* India Regional Highlight Boundary Arc with Pulsing Glow */}
          <path
            d="M 370,60 Q 425,75 480,95 Q 430,175 415,175 Q 370,125 370,60 Z"
            fill="rgba(56, 189, 248, 0.06)"
            stroke="rgba(56, 189, 248, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Static Mesh Guidelines between defence nodes */}
          <path d="M 420,85 L 385,118 L 415,145 L 425,124 L 470,105 L 420,85 Z" stroke="rgba(59, 130, 246, 0.35)" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 420,85 L 415,145" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1" />

          {/* Traveling Data Packets along the Mesh Paths */}
          <path d="M 420,85 L 385,118 L 415,145" stroke="#38bdf8" strokeWidth="2" fill="none" className="db-data-stream-1" />
          <path d="M 415,145 L 425,124 L 470,105" stroke="#22c55e" strokeWidth="2" fill="none" className="db-data-stream-2" />
          <path d="M 470,105 L 420,85" stroke="#f59e0b" strokeWidth="1.8" fill="none" className="db-data-stream-3" />

          {/* Defense Nodes with Staggered Breathing Pulses */}
          {nodes.map((n) => (
            <g key={n.city} transform={`translate(${n.x}, ${n.y})`}>
              <circle cx="0" cy="0" r="10" fill="none" stroke={n.color} strokeWidth="1" className={n.pulseClass} />
              <circle cx="0" cy="0" r="4.5" fill={n.color} />
              <text x="8" y="3" fill="#cbd5e1" fontSize="9" fontWeight="600" letterSpacing="0.04em">
                {n.city}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Network Live Telemetry Indicators */}
      <div className="db-network-stats">
        <div className="db-network-stat-box">
          <div style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 700 }}>ACTIVE NODES</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#22c55e", marginTop: 2 }}>5/5 Operational</div>
        </div>
        <div className="db-network-stat-box">
          <div style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 700 }}>ENCRYPTION</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#38bdf8", marginTop: 2 }}>Kyber-1024 PQC</div>
        </div>
        <div className="db-network-stat-box">
          <div style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 700 }}>LEDGER UPTIME</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>99.99%</div>
        </div>
        <div className="db-network-stat-box">
          <div style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 700 }}>CONSENSUS</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#8b5cf6", marginTop: 2 }}>Proof of Trust</div>
        </div>
      </div>
    </div>
  );
}

/* ── Recent Certifications Section ──────────────────────────────────── */
function RecentCertificationsSection({ certifications }: { certifications: CertificationResponse[] }) {
  return (
    <div className="db-v4-card">
      <div className="db-card-header">
        <div>
          <div className="db-card-title">RECENT CERTIFICATIONS</div>
          <div className="db-card-subtitle">
            Non-transferable on-chain digital asset passports
          </div>
        </div>
        <Link to="/app/certifications" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
          View Certifications →
        </Link>
      </div>

      {certifications.length === 0 ? (
        <div style={{ fontSize: "0.8125rem", color: "#64748b", padding: "28px 0", textAlign: "center" }}>
          No certifications minted yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {certifications.slice(0, 4).map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                background: "rgba(30, 58, 96, 0.15)",
                border: "1px solid var(--border-subtle, #172d4c)",
                borderRadius: "8px",
                transition: "border-color 0.2s ease, transform 0.2s ease",
              }}
            >
              <div>
                <div className="meta-id" style={{ color: "var(--foreground, #e2e8f0)", fontWeight: 600 }}>{c.cert_id}</div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>Asset ID: {c.asset_id}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <StatusBadge status={c.status} size="sm" />
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  {formatDateTime(c.issued_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Defence Promotional / Trust Banner ─────────────────────────────── */
function DefenceTrustBanner() {
  return (
    <div className="db-promo-banner">
      <div style={{ zIndex: 1, maxWidth: 500 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: "1.1rem", color: "#38bdf8" }}>🛡</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", color: "#38bdf8", textTransform: "uppercase" }}>
            NATIONAL DEFENCE ASSET LEDGER
          </span>
        </div>
        <h3
          className="font-display"
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            margin: "0 0 8px",
            color: "var(--foreground, #e2e8f0)",
            letterSpacing: "0.02em",
          }}
        >
          BUILDING A SECURE TOMORROW
        </h3>
        <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: "0 0 16px", lineHeight: 1.5 }}>
          Blockchain • Transparency • Cryptographic Verification. Ensuring complete asset provenance across all defence supply chains.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/app/verification" className="btn-primary" style={{ fontSize: "0.8125rem", padding: "6px 16px" }}>
            Verification Center →
          </Link>
          <Link to="/app/blockchain" className="btn-secondary" style={{ fontSize: "0.8125rem", padding: "6px 16px" }}>
            Audit Telemetry
          </Link>
        </div>
      </div>

      <svg className="db-promo-graphic" viewBox="0 0 300 160" fill="none">
        <circle cx="200" cy="80" r="70" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeDasharray="4 6" />
        <circle cx="200" cy="80" r="45" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
        <polygon points="200,30 250,60 250,110 200,130 150,110 150,60" stroke="rgba(37,99,235,0.4)" strokeWidth="1.5" fill="rgba(37,99,235,0.05)" />
        <circle cx="200" cy="80" r="6" fill="#38bdf8" />
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMMAND CENTER PAGE COMPONENT
   ════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, role } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEventResponse[]>([]);
  const [certifications, setCertifications] = useState<CertificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Mouse Parallax Coordinates for Decorative Elements Only ─── */
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setMouseOffset({ x: dx, y: dy });
  };

  const handleHeroMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const parallax = {
    bg: { x: mouseOffset.x * 3, y: mouseOffset.y * 2 },
    net: { x: mouseOffset.x * 6, y: mouseOffset.y * 4 },
    sat: { x: mouseOffset.x * 10, y: mouseOffset.y * 7 },
    jet: { x: mouseOffset.x * 13, y: mouseOffset.y * 9 },
  };

  const loadData = () => {
    setError(null);
    setLoading(true);
    dashboardService.getSummary()
      .then(setSummary)
      .catch((e: any) => setError(e?.message || 'Failed to load dashboard data. Backend may be unavailable.'))
      .finally(() => setLoading(false));

    auditService.listAuditEvents({ page_size: 5 })
      .then(r => setAuditEvents(r.items || []))
      .catch(console.error);

    certificationService.listCertifications({ page_size: 5 })
      .then(r => setCertifications(r.items || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAssets   = useCountUp(summary?.total_assets ?? 0, 800, 100);
  const activeUsers   = useCountUp(summary?.active_users ?? 0, 700, 180);
  const totalCerts    = useCountUp(summary?.total_certifications ?? 0, 750, 260);
  const failedVerif   = useCountUp(summary?.failed_verifications ?? 0, 600, 340);
  const blockchainTxs = useCountUp(summary?.total_blockchain_txs ?? 0, 900, 420);

  if (!user || !role) return null;

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const dateStr = new Date()
    .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  const total = summary?.total_assets || 1;
  const issues = summary?.failed_verifications || 0;
  const trustScore = Math.max(90, Math.round(((total - issues) / total) * 100 * 10) / 10);

  return (
    <div className="db-v4-container page-fade">
      {/* ── ROW 1: Command / Greeting Hero Panel with Parallax ───── */}
      <div
        className="db-hero-card"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <DefenceHeroVisual parallax={parallax} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className="db-status-dot-pulse" />
            <span style={{ color: "#38bdf8", letterSpacing: "0.1em", fontSize: "0.7rem", fontWeight: 700 }}>
              COMMAND DASHBOARD · NOVEXA DEFENCE TRUST · {dateStr}
            </span>
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem, 2.8vw, 2.25rem)",
              fontWeight: 700,
              color: "var(--foreground, #e2e8f0)",
              margin: "0 0 6px",
              letterSpacing: "-0.01em",
              lineHeight: 1.15,
            }}
          >
            {greeting}, {user.name.split(" ")[0]} 👋
          </h1>

          <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: "0 0 12px", lineHeight: 1.4 }}>
            Command your defence ecosystem with trusted, tamper-proof cryptographic intelligence.
          </p>

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

        {/* Right Status Pill & Clock */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <div className="node-badge" style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 6px #22c55e" }} />
            NODE: NOVEXA-01 · ENCRYPTED · LIVE
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                padding: "3px 10px",
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.25)",
                borderRadius: "12px",
                fontSize: "0.6875rem",
                color: "#94a3b8",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              DEFENCE TRUST CHAIN
            </span>
            <LiveClock />
          </div>
        </div>
      </div>

      {/* ── ROW 2: 5 KPI Metric Cards ────────────────────────────── */}
      <div className="db-kpi-grid">
        <KpiCard
          label="Total Defence Assets"
          value={totalAssets}
          icon="◈"
          accent="#3b82f6"
          sparklineVariant={1}
          sub="Cryptographically registered"
        />
        <KpiCard
          label="Active Personnel"
          value={activeUsers}
          icon="◉"
          accent="#06b6d4"
          sparklineVariant={2}
          sub={`${summary?.pending_users ?? 0} pending onboarding`}
        />
        <KpiCard
          label="NFT Certifications"
          value={totalCerts}
          icon="◆"
          accent="#22c55e"
          sparklineVariant={3}
          sub={`${summary?.pending_certifications ?? 0} pending mint`}
        />
        <KpiCard
          label="Verification Alerts"
          value={failedVerif}
          icon="⚠"
          accent={failedVerif > 0 ? "#f59e0b" : "#22c55e"}
          sparklineVariant={4}
          sub={failedVerif === 0 ? "Zero anomalies detected" : "Requires review"}
        />
        <KpiCard
          label="Blockchain TXs"
          value={blockchainTxs}
          icon="⬡"
          accent="#8b5cf6"
          sparklineVariant={5}
          sub="On-chain immutable anchor"
        />
      </div>

      {/* ── ROW 3: Defence Trust Status + Asset Activity & Lifecycle ── */}
      <div className="db-two-col-grid">
        <DefenceTrustVisual
          trustPercentage={trustScore}
          totalAssets={summary?.total_assets ?? 0}
          failedVerifications={summary?.failed_verifications ?? 0}
          totalCertifications={summary?.total_certifications ?? 0}
          blockchainTxs={summary?.total_blockchain_txs ?? 0}
        />
        <DefenceAssetActivityCard summary={summary} />
      </div>

      {/* ── ROW 4: Live Activity Feed + Global Defence Network ───── */}
      <div className="db-two-col-grid">
        <LiveActivityFeed auditEvents={auditEvents} />
        <GlobalDefenceNetworkCard />
      </div>

      {/* ── ROW 5: Recent Certifications + Defence Trust Banner ──── */}
      <div className="db-bottom-grid">
        <RecentCertificationsSection certifications={certifications} />
        <DefenceTrustBanner />
      </div>
    </div>
  );
}
