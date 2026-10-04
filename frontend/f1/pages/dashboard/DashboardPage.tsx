import { Link } from "react-router";
import StatusBadge from "../../components/ui/StatusBadge";
import { useState, useEffect, useRef } from "react";
import { formatDateTime } from "../../data/utils";
import { dashboardService, DashboardSummary } from "../../services/dashboard";
import { certificationService, CertificationResponse } from "../../services/certifications";
import { auditService, AuditEventResponse } from "../../services/audit";
import BelIconMark from "../../components/ui/BelIconMark";
import { DEMO_DASHBOARD_SUMMARY, DEMO_AUDIT_EVENTS, DEMO_CERTIFICATIONS } from "./dashboardDemoData";
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
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#64748b", letterSpacing: "0.05em" }}>
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

            <circle cx="145" cy="145" r="90" fill="url(#centerGlowV4)" />
            <circle cx="145" cy="145" r="105" stroke="#38bdf8" fill="none" className="db-orbit-pulse-ring" />
            <circle cx="145" cy="145" r="132" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" fill="none" />

            <g className="db-orbit-outer">
              <circle cx="145" cy="145" r="120" stroke="rgba(96, 165, 250, 0.45)" strokeWidth="1.5" strokeDasharray="5 8" fill="none" />
              <circle cx="145" cy="25" r="3.5" fill="#60a5fa" />
              <circle cx="265" cy="145" r="3" fill="#38bdf8" />
              <circle cx="25" cy="145" r="3" fill="#38bdf8" />
              <circle cx="145" cy="265" r="2.5" fill="#22c55e" />
            </g>

            <circle cx="145" cy="145" r={radius} stroke="var(--border-subtle, #172d4c)" strokeWidth="9" fill="none" />
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

            <g className="db-orbit-traveler">
              <circle cx="145" cy="25" r="5" fill="#22c55e" style={{ filter: "drop-shadow(0 0 6px #22c55e)" }} />
            </g>

            <g className="db-orbit-inner">
              <circle cx="145" cy="145" r="72" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1" strokeDasharray="3 6" fill="none" />
              <circle cx="145" cy="73" r="2.5" fill="#93c5fd" />
              <circle cx="217" cy="145" r="2.5" fill="#93c5fd" />
            </g>
          </svg>

          <div className="db-orbital-center">
            <span className="db-trust-score">{clamped}%</span>
            <span className="db-trust-score-label">TRUST INTEGRITY</span>
          </div>
        </div>
      </div>

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
          Explore Registry →
        </Link>
      </div>

      <div className="db-lifecycle-bars">
        {stages.map((s) => {
          const count = breakdown[s.key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={s.key} className="db-lifecycle-row">
              <div className="db-lifecycle-meta">
                <span className="db-lifecycle-label">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                  {s.label}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: s.color }}>
                  {count} <span style={{ color: "#64748b", fontWeight: 500 }}>({pct}%)</span>
                </span>
              </div>
              <div className="db-lifecycle-track">
                <div
                  className="db-lifecycle-fill"
                  style={{
                    width: `${Math.max(pct, count > 0 ? 5 : 0)}%`,
                    background: s.color,
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

/* ── Live Activity Feed ─────────────────────────────────────────────── */
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
          <div className="db-activity-timeline-line">
            <div className="db-activity-timeline-pulse" />
          </div>

          {auditEvents.slice(0, 5).map((e) => {
            const isSuccess = e.result === "SUCCESS";
            const nodeColor = isSuccess ? "#22c55e" : e.result === "FAILED" ? "#ef4444" : "#f59e0b";
            return (
              <div key={e.id} className="db-activity-item">
                <div className="db-activity-node" style={{ borderColor: nodeColor }} />
                <div className="db-activity-content">
                  <div className="db-activity-title">{e.action}</div>
                  <div className="db-activity-meta">
                    <span className="meta-id">{e.resource_id || e.resource_type || "SYSTEM"}</span>
                    <span>·</span>
                    <span>{e.actor_role || e.actor_did}</span>
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

/* ── Indian Tricolour Flag Pill with 24-Spoke Ashoka Chakra ─────────── */
function IndianTricolourPill() {
  return (
    <div className="db-tricolour-pill" title="Republic of India • Bharat">
      <div className="db-tricolour-stripe stripe-saffron" />
      <div className="db-tricolour-stripe stripe-white">
        <div className="db-ashoka-chakra" />
      </div>
      <div className="db-tricolour-stripe stripe-green" />
    </div>
  );
}

/* ── BEL Defence Network Card with Subtle Indian Tricolour Accent ── */
function GlobalDefenceNetworkCard() {
  const [hoveredNode, setHoveredNode] = useState<{ city: string; label: string; x: number; y: number; color: string } | null>(null);

  const nodes = [
    { city: "New Delhi", label: "Strategic HQ", x: 420, y: 85, color: "#38bdf8", delay: "0s" },
    { city: "Bengaluru", label: "BEL Defence Complex", x: 415, y: 145, color: "#22c55e", delay: "1.4s" },
    { city: "Mumbai", label: "Naval Command Deck", x: 385, y: 118, color: "#3b82f6", delay: "0.7s" },
    { city: "Hyderabad", label: "Avionics Research Node", x: 425, y: 124, color: "#8b5cf6", delay: "2.1s" },
    { city: "Kolkata", label: "Eastern Fleet Depot", x: 470, y: 105, color: "#f59e0b", delay: "2.8s" },
  ];

  return (
    <div className="db-v4-card db-network-card">
      <div className="db-card-header" style={{ marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="db-card-title" style={{ color: "#38bdf8" }}>BEL DEFENCE NETWORK</div>
            <IndianTricolourPill />
          </div>
          <div className="db-card-subtitle">
            Real-time encrypted mesh telemetry & distributed ledger synchronization
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="db-mesh-active-dot" />
          <span className="db-mesh-active-text">
            MESH ACTIVE
          </span>
        </div>
      </div>

      <div className="db-network-map-wrapper">
        <svg className="db-network-svg" viewBox="0 0 600 220" fill="none">
          <defs>
            <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="centralPulseGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Radar background circles */}
          <ellipse cx="300" cy="110" rx="270" ry="95" stroke="rgba(30, 58, 96, 0.45)" strokeWidth="1" strokeDasharray="3 6" fill="rgba(6, 16, 32, 0.4)" className="db-radar-outer-ring" />
          <ellipse cx="300" cy="110" rx="190" ry="70" stroke="rgba(30, 58, 96, 0.35)" strokeWidth="1" strokeDasharray="4 4" className="db-radar-inner-ring" />
          <line x1="30" y1="110" x2="570" y2="110" stroke="rgba(30, 58, 96, 0.35)" strokeWidth="1" />

          {/* Central expanding signal waves */}
          <circle cx="420" cy="115" className="db-network-central-pulse db-pulse-wave-1" />
          <circle cx="420" cy="115" className="db-network-central-pulse db-pulse-wave-2" />

          {/* India Regional Highlight Boundary */}
          <path
            d="M 370,55 Q 425,70 480,90 Q 430,170 415,170 Q 370,120 370,55 Z"
            fill="rgba(56, 189, 248, 0.08)"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="db-india-boundary"
          />

          {/* Base Connection Mesh */}
          <path d="M 420,85 L 385,118 L 415,145 L 425,124 L 470,105 L 420,85 Z" stroke="rgba(59, 130, 246, 0.35)" strokeWidth="1.2" strokeDasharray="3 3" className="db-network-mesh-base" />
          <path d="M 385,118 L 425,124 M 420,85 L 425,124" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1" strokeDasharray="2 3" />

          {/* Active Telemetry Connection Streams */}
          <path d="M 420,85 L 385,118 L 415,145" stroke="#38bdf8" strokeWidth="2" fill="none" className="db-data-stream-1" />
          <path d="M 415,145 L 425,124 L 470,105" stroke="#22c55e" strokeWidth="2" fill="none" className="db-data-stream-2" />
          <path d="M 470,105 L 420,85" stroke="#3b82f6" strokeWidth="1.8" fill="none" className="db-data-stream-3" />

          {/* Travelling Data Packets (Smooth native animateMotion) */}
          <g className="db-packet-stream">
            {/* Packet 1: Delhi -> Mumbai -> Bengaluru -> Delhi */}
            <circle r="3" fill="#00e5ff" filter="url(#packetGlow)">
              <animateMotion dur="4.5s" repeatCount="indefinite" path="M 420,85 L 385,118 L 415,145 L 385,118 L 420,85" />
            </circle>
            <circle r="1.5" fill="#ffffff">
              <animateMotion dur="4.5s" repeatCount="indefinite" path="M 420,85 L 385,118 L 415,145 L 385,118 L 420,85" />
            </circle>

            {/* Packet 2: Bengaluru -> Hyderabad -> Kolkata -> Delhi */}
            <circle r="3" fill="#22c55e" filter="url(#packetGlow)">
              <animateMotion dur="5.5s" begin="1.8s" repeatCount="indefinite" path="M 415,145 L 425,124 L 470,105 L 420,85 L 415,145" />
            </circle>
            <circle r="1.5" fill="#ffffff">
              <animateMotion dur="5.5s" begin="1.8s" repeatCount="indefinite" path="M 415,145 L 425,124 L 470,105 L 420,85 L 415,145" />
            </circle>

            {/* Packet 3: Cross-Telemetry Mumbai -> Hyderabad -> Delhi */}
            <circle r="2.5" fill="#38bdf8" filter="url(#packetGlow)">
              <animateMotion dur="3.8s" begin="3s" repeatCount="indefinite" path="M 385,118 L 425,124 L 420,85" />
            </circle>
          </g>

          {/* Network Nodes */}
          {nodes.map((n) => {
            const isHovered = hoveredNode?.city === n.city;
            return (
              <g
                key={n.city}
                transform={`translate(${n.x}, ${n.y})`}
                onMouseEnter={() => setHoveredNode(n)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: "pointer" }}
                className="db-node-group"
              >
                {/* Gentle Pulsing Halo */}
                <circle
                  cx="0"
                  cy="0"
                  r="10"
                  fill="none"
                  stroke={n.color}
                  strokeWidth="1.2"
                  className="db-node-pulse-ring"
                  style={{ animationDelay: n.delay }}
                />
                {/* Secondary Ripple on Hover or Pulse */}
                <circle
                  cx="0"
                  cy="0"
                  r={isHovered ? 13 : 7}
                  fill="none"
                  stroke={n.color}
                  strokeWidth={isHovered ? 1.5 : 0.8}
                  opacity={isHovered ? 0.8 : 0.4}
                  style={{ transition: "all 0.25s ease" }}
                />
                {/* Solid Core Dot */}
                <circle
                  cx="0"
                  cy="0"
                  r={isHovered ? 5.5 : 4.5}
                  fill={n.color}
                  className="db-node-core"
                  style={{
                    animationDelay: n.delay,
                    filter: isHovered ? `drop-shadow(0 0 6px ${n.color})` : "none",
                    transition: "all 0.2s ease",
                  }}
                />
                <text
                  x="11"
                  y="3.5"
                  className="db-network-node-text"
                  fontSize="9.5"
                  letterSpacing="0.04em"
                  style={{
                    fontWeight: isHovered ? 700 : 600,
                    filter: isHovered ? `drop-shadow(0 0 4px ${n.color})` : "none",
                  }}
                >
                  {n.city}
                </text>
              </g>
            );
          })}

          {/* Interactive Tactical Tooltip on Node Hover */}
          {hoveredNode && (
            <g transform={`translate(${hoveredNode.x}, ${hoveredNode.y - 18})`} className="db-node-tooltip-bubble">
              <rect x="-65" y="-15" width="130" height="17" rx="4" className="db-node-tooltip-bg" />
              <text x="0" y="-3.5" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="700" letterSpacing="0.05em">
                {hoveredNode.city.toUpperCase()} • {hoveredNode.label.toUpperCase()}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="db-network-stats">
        <div className="db-network-stat-box">
          <div style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 700 }}>ACTIVE NODES</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#22c55e", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
            <span className="db-micro-green-dot" />
            5/5 Operational
          </div>
        </div>
        <div className="db-network-stat-box">
          <div style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 700 }}>ENCRYPTION</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#38bdf8", marginTop: 2 }}>Kyber-1024 PQC</div>
        </div>
        <div className="db-network-stat-box">
          <div style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 700 }}>LEDGER UPTIME</div>
          <div className="db-network-stat-val-uptime" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>99.99%</div>
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
            fontSize: "1.45rem",
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

/* ── Interactive Overview Video / Architecture Modal ────────────────── */
function OverviewModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="db-overview-modal-backdrop" onClick={onClose}>
      <div className="db-overview-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.1rem", color: "#38bdf8" }}>▶</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground, #e2e8f0)" }}>
              BEL DEFENCE TRUST — PLATFORM OVERVIEW
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem", padding: "2px 6px" }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: 18 }}>
          BEL Defence Trust is an autonomous, tamper-proof blockchain infrastructure built for sovereign defence asset provenance.
          Components are registered with cryptographic hashes, verified by authenticated quality inspectors, and permanently anchored on-chain with non-transferable digital passports.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          <div style={{ padding: "12px", background: "rgba(37, 99, 235, 0.08)", borderRadius: "8px", border: "1px solid rgba(37, 99, 235, 0.25)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#38bdf8", marginBottom: 4 }}>1. REGISTRATION</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Component telemetry and vendor manifest hashing.</div>
          </div>
          <div style={{ padding: "12px", background: "rgba(34, 197, 94, 0.08)", borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.25)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#22c55e", marginBottom: 4 }}>2. VERIFICATION</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Multi-signatory quality audit and lab report hashing.</div>
          </div>
          <div style={{ padding: "12px", background: "rgba(139, 92, 246, 0.08)", borderRadius: "8px", border: "1px solid rgba(139, 92, 246, 0.25)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a855f7", marginBottom: 4 }}>3. ON-CHAIN MINT</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Non-fungible passport minting on defence ledger.</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn-secondary" onClick={onClose} style={{ fontSize: "0.8125rem", padding: "6px 16px" }}>
            Close
          </button>
          <Link to="/app/verification" className="btn-primary" onClick={onClose} style={{ fontSize: "0.8125rem", padding: "6px 16px" }}>
            Open Verification Center →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMMAND CENTER DASHBOARD COMPONENT
   ════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [isDemoActive, setIsDemoActive] = useState(() => {
    try {
      return localStorage.getItem("novexa_demo_mode") === "true";
    } catch {
      return false;
    }
  });
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEventResponse[]>([]);
  const [certifications, setCertifications] = useState<CertificationResponse[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(false);

  const loadRealData = () => {
    setError(null);
    setLoading(true);
    dashboardService.getSummary()
      .then(setSummary)
      .catch((e: any) => setError(e?.message || 'Failed to load dashboard data. Backend may be unavailable.'))
      .finally(() => setLoading(false));

    auditService.listAuditEvents({ page_size: 5 })
      .then((r) => setAuditEvents(r.items || []))
      .catch(console.error);

    certificationService.listCertifications({ page_size: 5 })
      .then((r) => setCertifications(r.items || []))
      .catch(console.error);
  };

  useEffect(() => {
    if (isDemoActive) {
      setSummary(DEMO_DASHBOARD_SUMMARY);
      setAuditEvents(DEMO_AUDIT_EVENTS);
      setCertifications(DEMO_CERTIFICATIONS);
      setLoading(false);
    } else {
      loadRealData();
    }
  }, [isDemoActive]);

  const handleLoadDemo = () => {
    setIsDemoActive(true);
    try {
      localStorage.setItem("novexa_demo_mode", "true");
    } catch {}
    setSummary(DEMO_DASHBOARD_SUMMARY);
    setAuditEvents(DEMO_AUDIT_EVENTS);
    setCertifications(DEMO_CERTIFICATIONS);
    setError(null);
  };

  const handleResetDemo = () => {
    setIsDemoActive(false);
    try {
      localStorage.removeItem("novexa_demo_mode");
    } catch {}
    loadRealData();
  };

  const totalAssets   = useCountUp(summary?.total_assets ?? 0, 800, 100);
  const activeUsers   = useCountUp(summary?.active_users ?? 0, 700, 180);
  const totalCerts    = useCountUp(summary?.total_certifications ?? 0, 750, 260);
  const failedVerif   = useCountUp(summary?.failed_verifications ?? 0, 600, 340);
  const blockchainTxs = useCountUp(summary?.total_blockchain_txs ?? 0, 900, 420);

  const total = summary?.total_assets || 1;
  const issues = summary?.failed_verifications || 0;
  const trustScore = isDemoActive
    ? 96.0
    : Math.max(90, Math.round(((total - issues) / total) * 100 * 10) / 10);

  return (
    <div className="db-v4-container page-fade">
      {/* ── Command Center Tactical Control Bar ──────────── */}
      <div className="db-action-bar">
        <div className="db-action-bar-left">
          <div className="db-action-title-group">
            <h1 className="db-action-title">BEL Defence Trust Command Center</h1>
            <p className="db-action-subtitle">
              Sovereign Blockchain-Anchored Asset Integrity & Cryptographic Provenance
            </p>
          </div>
          <div className="db-action-meta-strip">
            <span className="db-telemetry-badge">
              <span className="db-telemetry-dot" />
              LIVE TELEMETRY
            </span>
            <span className="db-meta-sep">•</span>
            <LiveClock />
            <span className="db-meta-sep">•</span>
            <span className="db-synthetic-badge">SYNTHETIC DEMO PROTOCOL</span>
          </div>
        </div>

        <div className="db-action-bar-right">
          {isDemoActive ? (
            <div className="db-demo-active-group">
              <span className="db-demo-pill">
                <span className="db-demo-pill-pulse" />
                DEMO DATA LOADED (12 ASSETS)
              </span>
              <button
                id="reset-demo-btn"
                className="db-demo-reset-btn"
                onClick={handleResetDemo}
                title="Clear demo data and reload live backend telemetry"
              >
                ↺ RESET DEMO
              </button>
            </div>
          ) : (
            <button
              id="load-demo-btn"
              className="db-load-demo-btn"
              onClick={handleLoadDemo}
              title="Populate dashboard with realistic demonstration data for presentation"
            >
              <span className="db-demo-btn-icon">⚡</span>
              LOAD DEMO DATA
            </button>
          )}
        </div>
      </div>

      {/* ── 5 KPI Metric Cards ────────────────────────────── */}
      <div id="dashboard-metrics" className="db-kpi-grid">
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

      {/* ── Footer Subtle BEL Branding ────────────────────────── */}
      <footer className="db-footer-branding">
        <div className="db-footer-left">
          <BelIconMark size={16} />
          <span className="db-footer-title">BEL DEFENCE TRUST</span>
        </div>
        <div className="db-footer-divider">•</div>
        <div className="db-footer-tags">
          <span>BLOCKCHAIN</span>
          <span className="db-tag-dot">•</span>
          <span>SECURITY</span>
          <span className="db-tag-dot">•</span>
          <span>SOVEREIGNTY</span>
        </div>
      </footer>

      {/* Overview Modal */}
      {showOverview && <OverviewModal onClose={() => setShowOverview(false)} />}
    </div>
  );
}
