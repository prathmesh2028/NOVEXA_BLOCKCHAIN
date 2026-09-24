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

/* ── Panoramic Indian Defence Command Center Hero Banner ────────────── */
interface PanoramicHeroProps {
  user: any;
  role: string;
  onWatchOverview: () => void;
}

function PanoramicIndianDefenceHero({ user, role, onWatchOverview }: PanoramicHeroProps) {
  const [azimuth, setAzimuth] = useState(242);

  useEffect(() => {
    const timer = setInterval(() => {
      setAzimuth((prev) => (prev >= 360 ? 0 : prev + 1));
    }, 220);
    return () => clearInterval(timer);
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const dateStr = new Date()
    .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  // 11 Strategic Military Command Nodes on India Map
  const indiaNodes = [
    { city: "Ladakh", label: "Northern Command", x: 380, y: 40 },
    { city: "New Delhi", label: "Strategic HQ", x: 385, y: 85 },
    { city: "Jaipur", label: "Western Command", x: 350, y: 105 },
    { city: "Lucknow", label: "Central Command", x: 420, y: 110 },
    { city: "Ahmedabad", label: "Coast Guard HQ", x: 325, y: 145 },
    { city: "Mumbai", label: "Western Fleet Deck", x: 335, y: 190 },
    { city: "Hyderabad", label: "Avionics Research", x: 395, y: 200 },
    { city: "Visakhapatnam", label: "Eastern Fleet Deck", x: 450, y: 200 },
    { city: "Bengaluru", label: "BEL Defence Complex", x: 380, y: 250 },
    { city: "Chennai", label: "Southern Sea Command", x: 420, y: 255 },
    { city: "Kochi", label: "Southern Naval Base", x: 365, y: 295 },
  ];

  return (
    <div className="db-hero-panoramic-card">
      <div className="db-hero-ambient-glow" />

      {/* ─── LEFT COLUMN: TITLE, BADGES, CTAS, 4 TRUST FEATURE BLOCKS ─── */}
      <div className="db-hero-left-col">
        <div>
          <div className="db-hero-eyebrow">
            SECURE TODAY &nbsp;|&nbsp; STRONGER TOMORROW
          </div>

          <div className="db-hero-badge-row">
            <div className="db-hero-ps-pill">
              <span className="db-status-dot-pulse" style={{ width: 6, height: 6 }} />
              <span>NOVEXA DEFENCE TRUST • PS 26125 • INDIA</span>
            </div>
            <span style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
              {dateStr}
            </span>
          </div>

          <h1 className="db-hero-headline">
            <span className="db-title-navy">BLOCKCHAIN-BASED</span>
            <span className="db-title-electric">SECURE PLATFORM</span>
            <span className="db-title-navy">FOR DEFENCE ASSETS</span>
          </h1>

          <p className="db-hero-description">
            Identity-verified, role-governed, evidence-backed, and blockchain-certified asset management
            for defence component records. Every action traceable. Every claim verifiable.
          </p>

          <div className="db-hero-cta-group">
            <a href="#dashboard-metrics" className="db-cta-primary">
              <span>Access Platform</span>
              <span style={{ fontSize: "0.95rem" }}>→</span>
            </a>

            <button type="button" className="db-cta-secondary" onClick={onWatchOverview}>
              <span style={{ color: "#2563eb", fontSize: "0.8rem" }}>▶</span>
              <span>Watch Overview</span>
            </button>
          </div>

          <div className="db-hero-user-meta">
            <span>{greeting}, <strong>{user?.name?.split(" ")[0]}</strong></span>
            <span>·</span>
            <span>Signed in as <RoleBadge role={role as any} size="sm" /></span>
            <span>·</span>
            <span style={{ color: "#22c55e", fontWeight: 600 }}>✓ Identity Verified</span>
            <span>·</span>
            <span className="meta-id" style={{ fontSize: "0.7rem" }}>{user?.actor?.did || "DID:BEL:01"}</span>
          </div>
        </div>

        {/* 4 Feature Indicator Blocks along Base */}
        <div className="db-trust-feature-grid">
          <div className="db-trust-feature-item">
            <div className="db-trust-feat-icon" style={{ color: "#2563eb" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div className="db-trust-feat-title">TRUST</div>
              <div className="db-trust-feat-sub">Immutable Records</div>
            </div>
          </div>

          <div className="db-trust-feature-item">
            <div className="db-trust-feat-icon" style={{ color: "#0284c7" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <div className="db-trust-feat-title">TRANSPARENCY</div>
              <div className="db-trust-feat-sub">End-to-End Visibility</div>
            </div>
          </div>

          <div className="db-trust-feature-item">
            <div className="db-trust-feat-icon" style={{ color: "#22c55e" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <div className="db-trust-feat-title">SECURITY</div>
              <div className="db-trust-feat-sub">Role-Based Access</div>
            </div>
          </div>

          <div className="db-trust-feature-item">
            <IndianTricolourPill />
            <div>
              <div className="db-trust-feat-title">SOVEREIGN</div>
              <div className="db-trust-feat-sub">Built for Bharat</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CENTER PANORAMIC VISUAL: INDIA MAP, SATELLITE, JET, SHIP, LANDMARK ─── */}
      <div className="db-hero-center-visual">
        <svg className="db-panoramic-svg" viewBox="0 0 680 340" fill="none">
          <defs>
            <radialGradient id="indiaHaloGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#2563eb" stopOpacity="0.04" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="satBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="jetTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* India Regional Halo */}
          <circle cx="380" cy="180" r="160" fill="url(#indiaHaloGrad)" className="db-map-halo" />

          {/* Subtle India Gate Monument Line-Art (Silhouette) */}
          <g transform="translate(485, 230) scale(0.65)" className="db-landmark-india-gate" opacity="0.35">
            <rect x="0" y="50" width="70" height="12" rx="1" />
            <rect x="6" y="16" width="58" height="34" />
            <path d="M 23 50 L 23 28 Q 35 18 47 28 L 47 50 Z" fill="rgba(37,99,235,0.08)" />
            <rect x="12" y="8" width="46" height="8" rx="1" />
            <rect x="18" y="0" width="34" height="8" rx="1" />
          </g>

          {/* India Peninsula Map Path */}
          <path
            d="M 370 20 
               C 385 22, 395 35, 410 42
               C 425 50, 440 60, 435 75
               C 430 85, 445 95, 455 110
               C 470 125, 460 145, 445 160
               C 440 175, 455 190, 465 210
               C 455 230, 435 245, 415 270
               C 395 295, 375 315, 365 330
               C 355 310, 345 280, 340 250
               C 335 225, 320 205, 315 180
               C 310 160, 300 145, 290 135
               C 285 120, 310 100, 325 85
               C 335 70, 345 50, 355 35 Z"
            className="db-map-india-land"
          />

          {/* Cyber Mesh Connections between India Nodes */}
          <path d="M 380 40 L 385 85 L 350 105 L 325 145 L 335 190 L 380 250 L 365 295" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 385 85 L 420 110 L 450 200 L 420 255 L 380 250" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 335 190 L 395 200 L 450 200" stroke="rgba(0, 229, 255, 0.35)" strokeWidth="1" />
          <path d="M 395 200 L 380 250" stroke="rgba(34, 197, 94, 0.35)" strokeWidth="1" />

          {/* Traveling Cyber Data Packets */}
          <path d="M 385 85 L 395 200 L 380 250" stroke="#00e5ff" strokeWidth="1.8" fill="none" className="db-data-stream-1" />
          <path d="M 335 190 L 395 200 L 450 200" stroke="#22c55e" strokeWidth="1.8" fill="none" className="db-data-stream-2" />

          {/* 11 Military Strategic Command Nodes with Labels */}
          {indiaNodes.map((n, idx) => (
            <g key={n.city}>
              <circle cx={n.x} cy={n.y} r="10" className="db-hero-node-ring" style={{ animationDelay: `${(idx * 0.35).toFixed(2)}s` }} />
              <circle cx={n.x} cy={n.y} r="3.5" className="db-hero-node-dot" />
              <text x={n.x + 8} y={n.y + 3} className="db-hero-node-label">
                {n.city}
              </text>
            </g>
          ))}

          {/* Upper Left: Defence Communication Satellite */}
          <g className="db-hero-anim-satellite" transform="translate(180, 55)">
            <line x1="0" y1="0" x2="205" y2="30" className="db-hero-satellite-beam" />
            {/* Satellite Body & Solar Arrays */}
            <rect x="-10" y="-6" width="20" height="12" rx="2" fill="#0284c7" stroke="#00e5ff" strokeWidth="1" />
            <rect x="-30" y="-5" width="16" height="10" rx="1" fill="rgba(0, 229, 255, 0.6)" stroke="#00e5ff" strokeWidth="0.8" />
            <line x1="-22" y1="-5" x2="-22" y2="5" stroke="#0369a1" strokeWidth="0.8" />
            <rect x="14" y="-5" width="16" height="10" rx="1" fill="rgba(0, 229, 255, 0.6)" stroke="#00e5ff" strokeWidth="0.8" />
            <line x1="22" y1="-5" x2="22" y2="5" stroke="#0369a1" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
            <circle cx="0" cy="0" r="5" fill="none" stroke="#22c55e" strokeWidth="0.8" />
          </g>

          {/* Upper Right: 5th-Gen Stealth Fighter Jet */}
          <g className="db-hero-anim-fighter" transform="translate(520, 60)">
            <line x1="-30" y1="-2" x2="-6" y2="-2" stroke="url(#jetTrailGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-30" y1="2" x2="-6" y2="2" stroke="url(#jetTrailGrad)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Fighter Jet Fuselage */}
            <path
              d="M 24,0 L 6,-7 L -10,-18 L -5,-4 L -16,0 L -5,4 L -10,18 L 6,7 Z"
              fill="#0ea5e9"
              stroke="#e0f2fe"
              strokeWidth="0.8"
              filter="drop-shadow(0 2px 8px rgba(0, 229, 255, 0.4))"
            />
          </g>

          {/* Lower Center/Left: Naval Guided Missile Destroyer */}
          <g className="db-hero-anim-naval" transform="translate(240, 260)">
            <ellipse cx="0" cy="10" rx="30" ry="4" fill="none" stroke="rgba(56, 189, 248, 0.55)" strokeWidth="1.2" className="db-hero-naval-wake" />
            {/* Ship Hull */}
            <path d="M -26,5 L 26,5 L 18,-5 L -16,-5 Z" fill="rgba(15, 32, 54, 0.95)" stroke="#38bdf8" strokeWidth="1" />
            {/* Superstructure & Bridge Mast */}
            <rect x="-6" y="-11" width="10" height="6" fill="#0284c7" />
            <line x1="0" y1="-11" x2="0" y2="-16" stroke="#00e5ff" strokeWidth="1.2" />
            <circle cx="0" cy="-16" r="1.8" fill="#22c55e" />
          </g>
        </svg>
      </div>

      {/* ─── RIGHT COLUMN: RADAR PANEL + TRUST CHAIN + SYSTEM MONITOR ─── */}
      <div className="db-hero-right-col">
        {/* 1. Tactical Radar Command Panel (Always Dark Command Surface) */}
        <div className="db-tactical-radar-panel">
          <div className="db-radar-bezel" />

          <div className="db-radar-header">
            <div className="db-radar-node-tag">
              <span className="db-status-dot-pulse" style={{ width: 6, height: 6 }} />
              <span>NODE: NOVEXA-01 • ENCRYPTED • LIVE</span>
            </div>
            <div className="db-radar-sih-tag">SIH 2026 • PS 26125</div>
          </div>

          <div className="db-radar-body-grid">
            {/* Readiness Counters */}
            <div className="db-readiness-counters">
              <div className="db-readiness-item">
                <span className="db-readiness-val">12</span>
                <span className="db-readiness-lbl">SATELLITES</span>
              </div>
              <div className="db-readiness-item">
                <span className="db-readiness-val">08</span>
                <span className="db-readiness-lbl">AIR UNITS</span>
              </div>
              <div className="db-readiness-item">
                <span className="db-readiness-val">05</span>
                <span className="db-readiness-lbl">NAVAL UNITS</span>
              </div>
              <div className="db-readiness-item">
                <span className="db-readiness-val">18</span>
                <span className="db-readiness-lbl">GROUND UNITS</span>
              </div>
            </div>

            {/* Circular Radar Scope */}
            <div className="db-radar-scope-wrapper">
              <div className="db-radar-scope">
                <div className="db-radar-ring db-radar-ring-1" />
                <div className="db-radar-ring db-radar-ring-2" />
                <div className="db-radar-ring db-radar-ring-3" />
                <div className="db-radar-ring db-radar-ring-4" />
                <div className="db-radar-axis-h" />
                <div className="db-radar-axis-v" />
                <div className="db-radar-sweep-beam" />
                <div className="db-radar-blip blip-1" />
                <div className="db-radar-blip blip-2" />
                <div className="db-radar-blip blip-3" />
                <div className="db-radar-pin" />
              </div>
            </div>

            {/* Mini India Map Locator in Radar Scope */}
            <div className="db-radar-india-mini">
              <svg width="45" height="55" viewBox="0 0 100 120" fill="none">
                <path
                  d="M 50 10 C 60 20, 80 40, 70 70 C 60 90, 50 110, 48 115 C 45 100, 30 80, 25 65 C 20 50, 40 20, 50 10 Z"
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <circle cx="50" cy="45" r="4" fill="#22c55e" style={{ filter: "drop-shadow(0 0 4px #22c55e)" }} />
              </svg>
            </div>
          </div>

          {/* Telemetry Readouts */}
          <div className="db-radar-telemetry-grid">
            <div className="db-telemetry-box">
              <span className="db-tel-lbl">LAT</span>
              <span className="db-tel-val">20.6139° N</span>
            </div>
            <div className="db-telemetry-box">
              <span className="db-tel-lbl">LON</span>
              <span className="db-tel-val">77.2090° E</span>
            </div>
            <div className="db-telemetry-box">
              <span className="db-tel-lbl">ALT</span>
              <span className="db-tel-val">11,400 M</span>
            </div>
            <div className="db-telemetry-box">
              <span className="db-tel-lbl">SPD</span>
              <span className="db-tel-val">MACH 1.8</span>
            </div>
            <div className="db-telemetry-box">
              <span className="db-tel-lbl">HDG</span>
              <span className="db-tel-val">042°</span>
            </div>
          </div>

          {/* Status Checklist */}
          <div className="db-radar-checklist">
            <span>✓ SYSTEMS ONLINE</span>
            <span>✓ DATA ENCRYPTED</span>
            <span>✓ BLOCKCHAIN SYNCED</span>
            <span>✓ THREAT MONITORING</span>
          </div>

          {/* Footer Bar */}
          <div className="db-radar-footer">
            <div className="db-radar-active-status">
              <span className="db-status-dot-pulse" style={{ width: 6, height: 6 }} />
              <span>STATUS: ACTIVE</span>
            </div>
            <div className="db-radar-az-status">AZ: {azimuth}°</div>
          </div>
        </div>

        {/* 2. Trust Verification Chain Card (Matches Reference) */}
        <div className="db-trust-chain-card">
          <div className="db-chain-header">
            <span className="db-chain-title">TRUST VERIFICATION CHAIN</span>
            <span className="db-chain-tag">ON-CHAIN CONSENSUS</span>
          </div>

          <div className="db-chain-steps-track">
            <div className="db-chain-rail-line">
              <div className="db-chain-energy-beam" />
            </div>

            {[
              { name: "ASSET", sub: "Registered" },
              { name: "VERIFY", sub: "SHA-256" },
              { name: "BLOCKCHAIN", sub: "Minted" },
              { name: "AUDIT", sub: "Logged" },
              { name: "TRUST", sub: "Certified" },
            ].map((step) => (
              <div key={step.name} className="db-chain-node-box">
                <div className="db-chain-node-dot">
                  <div className="db-chain-node-inner" />
                </div>
                <span className="db-chain-node-name">{step.name}</span>
                <span className="db-chain-node-sub">{step.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Live System Monitor Card (Matches Reference) */}
        <div className="db-system-monitor-card">
          <div className="db-monitor-header">
            <span className="db-monitor-title">LIVE SYSTEM MONITOR</span>
            <div className="db-monitor-badge">
              <span className="db-status-dot-pulse" style={{ width: 6, height: 6 }} />
              <span>OPERATIONAL • SECURE</span>
            </div>
          </div>

          <div className="db-monitor-rows-stack">
            {[
              { name: "Platform Core", lat: 13, status: "Operational" },
              { name: "Blockchain Node", lat: 28, status: "Synced" },
              { name: "Asset Registry", lat: 16, status: "Online" },
              { name: "Verification Engine", lat: 24, status: "Operational" },
            ].map((row, idx) => (
              <div key={row.name} className="db-monitor-row-item">
                <div className="db-monitor-row-left">
                  <span className="db-monitor-row-icon">⬡</span>
                  <div className="db-monitor-row-text">
                    <span className="db-monitor-row-name">{row.name}</span>
                    <span className="db-monitor-row-latency">Latency: {row.lat} ms</span>
                  </div>
                </div>

                <svg className="db-monitor-sparkline" viewBox="0 0 50 16" fill="none">
                  <path
                    d={idx % 2 === 0 ? "M 0 10 Q 12 4 25 8 T 50 5" : "M 0 12 Q 15 14 30 6 T 50 8"}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="db-monitor-row-status">
                  <span className="db-status-dot-pulse" style={{ width: 5, height: 5 }} />
                  <span>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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

/* ── Global Defence Network Card with Subtle Indian Tricolour Accent ── */
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
      <div className="db-card-header" style={{ marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="db-card-title" style={{ color: "#38bdf8" }}>GLOBAL DEFENCE NETWORK</div>
            <IndianTricolourPill />
          </div>
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
        <svg className="db-network-svg" viewBox="0 0 600 220" fill="none">
          <ellipse cx="300" cy="110" rx="270" ry="95" stroke="rgba(30, 58, 96, 0.45)" strokeWidth="1" strokeDasharray="3 6" fill="rgba(6, 16, 32, 0.4)" />
          <ellipse cx="300" cy="110" rx="190" ry="70" stroke="rgba(30, 58, 96, 0.35)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="30" y1="110" x2="570" y2="110" stroke="rgba(30, 58, 96, 0.35)" strokeWidth="1" />

          {/* India Regional Highlight Boundary */}
          <path
            d="M 370,55 Q 425,70 480,90 Q 430,170 415,170 Q 370,120 370,55 Z"
            fill="rgba(56, 189, 248, 0.08)"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          <path d="M 420,85 L 385,118 L 415,145 L 425,124 L 470,105 L 420,85 Z" stroke="rgba(59, 130, 246, 0.35)" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 420,85 L 385,118 L 415,145" stroke="#38bdf8" strokeWidth="2" fill="none" className="db-data-stream-1" />
          <path d="M 415,145 L 425,124 L 470,105" stroke="#22c55e" strokeWidth="2" fill="none" className="db-data-stream-2" />

          {nodes.map((n) => (
            <g key={n.city} transform={`translate(${n.x}, ${n.y})`}>
              <circle cx="0" cy="0" r="10" fill="none" stroke={n.color} strokeWidth="1" />
              <circle cx="0" cy="0" r="4.5" fill={n.color} />
              <text x="8" y="3" fill="#cbd5e1" fontSize="9" fontWeight="600" letterSpacing="0.04em">
                {n.city}
              </text>
            </g>
          ))}
        </svg>
      </div>

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
              NOVEXA DEFENCE TRUST — PLATFORM OVERVIEW
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
          NOVEXA Defence Trust is an autonomous, tamper-proof blockchain infrastructure built for sovereign defence asset provenance.
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
  const { user, role } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEventResponse[]>([]);
  const [certifications, setCertifications] = useState<CertificationResponse[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(false);

  const loadData = () => {
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
    loadData();
  }, []);

  const totalAssets   = useCountUp(summary?.total_assets ?? 0, 800, 100);
  const activeUsers   = useCountUp(summary?.active_users ?? 0, 700, 180);
  const totalCerts    = useCountUp(summary?.total_certifications ?? 0, 750, 260);
  const failedVerif   = useCountUp(summary?.failed_verifications ?? 0, 600, 340);
  const blockchainTxs = useCountUp(summary?.total_blockchain_txs ?? 0, 900, 420);

  if (!user || !role) return null;

  const total = summary?.total_assets || 1;
  const issues = summary?.failed_verifications || 0;
  const trustScore = Math.max(90, Math.round(((total - issues) / total) * 100 * 10) / 10);

  return (
    <div className="db-v4-container page-fade">
      {/* ── ROW 1: Panoramic Indian Defence Command Hero Banner ──── */}
      <PanoramicIndianDefenceHero
        user={user}
        role={role}
        onWatchOverview={() => setShowOverview(true)}
      />

      {/* ── ROW 2: 5 KPI Metric Cards ────────────────────────────── */}
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

      {/* Overview Modal */}
      {showOverview && <OverviewModal onClose={() => setShowOverview(false)} />}
    </div>
  );
}
