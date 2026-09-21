import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import "./HomePage.css";

const STRATEGIC_NODES = [
  { id: "delhi", name: "New Delhi", city: "National Command HQ", x: 440, y: 175, type: "command" },
  { id: "leh", name: "Ladakh", city: "Northern Sector", x: 425, y: 95, type: "forward" },
  { id: "mumbai", name: "Mumbai", city: "Western Naval Command", x: 345, y: 350, type: "naval" },
  { id: "pune", name: "Pune", city: "ARDE Defence Labs", x: 360, y: 380, type: "lab" },
  { id: "bengaluru", name: "Bengaluru", city: "ISRO / BEL Avionics", x: 420, y: 495, type: "aerospace" },
  { id: "hyderabad", name: "Hyderabad", city: "Missile Complex", x: 445, y: 385, type: "missile" },
  { id: "vizag", name: "Visakhapatnam", city: "Eastern Naval Command", x: 530, y: 395, type: "naval" },
  { id: "kolkata", name: "Kolkata", city: "Eastern Command", x: 605, y: 280, type: "command" },
  { id: "kochi", name: "Kochi", city: "Southern Naval Command", x: 395, y: 555, type: "naval" },
  { id: "chennai", name: "Chennai", city: "Armament Tech Hub", x: 460, y: 500, type: "lab" },
];

const TRUST_INDICATORS = [
  {
    title: "TRUST",
    subtitle: "Immutable Records",
    icon: "◈",
    color: "#2563eb",
  },
  {
    title: "TRANSPARENCY",
    subtitle: "End-to-End Visibility",
    icon: "◎",
    color: "#0284c7",
  },
  {
    title: "SECURITY",
    subtitle: "Role-Based Access",
    icon: "◫",
    color: "#22c55e",
  },
  {
    title: "SOVEREIGN",
    subtitle: "Built for Bharat",
    icon: "◆",
    color: "#f59e0b",
  },
];

const STATS = [
  { value: "847", label: "Assets Registered", note: "Hardware & Component Registry" },
  { value: "312", label: "Certifications Issued", note: "Non-Transferable NFT Proofs" },
  { value: "2,411", label: "Blockchain Transactions", note: "NOVEXA Distributed Trust Chain" },
  { value: "1,096", label: "Evidence Records Verified", note: "SHA-256 Tamper-Proof Fingerprints" },
];

export default function HomePage() {
  // ─── Subtle Parallax on Background Layer (< 12px) ───
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
    setParallax({ x, y });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  // ─── Live Telemetry Simulation ───
  const [latency, setLatency] = useState(12);
  const [blockHeight, setBlockHeight] = useState(4892108);
  const [azimuth, setAzimuth] = useState("042°");
  const [showOverviewModal, setShowOverviewModal] = useState(false);

  useEffect(() => {
    const latencyInterval = setInterval(() => {
      setLatency((prev) => (prev === 12 ? 11 : prev === 11 ? 13 : 12));
    }, 3200);

    const blockInterval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 4500);

    const azAngles = ["042°", "078°", "124°", "185°", "242°", "308°", "354°"];
    let azIdx = 0;
    const azInterval = setInterval(() => {
      azIdx = (azIdx + 1) % azAngles.length;
      setAzimuth(azAngles[azIdx]);
    }, 1800);

    return () => {
      clearInterval(latencyInterval);
      clearInterval(blockInterval);
      clearInterval(azInterval);
    };
  }, []);

  return (
    <div
      className="home-page"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={heroRef}
    >
      <PublicNavbar />

      {/* ═══════════════════════════════════════════════════════════
          BACKGROUND ATMOSPHERE: TECHNICAL GRID & INDIA MAP
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="home-parallax-bg"
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
        }}
      >
        {/* Technical Coordinate Grid */}
        <div className="home-technical-grid" />

        {/* Soft Radial Ambient Bloom */}
        <div className="home-ambient-bloom" />

        {/* India Network Map & Satellite System */}
        <div className="home-india-network-stage">
          <svg
            className="home-india-svg"
            viewBox="0 0 1000 680"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="indiaFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
              </linearGradient>
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Orbit Ellipse & Guide */}
            <ellipse
              cx="470"
              cy="360"
              rx="340"
              ry="130"
              transform="rotate(-24 470 360)"
              fill="none"
              stroke="rgba(37, 99, 235, 0.15)"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="home-orbit-ring"
            />

            {/* Orbiting Defence Satellite */}
            <g className="home-satellite-group">
              <g transform="translate(740, 230)">
                <circle cx="0" cy="0" r="5" fill="none" stroke="#2563eb" strokeWidth="1" className="satellite-signal-wave" />
                <circle cx="0" cy="0" r="11" fill="none" stroke="#0284c7" strokeWidth="0.8" style={{ animation: "signalWaveRipple 3s ease-out 1s infinite" }} />
                <rect x="-4" y="-3" width="8" height="6" fill="#ffffff" stroke="#2563eb" strokeWidth="0.8" rx="1" />
                <rect x="-18" y="-4" width="11" height="8" fill="rgba(37, 99, 235, 0.25)" stroke="#2563eb" strokeWidth="0.6" rx="1" />
                <line x1="-12.5" y1="-4" x2="-12.5" y2="4" stroke="#0284c7" strokeWidth="0.5" />
                <rect x="7" y="-4" width="11" height="8" fill="rgba(37, 99, 235, 0.25)" stroke="#2563eb" strokeWidth="0.6" rx="1" />
                <line x1="12.5" y1="-4" x2="12.5" y2="4" stroke="#0284c7" strokeWidth="0.5" />
                <line x1="0" y1="3" x2="0" y2="7" stroke="#64748b" strokeWidth="0.8" />
                <circle cx="0" cy="8" r="1.5" fill="#2563eb" />
              </g>
            </g>

            {/* Tactical India Network Contour */}
            <path
              d="M 425 90 
                 L 460 115 L 450 145 L 485 160 L 515 170 L 575 195 L 610 215 
                 L 660 210 L 690 230 L 670 270 L 635 275 L 600 305 L 565 340 
                 L 540 380 L 525 435 L 490 490 L 460 540 L 435 590 L 415 620 
                 L 395 565 L 365 480 L 335 405 L 330 350 L 315 325 L 300 280 
                 L 320 240 L 350 210 L 380 180 L 390 140 L 410 110 Z"
              fill="url(#indiaFillGrad)"
              stroke="rgba(37, 99, 235, 0.28)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />

            {/* Strategic Defence Vectors */}
            <path
              d="M 425 90 L 440 175 L 345 350 L 420 495 L 435 590 L 530 395 L 605 280 L 440 175"
              stroke="rgba(37, 99, 235, 0.18)"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M 440 175 L 445 385 L 420 495 M 345 350 L 445 385 L 530 395 M 440 175 L 530 395"
              stroke="rgba(2, 132, 199, 0.24)"
              strokeWidth="1.1"
              fill="none"
            />

            {/* Strategic Command Terminal Conduits (Linking India Network to Radar Terminal) */}
            <path
              d="M 440 175 C 560 175, 680 185, 800 220"
              stroke="rgba(37, 99, 235, 0.3)"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              fill="none"
            />
            <path
              d="M 605 280 C 690 280, 750 250, 800 235"
              stroke="rgba(6, 182, 212, 0.28)"
              strokeWidth="1"
              strokeDasharray="3 5"
              fill="none"
            />

            {/* Travelling Data Packets Along Vectors */}
            <circle cx="440" cy="175" r="2.5" fill="#2563eb" filter="url(#softGlow)">
              <animateMotion path="M 0 0 L 5 210 L -25 320" dur="6.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="345" cy="350" r="2.5" fill="#0284c7" filter="url(#softGlow)">
              <animateMotion path="M 0 0 L 100 35 L 185 45" dur="5.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="605" cy="280" r="2.2" fill="#16a34a" filter="url(#softGlow)">
              <animateMotion path="M 0 0 L -75 115 L -160 105" dur="7.5s" repeatCount="indefinite" />
            </circle>

            {/* Packets Streaming Directly into the Radar Command Module Terminal */}
            <circle cx="0" cy="0" r="3" fill="#06b6d4" filter="url(#softGlow)">
              <animateMotion path="M 440 175 C 560 175, 680 185, 800 220" dur="4.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="2.5" fill="#2563eb" filter="url(#softGlow)">
              <animateMotion path="M 605 280 C 690 280, 750 250, 800 235" dur="4.2s" repeatCount="indefinite" />
            </circle>

            {/* Strategic Defence Nodes & Labels */}
            {STRATEGIC_NODES.map((node) => (
              <g key={node.id} className="strategic-node" transform={`translate(${node.x}, ${node.y})`}>
                <circle cx="0" cy="0" r="4" fill="none" stroke="#2563eb" className="node-pulse-ring" />
                <circle
                  cx="0"
                  cy="0"
                  r="3.5"
                  fill={node.type === "command" ? "#16a34a" : "#2563eb"}
                  filter="url(#softGlow)"
                />
                <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                <text
                  x="7"
                  y="3"
                  fill="rgba(100, 116, 139, 0.85)"
                  fontSize="7.5"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  letterSpacing="0.04em"
                >
                  {node.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MAIN HERO SECTION — 2-COLUMN COMMAND CENTER COMPOSITION
          ═══════════════════════════════════════════════════════════ */}
      <section className="home-hero-container">
        {/* ─── LEFT COLUMN: HERO CONTENT (~55-60%) ─── */}
        <div className="home-hero-left">
          {/* Top Micro Label */}
          <div className="home-micro-label hero-stagger-1">
            SECURE TODAY &nbsp;|&nbsp; STRONGER TOMORROW
          </div>

          {/* Defence Trust Pill Badge */}
          <div className="home-pill-badge hero-stagger-2">
            <span className="operational-dot" />
            <span>NOVEXA DEFENCE TRUST • PS 26125 • INDIA</span>
          </div>

          {/* 3-Line High Impact Hero Title */}
          <h1 className="home-hero-title hero-stagger-3">
            <span className="title-navy">BLOCKCHAIN-BASED</span>
            <span className="title-electric">SECURE PLATFORM</span>
            <span className="title-navy">FOR DEFENCE ASSETS</span>
          </h1>

          {/* Hero Description */}
          <p className="home-hero-desc hero-stagger-4">
            Identity-verified, role-governed, evidence-backed, and blockchain-certified asset management
            for defence component records. Every action traceable. Every claim verifiable.
          </p>

          {/* CTA Action Buttons */}
          <div className="home-cta-actions hero-stagger-5">
            <Link to="/login" className="home-cta-primary">
              <span>Access Platform</span>
              <span className="cta-arrow">→</span>
            </Link>

            <button
              type="button"
              className="home-cta-secondary"
              onClick={() => setShowOverviewModal(true)}
            >
              <span>Watch Overview</span>
            </button>
          </div>

          {/* 4 Compact Trust Indicators */}
          <div className="home-trust-indicators-grid hero-stagger-6">
            {TRUST_INDICATORS.map((item) => (
              <div key={item.title} className="home-indicator-card">
                <div className="indicator-icon" style={{ color: item.color }}>
                  {item.icon}
                </div>
                <div className="indicator-content">
                  <div className="indicator-title">{item.title}</div>
                  <div className="indicator-sub">{item.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: UNIFIED COMMAND CENTER CHASSIS (~40-45%) ─── */}
        <div className="home-hero-right hero-stagger-7">
          <div className="home-command-chassis">
            {/* Outer Ambient Electromagnetic Halo behind Radar */}
            <div className="home-radar-halo" />

            {/* 1. Tactical Radar Command Module */}
            <div className="home-radar-panel">
              {/* Radar Bezel Accent Strip */}
              <div className="radar-bezel-strip" />

              {/* Radar Header */}
              <div className="radar-header">
                <div className="radar-node-id">
                  <span className="operational-dot" style={{ width: 6, height: 6 }} />
                  <span>NODE: NOVEXA-01 • ENCRYPTED • LIVE</span>
                </div>
                <div className="radar-sih-badge">SIH 2026 • PS 26125</div>
              </div>

              {/* Radar Scope Display */}
              <div className="radar-scope-wrapper">
                <div className="radar-scope">
                  {/* Concentric Rings */}
                  <div className="radar-ring radar-ring-1" />
                  <div className="radar-ring radar-ring-2 radar-ring-inner" />
                  <div className="radar-ring radar-ring-3 radar-ring-outer" />
                  <div className="radar-ring radar-ring-4" />

                  {/* Crosshairs */}
                  <div className="radar-axis-h" />
                  <div className="radar-axis-v" />

                  {/* Sweep Beam */}
                  <div className="radar-sweep-beam" />

                  {/* Expanding Signal Wave from Active Sector */}
                  <div className="radar-signal-wave" />

                  {/* Pulsing Target Blips */}
                  <div className="radar-blip blip-alpha" title="Sector 1: Alpha Contact (28.6° N)" />
                  <div className="radar-blip blip-bravo" title="Sector 3: Sensor Array (19.1° N)" />
                  <div className="radar-blip blip-charlie" title="Sector 4: Communications Relay" />

                  {/* Target Lock Bracket */}
                  <div className="radar-target-lock" title="Target Lock Engaged · Sector 1">
                    <span className="lock-bracket-corner tl" />
                    <span className="lock-bracket-corner tr" />
                    <span className="lock-bracket-corner bl" />
                    <span className="lock-bracket-corner br" />
                  </div>

                  {/* Center Node Pin */}
                  <div className="radar-center-pin" />
                </div>
              </div>

              {/* Technical Information Bar */}
              <div className="radar-telemetry-grid">
                <div className="telemetry-item">
                  <span className="tel-label">LAT</span>
                  <span className="tel-value">28.6139° N</span>
                </div>
                <div className="telemetry-item">
                  <span className="tel-label">LON</span>
                  <span className="tel-value">77.2090° E</span>
                </div>
                <div className="telemetry-item">
                  <span className="tel-label">ALT</span>
                  <span className="tel-value">11,400 M</span>
                </div>
                <div className="telemetry-item">
                  <span className="tel-label">SPD</span>
                  <span className="tel-value">MACH 1.8</span>
                </div>
                <div className="telemetry-item">
                  <span className="tel-label">HDG</span>
                  <span className="tel-value">042°</span>
                </div>
              </div>

              {/* Status Checklist */}
              <div className="radar-status-checklist">
                <span className="check-item">✓ SYSTEMS ONLINE</span>
                <span className="check-item">✓ BLOCKCHAIN SYNCED</span>
                <span className="check-item">✓ DATA ENCRYPTED</span>
                <span className="check-item">✓ THREAT MONITORING</span>
              </div>

              {/* Bottom Status Bar */}
              <div className="radar-bottom-bar">
                <div className="radar-status-active">
                  <span className="operational-dot" />
                  <span>STATUS: ACTIVE</span>
                </div>
                <div className="radar-az-ticker">AZ: {azimuth}</div>
              </div>
            </div>

            {/* Vertical Connector Conduit between Radar and Trust Chain */}
            <div className="chassis-connector-rail">
              <div className="rail-energy-pulse" />
            </div>

            {/* 2. Process / Trust Chain Panel */}
            <div className="home-trust-chain-card">
              <div className="chain-header">
                <span className="chain-title">TRUST VERIFICATION CHAIN</span>
                <span className="chain-tag">ON-CHAIN CONSENSUS</span>
              </div>

              <div className="chain-steps-row">
                <div className="chain-line-track">
                  <div className="chain-energy-pulse" />
                </div>

                {[
                  { name: "ASSET", sub: "Registered" },
                  { name: "VERIFY", sub: "SHA-256" },
                  { name: "BLOCKCHAIN", sub: "Minted" },
                  { name: "AUDIT", sub: "Logged" },
                  { name: "TRUST", sub: "Certified" },
                ].map((step) => (
                  <div key={step.name} className="chain-node-box">
                    <div className="chain-node-circle">
                      <span className="node-dot-inner" />
                    </div>
                    <span className="chain-node-name">{step.name}</span>
                    <span className="chain-node-sub">{step.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Connector Conduit between Trust Chain and System Monitor */}
            <div className="chassis-connector-rail">
              <div className="rail-energy-pulse" style={{ animationDelay: "1.4s" }} />
            </div>

            {/* 3. Live System Monitor Panel */}
            <div className="home-monitor-card">
              <div className="monitor-header">
                <span className="monitor-title">LIVE SYSTEM MONITOR</span>
                <div className="monitor-badge">
                  <span className="operational-dot" />
                  <span>OPERATIONAL • SECURE</span>
                </div>
              </div>

              <div className="monitor-rows-list">
                <div className="monitor-row">
                  <div className="row-left">
                    <span className="row-icon">⊞</span>
                    <div className="row-texts">
                      <span className="row-name">Platform Core</span>
                      <span className="row-sub">Latency: {latency} ms</span>
                    </div>
                  </div>
                  <div className="row-status">
                    <span className="operational-dot" />
                    <span>Operational</span>
                  </div>
                </div>

                <div className="monitor-row">
                  <div className="row-left">
                    <span className="row-icon">◉</span>
                    <div className="row-texts">
                      <span className="row-name">Identity Service (DID)</span>
                      <span className="row-sub">Gov Credential OK</span>
                    </div>
                  </div>
                  <div className="row-status">
                    <span className="operational-dot" />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="monitor-row">
                  <div className="row-left">
                    <span className="row-icon">⬡</span>
                    <div className="row-texts">
                      <span className="row-name">Blockchain Trust Chain</span>
                      <span className="row-sub">Block #{blockHeight.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="row-status">
                    <span className="operational-dot" />
                    <span>Synced</span>
                  </div>
                </div>

                <div className="monitor-row">
                  <div className="row-left">
                    <span className="row-icon">◫</span>
                    <div className="row-texts">
                      <span className="row-name">Evidence Store</span>
                      <span className="row-sub">1,096 Anchored</span>
                    </div>
                  </div>
                  <div className="row-status">
                    <span className="operational-dot" />
                    <span>Healthy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Government / Trust Panel with Tricolor Accent */}
            <div className="home-gov-trust-card">
              {/* Restrained Tricolor Bar */}
              <div className="tricolor-accent-bar" />

              <div className="gov-card-body">
                <div className="gov-insignia">
                  {/* Clean Neutral Defence Crest */}
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2L4 5V11C4 16.52 7.41 21.61 12 23C16.59 21.61 20 16.52 20 11V5L12 2Z"
                      stroke="#2563eb"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="11.5" r="3.5" stroke="#2563eb" strokeWidth="1.5" />
                    <path d="M12 8V15M8.5 11.5H15.5" stroke="#2563eb" strokeWidth="1.2" />
                  </svg>
                </div>
                <div className="gov-texts">
                  <div className="gov-title">DEFENCE INNOVATION FOR A SELF-RELIANT INDIA</div>
                  <div className="gov-motto">BHARAT • SURAKSHIT • SAMPANN • SASHAKT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECONDARY SECTIONS: STATS & PLATFORM ARCHITECTURE
          ═══════════════════════════════════════════════════════════ */}
      <section id="platform" className="home-stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-number font-display">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-note">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM MICRO FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <div className="home-micro-footer">
        <div className="micro-footer-line-1">
          NOVEXA DEFENCE TRUST &nbsp;|&nbsp; DIGITAL INDIA &nbsp;|&nbsp; ATMANIRBHAR BHARAT
        </div>
        <div className="micro-footer-line-2">
          SECURE • VERIFIABLE • ACCOUNTABLE • FOR A SAFER TOMORROW
        </div>
      </div>

      <PublicFooter />

      {/* ═══════════════════════════════════════════════════════════
          OVERVIEW MODAL (WHEN CLICKING WATCH OVERVIEW)
          ═══════════════════════════════════════════════════════════ */}
      {showOverviewModal && (
        <div className="overview-modal-backdrop" onClick={() => setShowOverviewModal(false)}>
          <div className="overview-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.1rem", color: "#2563eb" }}>◈</span>
                <span className="font-display" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                  NOVEXA DEFENCE TRUST OVERVIEW
                </span>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowOverviewModal(false)}
                style={{ fontSize: "1.2rem", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-callout">
                <div style={{ fontWeight: 700, color: "#2563eb", marginBottom: 4 }}>
                  Smart India Hackathon 2026 · PS 26125
                </div>
                <div>
                  Cryptographic Trust Infrastructure for Defence Component Life-cycle, Non-transferable NFT Certification, and Investigator Audit Trails.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
                <div className="overview-feature-box">
                  <div style={{ fontWeight: 600, color: "var(--foreground)" }}>1. Identity & RBAC</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: 4 }}>
                    Strict 4-role boundaries (Admin, NFT Creator, Technician, Auditor) with decentralized DIDs.
                  </div>
                </div>
                <div className="overview-feature-box">
                  <div style={{ fontWeight: 600, color: "var(--foreground)" }}>2. Evidence Integrity</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: 4 }}>
                    Automatic SHA-256 cryptographic hashing anchored onto the blockchain ledger.
                  </div>
                </div>
                <div className="overview-feature-box">
                  <div style={{ fontWeight: 600, color: "var(--foreground)" }}>3. Non-Transferable NFTs</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: 4 }}>
                    Permanent proof of inspection and acceptance for national security equipment.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowOverviewModal(false)}
                >
                  Close
                </button>
                <Link
                  to="/login"
                  className="btn-primary"
                  onClick={() => setShowOverviewModal(false)}
                >
                  Enter Platform →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
