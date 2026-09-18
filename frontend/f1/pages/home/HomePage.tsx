import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import "./HomePage.css";

const TRUST_CHAIN = [
  { name: "Identity", desc: "Cryptographic DID & role credential verification" },
  { name: "Role", desc: "Strict RBAC permission boundaries enforced" },
  { name: "Permission", desc: "Granular authorization per defence operation" },
  { name: "Asset", desc: "Hardware serial, batch code & supplier declaration" },
  { name: "Evidence", desc: "SHA-256 integrity fingerprinting & storage" },
  { name: "Lifecycle", desc: "10-stage physical inspection progression" },
  { name: "Certification", desc: "Non-transferable immutable NFT issuance" },
  { name: "Blockchain", desc: "Distributed ledger consensus & block anchoring" },
  { name: "Audit", desc: "Tamper-evident chronological investigator logs" },
  { name: "Verification", desc: "Cryptographic proof validation for assembly" },
];

const FEATURES = [
  {
    icon: "◉",
    title: "Role-Based Access Control",
    desc: "Four defined roles — Admin, NFT Creator, Technician, Auditor — each with explicit permissions. No user can exceed their role boundary.",
    color: "#ef4444",
  },
  {
    icon: "◷",
    title: "Asset Lifecycle Management",
    desc: "Track every defence asset from UNREGISTERED through SUPPLIER_DECLARED, RECEIVED, INSPECTION_RECORDED, and ACCEPTED_FOR_ASSEMBLY or REJECTED_QUARANTINED.",
    color: "#f59e0b",
  },
  {
    icon: "◫",
    title: "Evidence Integrity",
    desc: "Every evidence file is fingerprinted with SHA-256 and anchored on-chain. Any tampering is immediately detectable and flagged.",
    color: "#3b82f6",
  },
  {
    icon: "◆",
    title: "Blockchain-Backed Certification",
    desc: "Non-transferable NFT certifications serve as permanent, immutable records of the certification state of each asset batch.",
    color: "#8b5cf6",
  },
  {
    icon: "≡",
    title: "Audit Verification",
    desc: "Every action logged with actor identity, role, timestamp, evidence, and blockchain reference. Full investigation capability for auditors.",
    color: "#22c55e",
  },
  {
    icon: "⊛",
    title: "Cryptographic Identity",
    desc: "Each user carries a Decentralised Identifier (DID) and verified credential. All actions are traceable to a verified actor.",
    color: "#60a5fa",
  },
];

const STATS = [
  { value: "847", label: "Assets Registered", note: "Synthetic demo data" },
  { value: "312", label: "Certifications Issued", note: "On-chain confirmed" },
  { value: "2,411", label: "Blockchain Transactions", note: "NOVEXA-TRUST-CHAIN" },
  { value: "1,096", label: "Evidence Records Verified", note: "Fingerprint integrity" },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Identity Assignment",
    desc: "Every platform user receives a unique DID and verified credential. Access is governed by assigned role.",
  },
  {
    n: "02",
    title: "Asset Registration",
    desc: "Technician registers the defence asset with full metadata, batch reference, and supplier declaration.",
  },
  {
    n: "03",
    title: "Evidence Capture",
    desc: "Technical evidence is uploaded. A SHA-256 fingerprint is generated and anchored to the blockchain.",
  },
  {
    n: "04",
    title: "Certification Minting",
    desc: "NFT Creator reviews eligible assets, verifies evidence, and mints a non-transferable certification NFT on-chain.",
  },
  {
    n: "05",
    title: "Audit Verification",
    desc: "Auditor searches any asset, inspects its full history, verifies evidence integrity, and confirms the blockchain record.",
  },
];

const STRATEGIC_NODES = [
  { id: "delhi", name: "DRDO HQ", city: "New Delhi", x: 440, y: 175, type: "command" },
  { id: "leh", name: "Northern Command", city: "Ladakh", x: 425, y: 95, type: "forward" },
  { id: "mumbai", name: "Western Naval Cmd", city: "Mumbai", x: 345, y: 350, type: "naval" },
  { id: "pune", name: "ARDE Defence R&D", city: "Pune", x: 360, y: 380, type: "lab" },
  { id: "bengaluru", name: "ISRO / BEL HQ", city: "Bengaluru", x: 420, y: 495, type: "aerospace" },
  { id: "hyderabad", name: "DRDL Missile Complex", city: "Hyderabad", x: 445, y: 385, type: "missile" },
  { id: "vizag", name: "Eastern Naval Cmd", city: "Visakhapatnam", x: 530, y: 395, type: "naval" },
  { id: "kolkata", name: "Eastern Command", city: "Kolkata", x: 605, y: 280, type: "command" },
  { id: "kochi", name: "Southern Naval Cmd", city: "Kochi", x: 395, y: 555, type: "naval" },
  { id: "chennai", name: "CVRDE / Heavy Armament", city: "Chennai", x: 460, y: 500, type: "lab" },
];

export default function HomePage() {
  // ─── Subtle Mouse Parallax on Background Only (< 16px) ───
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24; // max ~12px
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 18; // max ~9px
    setParallax({ x, y });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  // ─── Live Telemetry Simulation (Visual Only, No Backend) ───
  const [latency, setLatency] = useState(12);
  const [blockHeight, setBlockHeight] = useState(4892108);
  const [azimuth, setAzimuth] = useState("042°");
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    // Latency ticker: 11ms -> 13ms -> 12ms -> 10ms
    const latencyInterval = setInterval(() => {
      setLatency(prev => {
        const variants = [10, 11, 12, 13, 11, 12];
        const nextIdx = (variants.indexOf(prev) + 1) % variants.length;
        return variants[nextIdx];
      });
    }, 2800);

    // Block height incremental ticker
    const blockInterval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 4500);

    // Radar azimuth rotation angle ticker
    const azAngles = ["042°", "068°", "115°", "184°", "240°", "312°", "358°"];
    let azIdx = 0;
    const azInterval = setInterval(() => {
      azIdx = (azIdx + 1) % azAngles.length;
      setAzimuth(azAngles[azIdx]);
    }, 1500);

    return () => {
      clearInterval(latencyInterval);
      clearInterval(blockInterval);
      clearInterval(azInterval);
    };
  }, []);

  // ─── Scroll Reveal Observer ───
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} ref={heroRef}>
      <PublicNavbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO ANIMATED BACKGROUND: 7 DEFENCE-TECH ATMOSPHERIC LAYERS
          (Affected smoothly by mouse parallax, capped under 15px)
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="home-parallax-bg"
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
        }}
      >
        {/* Layer 6 — Aurora Atmosphere */}
        <div className="home-aurora-container">
          <div className="home-aurora-glow home-aurora-1" />
          <div className="home-aurora-glow home-aurora-2" />
          <div className="home-aurora-glow home-aurora-3" />
        </div>

        {/* Layer 1 — Living Defence Grid */}
        <div className="home-defence-grid" />
        <div className="home-grid-crosshairs" />

        {/* Layer 7 — Tactical Scan Sweep Bar */}
        <div className="home-scan-sweep-bar" />

        {/* Layer 2 & Layer 3 — Digital India Network Map & Satellite Orbit System */}
        <div className="home-india-network-stage">
          <svg className="home-india-svg" viewBox="0 0 1000 680" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="indiaGridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
              </linearGradient>
              <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Layer 3 — Orbital System Ellipse & Guide */}
            <ellipse
              cx="470"
              cy="360"
              rx="330"
              ry="125"
              transform="rotate(-24 470 360)"
              fill="none"
              className="home-orbit-ring"
            />
            <ellipse
              cx="470"
              cy="360"
              rx="332"
              ry="127"
              transform="rotate(-24 470 360)"
              fill="none"
              stroke="rgba(56, 189, 248, 0.12)"
              strokeWidth="1"
            />

            {/* Orbiting Defence Satellite */}
            <g className="home-satellite-group">
              {/* Satellite located at orbit tangent */}
              <g transform="translate(730, 235)">
                {/* Concentric Radiating Signal Waves */}
                <circle cx="0" cy="0" r="4" fill="none" stroke="#38bdf8" strokeWidth="1" className="satellite-signal-wave" />
                <circle cx="0" cy="0" r="10" fill="none" stroke="#60a5fa" strokeWidth="0.8" style={{ animation: "signalWaveRipple 3s ease-out 1s infinite" }} />
                <circle cx="0" cy="0" r="16" fill="none" stroke="#2563eb" strokeWidth="0.5" style={{ animation: "signalWaveRipple 3s ease-out 2s infinite" }} />

                {/* Satellite Body & Solar Panels */}
                <rect x="-4" y="-3" width="8" height="6" fill="#f8fafc" stroke="#38bdf8" strokeWidth="0.8" rx="1" />
                {/* Left Solar Wing */}
                <rect x="-18" y="-4" width="11" height="8" fill="rgba(56, 189, 248, 0.4)" stroke="#38bdf8" strokeWidth="0.6" rx="1" />
                <line x1="-12.5" y1="-4" x2="-12.5" y2="4" stroke="#60a5fa" strokeWidth="0.5" />
                {/* Right Solar Wing */}
                <rect x="7" y="-4" width="11" height="8" fill="rgba(56, 189, 248, 0.4)" stroke="#38bdf8" strokeWidth="0.6" rx="1" />
                <line x1="12.5" y1="-4" x2="12.5" y2="4" stroke="#60a5fa" strokeWidth="0.5" />
                {/* Antenna Dish */}
                <line x1="0" y1="3" x2="0" y2="7" stroke="#94a3b8" strokeWidth="0.8" />
                <circle cx="0" cy="8" r="1.5" fill="#38bdf8" filter="url(#cyanGlow)" />
              </g>
            </g>

            {/* Layer 2 — Tactical India Network Contour (Geometric Subcontinent Polyline) */}
            <path
              d="M 425 90 
                 L 460 115 L 450 145 L 485 160 L 515 170 L 575 195 L 610 215 
                 L 660 210 L 690 230 L 670 270 L 635 275 L 600 305 L 565 340 
                 L 540 380 L 525 435 L 490 490 L 460 540 L 435 590 L 415 620 
                 L 395 565 L 365 480 L 335 405 L 330 350 L 315 325 L 300 280 
                 L 320 240 L 350 210 L 380 180 L 390 140 L 410 110 Z"
              fill="url(#indiaGridGrad)"
              stroke="rgba(56, 189, 248, 0.45)"
              strokeWidth="1.4"
              strokeDasharray="4 4"
            />

            {/* Secondary Inter-State Defence Grid Vectors */}
            <path
              d="M 425 90 L 440 175 L 345 350 L 420 495 L 435 590 L 530 395 L 605 280 L 440 175"
              stroke="rgba(37, 99, 235, 0.3)"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M 440 175 L 445 385 L 420 495 M 345 350 L 445 385 L 530 395 M 440 175 L 530 395"
              className="vector-line-active"
              stroke="rgba(56, 189, 248, 0.45)"
              strokeWidth="1.2"
              fill="none"
            />

            {/* Travelling Data Packets Along Vectors */}
            <circle cx="440" cy="175" r="3" fill="#38bdf8" filter="url(#cyanGlow)">
              <animateMotion
                path="M 0 0 L 5 210 L -25 320"
                dur="7s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="345" cy="350" r="3" fill="#60a5fa" filter="url(#cyanGlow)">
              <animateMotion
                path="M 0 0 L 100 35 L 185 45"
                dur="6s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="605" cy="280" r="2.5" fill="#22c55e" filter="url(#cyanGlow)">
              <animateMotion
                path="M 0 0 L -75 115 L -160 105"
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Strategic Defence Nodes & Glowing Pulse Rings */}
            {STRATEGIC_NODES.map((node) => (
              <g key={node.id} className="strategic-node" transform={`translate(${node.x}, ${node.y})`}>
                <circle cx="0" cy="0" r="4" fill="none" stroke="#38bdf8" className="node-pulse-ring" />
                <circle cx="0" cy="0" r="3.5" fill={node.type === "command" ? "#22c55e" : "#38bdf8"} filter="url(#cyanGlow)" />
                <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                <text
                  x="7"
                  y="3"
                  fill="rgba(148, 163, 184, 0.7)"
                  fontSize="7.5"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  letterSpacing="0.05em"
                >
                  {node.name}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Layer 4 — Floating Defence Asset Silhouettes */}
        <div className="home-defence-assets-layer">
          {/* Multirole Stealth Fighter Aircraft (AMCA/Tejas Concept) */}
          <div className="defence-asset-silhouette asset-fighter" title="Airborne Defence Asset · Stealth CAP">
            <svg viewBox="0 0 100 55" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 94 27 L 60 15 L 42 3 L 34 8 L 40 18 L 12 21 L 4 14 L 2 27 L 4 40 L 12 33 L 40 36 L 34 46 L 42 51 L 60 39 Z"
                fill="rgba(56, 189, 248, 0.3)"
                stroke="rgba(56, 189, 248, 0.75)"
                strokeWidth="1.2"
              />
              <line x1="40" y1="27" x2="88" y2="27" stroke="rgba(96, 165, 250, 0.9)" strokeWidth="1" />
              <circle cx="92" cy="27" r="1.5" fill="#38bdf8" />
            </svg>
          </div>

          {/* Naval Carrier Silhouette (INS Vikrant Concept) */}
          <div className="defence-asset-silhouette asset-carrier" title="Maritime Asset · Carrier Task Force">
            <svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 8 36 L 148 36 L 156 24 L 12 24 Z"
                fill="rgba(37, 99, 235, 0.3)"
                stroke="rgba(56, 189, 248, 0.7)"
                strokeWidth="1.2"
              />
              {/* Flight Deck Superstructure Island */}
              <rect x="85" y="14" width="22" height="10" fill="rgba(56, 189, 248, 0.35)" stroke="#38bdf8" strokeWidth="1" />
              <line x1="96" y1="8" x2="96" y2="14" stroke="#60a5fa" strokeWidth="1.2" />
              <line x1="92" y1="8" x2="100" y2="8" stroke="#60a5fa" strokeWidth="1" />
              {/* Runway markings */}
              <line x1="20" y1="30" x2="140" y2="30" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.8" strokeDasharray="6 6" />
            </svg>
          </div>

          {/* Tactical Combat UAV Drone Silhouette (Tapas / Ghatak Wing) */}
          <div className="defence-asset-silhouette asset-drone" title="Unmanned Aerial Asset · Recon UAV">
            <svg viewBox="0 0 90 45" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 45 6 L 82 34 L 70 38 L 54 28 L 45 32 L 36 28 L 20 38 L 8 34 Z"
                fill="rgba(56, 189, 248, 0.28)"
                stroke="rgba(56, 189, 248, 0.7)"
                strokeWidth="1.2"
              />
              <circle cx="45" cy="18" r="2" fill="#38bdf8" />
            </svg>
          </div>

          {/* Phased Array Radar Installation Silhouette */}
          <div className="defence-asset-silhouette asset-radar" title="BEL Tactical Radar Array">
            <svg viewBox="0 0 70 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 15 54 L 35 22 L 55 54 Z" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1.2" fill="rgba(37, 99, 235, 0.15)" />
              <line x1="25" y1="38" x2="45" y2="38" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1" />
              {/* Radar Dish */}
              <path d="M 18 16 Q 35 28 52 16" stroke="#38bdf8" strokeWidth="1.8" fill="none" />
              <line x1="35" y1="22" x2="35" y2="10" stroke="#60a5fa" strokeWidth="1.2" />
              <circle cx="35" cy="8" r="2" fill="#22c55e" />
            </svg>
          </div>
        </div>

        {/* Layer 5 — Encrypted Blockchain Flow Streams */}
        <div className="home-blockchain-streams">
          <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="none" fill="none">
            <path
              d="M 50 150 Q 300 120 600 240 T 1150 200"
              stroke="rgba(56, 189, 248, 0.2)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <path
              d="M 100 480 Q 400 420 750 490 T 1100 430"
              stroke="rgba(37, 99, 235, 0.2)"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
          </svg>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HERO MAIN CONTENT SECTION
          (Staggered Entrance Animation & Commands)
          ═══════════════════════════════════════════════════════════ */}
      <section className="home-hero-section">
        {/* Left Column: Heading, Value Props & Actions */}
        <div>
          {/* Stagger Sequence Item 1: SIH 2026 Badge */}
          <div className="home-sih-badge">
            <span className="operational-dot" />
            NOVEXA DEFENCE TRUST · PS 26125 · SYNTHETIC DEMO
          </div>

          {/* Stagger Sequence Item 2: Staggered Title Lines */}
          <h1 className="home-hero-title">
            <span className="home-title-line home-title-line-1">BLOCKCHAIN-BASED</span>
            <span className="home-title-line home-title-line-2">SECURE PLATFORM</span>
            <span className="home-title-line home-title-line-3">FOR DEFENCE ASSETS</span>
          </h1>

          {/* Stagger Sequence Item 3: Mission Description */}
          <p className="home-hero-desc">
            Identity-verified, role-governed, evidence-backed, and blockchain-certified asset management
            for defence component records. Every action traceable. Every claim verifiable.
          </p>

          {/* Stagger Sequence Item 4: CTA Action Buttons */}
          <div className="home-cta-group">
            <Link to="/login" className="home-primary-btn">
              <span>Access Platform</span>
              <span className="home-btn-arrow">→</span>
            </Link>
            <a href="#how-it-works" className="home-secondary-btn">
              <span>How It Works</span>
            </a>
          </div>

          {/* Stagger Sequence Item 5: Defence Trust 10-Stage Lifecycle Progression */}
          <div className="home-lifecycle-container">
            <div className="home-lifecycle-title">
              <span>DEFENCE TRUST LIFECYCLE PROGRESSION</span>
              <span style={{ color: "#38bdf8", fontWeight: 600 }}>10 STAGES</span>
            </div>
            <div className="home-lifecycle-track">
              <div className="home-lifecycle-pulse-bar" />
              {TRUST_CHAIN.map((item, i) => (
                <span
                  key={item.name}
                  className="home-lifecycle-item"
                  onMouseEnter={() => setActiveTooltip(item.name)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  title={item.desc}
                >
                  <span className="home-lifecycle-text">{item.name}</span>
                  {i < TRUST_CHAIN.length - 1 && (
                    <span className="home-lifecycle-arrow">→</span>
                  )}
                </span>
              ))}
            </div>
            {activeTooltip && (
              <div style={{ marginTop: 6, fontSize: "0.6875rem", color: "#60a5fa", fontStyle: "italic" }}>
                Stage: {TRUST_CHAIN.find(t => t.name === activeTooltip)?.desc}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upgraded Tactical Radar & Live System Monitor */}
        <div className="home-visual-stage">
          {/* Tactical Radar Display with Live Telemetry */}
          <div className="home-radar-box">
            <div className="home-radar-telemetry">
              <span className="operational-dot" style={{ width: 5, height: 5 }} />
              <span>TEL: NX-770 · SCAN: 360° · AZ: {azimuth}</span>
            </div>
            <div className="home-radar-tag">STATUS: ACTIVE</div>

            <div className="home-radar-scope">
              <div className="home-radar-ring home-radar-ring-1" />
              <div className="home-radar-ring home-radar-ring-2" />
              <div className="home-radar-ring home-radar-ring-3" />
              <div className="home-radar-ring home-radar-ring-4" />
              <div className="home-radar-axis-h" />
              <div className="home-radar-axis-v" />
              <div className="home-radar-sweep-beam" />
              <div className="home-radar-center" />
              <div className="home-blip home-blip-1" title="Target Alpha (Sector 1)" />
              <div className="home-blip home-blip-2" title="Sensor Array (Sector 3)" />
              <div className="home-blip home-blip-3" title="Node Relay (Sector 4)" />
              <div className="home-radar-target-lock" title="Target Lock Engaged" />
            </div>

            {/* Monitored Stealth Defence Asset EF-2026 */}
            <div className="home-aircraft-drift" title="Monitored Defence Asset EF-2026">
              <svg className="home-aircraft-svg" viewBox="0 0 70 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 66 20 L 16 7 L 22 17 L 3 18 L 3 22 L 22 23 L 16 33 Z"
                  fill="rgba(56, 189, 248, 0.35)"
                  stroke="rgba(56, 189, 248, 0.8)"
                  strokeWidth="1.2"
                />
                <line x1="22" y1="20" x2="62" y2="20" stroke="rgba(96, 165, 250, 0.9)" strokeWidth="1" />
                <circle cx="64" cy="20" r="1.5" fill="#38bdf8" />
              </svg>
            </div>
          </div>

          {/* Blockchain Verification Timeline SVG Bus */}
          <div className="home-blockchain-bus">
            <svg className="home-bc-svg" viewBox="0 0 400 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path className="home-bc-path" d="M 40 25 L 120 25 L 200 25 L 280 25 L 360 25" />
              <path className="home-bc-pulse" d="M 40 25 L 120 25 L 200 25 L 280 25 L 360 25" />
              {[
                { x: 40, label: "ASSET", tooltip: "Technician registers hardware & batch specs" },
                { x: 120, label: "VERIFY", tooltip: "SHA-256 automated fingerprint verification" },
                { x: 200, label: "BLOCKCHAIN", tooltip: "Non-transferable certification NFT anchored" },
                { x: 280, label: "AUDIT", tooltip: "Immutable actor & timestamp log inspectable" },
                { x: 360, label: "TRUST", tooltip: "Certified mission-ready defence asset verified" },
              ].map((node) => (
                <g key={node.label} className="home-bc-node-group">
                  <title>{node.tooltip}</title>
                  <circle cx={node.x} cy="25" r="4.5" fill="#2563eb" />
                  <circle cx={node.x} cy="25" r="8" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1" fill="none" />
                  <text
                    x={node.x}
                    y="44"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="600"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Live System Monitor Card with Ticking Metrics */}
          <div className="home-status-monitor">
            <div className="home-monitor-header">
              <div className="section-label" style={{ margin: 0, color: "#64748b" }}>
                LIVE SYSTEM MONITOR
              </div>
              <span style={{ fontSize: "0.6875rem", color: "#22c55e", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <span className="operational-dot" />
                OPERATIONAL · ENCRYPTED
              </span>
            </div>

            {[
              { label: "Platform Core", status: "Operational", ok: true, metric: `Latency: ${latency} ms` },
              { label: "Identity Service (DID)", status: "Verified", ok: true, metric: "Gov Credential OK" },
              { label: "Blockchain Trust Chain", status: "Synced", ok: true, metric: `Block #${blockHeight.toLocaleString()}` },
              { label: "Evidence Store", status: "Healthy", ok: true, metric: "1,096 Anchored" },
              { label: "Audit Ledger", status: "Active", ok: true, metric: "Integrity 100%" },
            ].map((row) => (
              <div key={row.label} className="home-monitor-row">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.8125rem", color: "#cbd5e1" }}>{row.label}</span>
                  <span style={{ fontSize: "0.65rem", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                    {row.metric}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: row.ok ? "#22c55e" : "#ef4444",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span className="operational-dot" style={{ width: 6, height: 6 }} />
                  {row.status}
                </span>
              </div>
            ))}

            {/* Synthetic Asset Example Card with Live Verify Animation */}
            <div className="home-asset-card">
              <div className="home-asset-top">
                <span className="section-label" style={{ margin: 0, color: "#64748b", fontSize: "0.625rem" }}>
                  SYNTHETIC ASSET VERIFICATION
                </span>
                <span className="home-asset-verify-tag">
                  ✓ VERIFIED ON-CHAIN
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="meta-id" style={{ color: "#f8fafc", fontSize: "0.8125rem", fontWeight: 600 }}>
                    EF-2026-00421
                  </span>
                  <span style={{ fontSize: "0.6875rem", color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace" }}>
                    SHA-256 MATCHED
                  </span>
                </div>
                <div style={{ color: "#cbd5e1" }}>Electronic Fuze · EF-BATCH-2026-017</div>
                <div style={{ color: "#64748b", fontSize: "0.6875rem" }}>
                  Accepted for Assembly · Certified by DRDO-QA-03
                </div>
              </div>
            </div>
          </div>

          {/* 4 Tactical Core Pillars */}
          <div className="home-pillars-grid">
            {[
              { label: "RBAC Enforced", icon: "◉", color: "#ef4444" },
              { label: "Evidence Fingerprinted", icon: "◫", color: "#38bdf8" },
              { label: "On-Chain Certified", icon: "◆", color: "#8b5cf6" },
              { label: "Audit Immutable", icon: "≡", color: "#22c55e" },
            ].map((item) => (
              <div key={item.label} className="home-pillar-card">
                <span style={{ color: item.color, fontSize: "1.1rem" }}>{item.icon}</span>
                <span style={{ fontSize: "0.75rem", color: "#cbd5e1", fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Section (Scroll Reveal) ─── */}
      <section id="platform" className="reveal-on-scroll" style={{ background: "#050d1a", padding: "64px 24px", borderTop: "1px solid #152b4a", borderBottom: "1px solid #152b4a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 1,
              background: "#152b4a",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {STATS.map((s) => (
              <div key={s.label} className="home-stat-box">
                <div
                  className="font-display"
                  style={{ fontSize: "2.5rem", fontWeight: 700, color: "#f8fafc", marginBottom: 4, letterSpacing: "0.01em" }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#94a3b8", fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: 4 }}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Platform Capabilities Section (Scroll Reveal) ─── */}
      <section id="roles" className="reveal-on-scroll" style={{ padding: "84px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div className="section-label" style={{ marginBottom: 8, color: "#38bdf8" }}>PLATFORM CAPABILITIES</div>
            <h2
              className="font-display"
              style={{ fontSize: "2.25rem", fontWeight: 700, color: "#f8fafc", margin: 0, letterSpacing: "0.02em" }}
            >
              Built for Trust, Designed for National Defence Clarity
            </h2>
            <p style={{ color: "#94a3b8", marginTop: 8, maxWidth: 580, lineHeight: 1.6 }}>
              Every capability answers one critical mission question: who did what, on which defence asset, with what evidence, under which cryptographic authorization?
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="home-feature-card">
                <div
                  style={{
                    width: 42,
                    height: 42,
                    background: f.color + "18",
                    border: `1px solid ${f.color}35`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    color: f.color,
                    marginBottom: 16,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  className="font-display"
                  style={{ fontSize: "1.15rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 8px", letterSpacing: "0.02em" }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Workflow Sequence Section (Scroll Reveal) ─── */}
      <section id="how-it-works" className="reveal-on-scroll" style={{ background: "#050d1a", padding: "84px 24px", borderTop: "1px solid #152b4a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div className="section-label" style={{ marginBottom: 8, color: "#38bdf8" }}>WORKFLOW SEQUENCE</div>
            <h2
              className="font-display"
              style={{ fontSize: "2.25rem", fontWeight: 700, color: "#f8fafc", margin: 0, letterSpacing: "0.02em" }}
            >
              From Registration to Verified Defence Record
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1, background: "#152b4a" }} />
            {HOW_STEPS.map((step, i) => (
              <div
                key={step.n}
                style={{
                  display: "flex",
                  gap: 24,
                  paddingLeft: 52,
                  paddingBottom: i < HOW_STEPS.length - 1 ? 32 : 0,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    top: 0,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: 900,
                    color: "#fff",
                    boxShadow: "0 0 10px rgba(37, 99, 235, 0.4)",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div
                    className="font-display"
                    style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f8fafc", letterSpacing: "0.04em", marginBottom: 6 }}
                  >
                    {step.title}
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.6, margin: 0, maxWidth: 580 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Role System Section (Scroll Reveal) ─── */}
      <section id="blockchain" className="reveal-on-scroll" style={{ padding: "84px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div className="section-label" style={{ marginBottom: 8, color: "#38bdf8" }}>ROLE GOVERNANCE</div>
            <h2 className="font-display" style={{ fontSize: "2.25rem", fontWeight: 700, color: "#f8fafc", margin: 0, letterSpacing: "0.02em" }}>
              Four Roles. Complete Mission Accountability.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 }}>
            {[
              {
                role: "Administrator", color: "#ef4444", icon: "⊛",
                mental: "Control, governance and system oversight.",
                can: ["Manage users & roles", "Monitor all assets", "Review audit logs", "Configure system"],
              },
              {
                role: "NFT Creator", color: "#8b5cf6", icon: "◆",
                mental: "Review eligible records and create trusted digital certification.",
                can: ["Review eligible assets", "Verify evidence", "Mint certifications", "Monitor blockchain"],
              },
              {
                role: "Technician", color: "#f59e0b", icon: "◈",
                mental: "Create and maintain accurate technical records.",
                can: ["Register assets", "Upload evidence", "Record inspections", "Update lifecycle"],
              },
              {
                role: "Auditor", color: "#22c55e", icon: "◎",
                mental: "Investigate and verify.",
                can: ["Search all assets", "Verify evidence integrity", "Inspect blockchain proof", "Review audit trail"],
              },
            ].map((r) => (
              <div
                key={r.role}
                className="home-role-card"
                style={{ borderTop: `2px solid ${r.color}` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: "1.25rem", color: r.color }}>{r.icon}</span>
                  <span
                    className="font-display"
                    style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f8fafc", letterSpacing: "0.04em" }}
                  >
                    {r.role.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.5, marginBottom: 16, fontStyle: "italic" }}>
                  "{r.mental}"
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {r.can.map((c) => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", color: "#94a3b8" }}>
                      <span style={{ color: r.color, fontSize: "0.625rem", fontWeight: 700 }}>✓</span> {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Call To Action Section (Scroll Reveal) ─── */}
      <section id="security" className="reveal-on-scroll" style={{ background: "#050d1a", padding: "92px 24px", borderTop: "1px solid #152b4a" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label" style={{ marginBottom: 12, textAlign: "center", color: "#38bdf8" }}>ACCESS THE PLATFORM</div>
          <h2
            className="font-display"
            style={{ fontSize: "2.5rem", fontWeight: 700, color: "#f8fafc", marginBottom: 16, letterSpacing: "0.02em" }}
          >
            Sign In to Your Role Dashboard
          </h2>
          <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 34 }}>
            Access is governed by your assigned role. Sign in with your identity credentials to enter the platform.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/login" className="home-primary-btn" style={{ fontSize: "0.95rem", padding: "13px 32px" }}>
              <span>Sign In to Platform</span>
              <span className="home-btn-arrow">→</span>
            </Link>
          </div>
          <p style={{ marginTop: 22, fontSize: "0.75rem", color: "#475569" }}>
            Synthetic demonstration data · Non-classified · Smart India Hackathon 2026
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
