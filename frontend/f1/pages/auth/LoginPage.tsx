import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

// Photorealistic 3D Defence Assets (Cool Blue / Cyan Palette)
import earthPanoramicImg from "./assets/earth_panoramic.jpg";
import satelliteImg from "./assets/satellite_3d.png";
import fighterImg from "./assets/fighter_3d.png";
import fighterEscortImg from "./assets/fighter_escort_3d.png";
import navalShipImg from "./assets/naval_ship_3d.png";

interface DemoAccount {
  id: string;
  name: string;
  role: string;
  rolePillClass: string;
  email: string;
  password: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "admin",
    name: "Arjun Mehta",
    role: "ADMIN",
    rolePillClass: "pill-admin",
    email: "a.mehta@bel-defence.in",
    password: "password",
  },
  {
    id: "creator",
    name: "Priya Sharma",
    role: "CREATOR",
    rolePillClass: "pill-creator",
    email: "p.sharma@bel-defence.in",
    password: "password",
  },
  {
    id: "tech",
    name: "Rajesh Kumar",
    role: "TECH",
    rolePillClass: "pill-tech",
    email: "r.kumar@bel-defence.in",
    password: "password",
  },
  {
    id: "auditor",
    name: "Deepa Nair",
    role: "AUDITOR",
    rolePillClass: "pill-auditor",
    email: "d.nair@bel-defence.in",
    password: "password",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("demo");
  const [password, setPassword] = useState("demo");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = ((e.clientX / innerWidth) - 0.5) * 2;
    const y = ((e.clientY / innerHeight) - 0.5) * 2;
    const root = e.currentTarget;
    root.style.setProperty("--mouse-x", x.toFixed(3));
    root.style.setProperty("--mouse-y", y.toFixed(3));
  };

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch (err: any) {
      setError(err?.message || err?.data?.detail || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const selectDemoAccount = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedRole(account.id);
  };

  return (
    <div className="login-page" onMouseMove={handleMouseMove}>
      {/* ─── ATMOSPHERIC BACKGROUND (COOL PALETTE: NAVY / CYAN / BLUE) ─── */}
      <div className="cmd-background-layer">
        <div className="cmd-space-gradient" />
        <div className="cmd-cyan-nebula-glow" />
        <div className="cmd-ocean-gradient" />
        <div
          className="cmd-stars-canvas"
          style={{ transform: "translate(calc(var(--mouse-x, 0) * 3px), calc(var(--mouse-y, 0) * 3px))" }}
        />
        <div className="cmd-grid-overlay" />
      </div>

      {/* ─── TOP BAR: BRANDING & KAVACH ACCESS ─── */}
      <header className="cmd-topbar">
        <Link to="/" className="cmd-brand-group">
          <div className="cmd-brand-icon">NX</div>
          <div className="cmd-brand-text">
            <span className="cmd-brand-title">NOVEXA</span>
            <span className="cmd-brand-subtitle">DEFENCE TRUST</span>
          </div>
        </Link>

        <div className="cmd-top-telemetry">
          <div className="cmd-telemetry-line" />
          <span>KAVACH TRUST PLATFORM • SECURE ACCESS</span>
        </div>
      </header>

      {/* ─── MAIN WORKSPACE ─── */}
      <main className="cmd-main-layout">
        {/* ─── LEFT: HERO HEADLINE & FEATURE BLOCKS ─── */}
        <div className="cmd-hero-column">
          <div className="cmd-headline-group">
            <span className="cmd-headline-secure">SECURE</span>
            <span className="cmd-headline-defence">DEFENCE ASSETS</span>
            <span className="cmd-headline-sub">FOR A SAFER TOMORROW</span>
          </div>

          <p className="cmd-headline-desc">
            Blockchain-powered defence asset trust platform ensuring transparency, security and sovereign control.
          </p>

          <div className="cmd-features-list">
            {/* Feature 1 */}
            <div className="cmd-feature-item">
              <div className="cmd-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="cmd-feature-info">
                <span className="cmd-feature-title">Blockchain Verified</span>
                <span className="cmd-feature-sub">Tamper-proof records</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="cmd-feature-item">
              <div className="cmd-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="8" rx="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" />
                  <line x1="6" y1="6" x2="6.01" y2="6" />
                  <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
              </div>
              <div className="cmd-feature-info">
                <span className="cmd-feature-title">Secure Network</span>
                <span className="cmd-feature-sub">End-to-end encryption</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="cmd-feature-item">
              <div className="cmd-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="22" y1="12" x2="18" y2="12" />
                  <line x1="6" y1="12" x2="2" y2="12" />
                  <line x1="12" y1="6" x2="12" y2="2" />
                  <line x1="12" y1="22" x2="12" y2="18" />
                </svg>
              </div>
              <div className="cmd-feature-info">
                <span className="cmd-feature-title">Mission Critical</span>
                <span className="cmd-feature-sub">Built for defence ecosystem</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── CENTER: CINEMATIC DEFENCE ENVIRONMENT (CLEAN 3D LAYERS) ─── */}
        <div className="cmd-scene-center">
          {/* Subtle Cyber Network Arcs */}
          <svg className="cmd-network-arcs-svg" viewBox="0 0 1440 900" fill="none">
            <path className="arc-path" d="M 440 160 C 520 220, 600 290, 640 370" />
            <path className="arc-pulse" d="M 440 160 C 520 220, 600 290, 640 370" />

            <path className="arc-path" d="M 370 260 C 450 300, 540 340, 620 390" />
            <path className="arc-pulse" d="M 370 260 C 450 300, 540 340, 620 390" style={{ animationDelay: "1.8s" }} />

            <path className="arc-path" d="M 860 150 C 800 220, 740 300, 680 390" />
            <path className="arc-pulse" d="M 860 150 C 800 220, 740 300, 680 390" style={{ animationDelay: "2.6s" }} />

            <path className="arc-path" d="M 430 650 C 510 610, 580 540, 620 480" />
            <path className="arc-pulse" d="M 430 650 C 510 610, 580 540, 620 480" style={{ animationDelay: "1.2s" }} />

            <path className="arc-path" d="M 830 650 C 770 600, 720 530, 670 470" />
            <path className="arc-pulse" d="M 830 650 C 770 600, 720 530, 670 470" style={{ animationDelay: "3.2s" }} />

            <circle cx="440" cy="160" r="3.5" fill="#00e5ff" filter="drop-shadow(0 0 6px #00e5ff)" />
            <circle cx="370" cy="260" r="3.5" fill="#00e5ff" filter="drop-shadow(0 0 6px #00e5ff)" />
            <circle cx="860" cy="150" r="3.5" fill="#00e5ff" filter="drop-shadow(0 0 6px #00e5ff)" />
            <circle cx="430" cy="650" r="3.5" fill="#00e5ff" filter="drop-shadow(0 0 6px #00e5ff)" />
            <circle cx="830" cy="650" r="3.5" fill="#00e5ff" filter="drop-shadow(0 0 6px #00e5ff)" />
          </svg>

          {/* 1. Earth Globe System (Hero Centerpiece) */}
          <div
            className="earth-pos-wrapper"
            style={{ transform: "translate(calc(var(--mouse-x, 0) * 6px), calc(var(--mouse-y, 0) * 6px))" }}
          >
            <div className="earth-system">
              {/* Pulsating Atmospheric Glow */}
              <div className="earth-atmosphere" />

              {/* 3D Earth Globe Sphere */}
              <div className="earth-globe">
                {/* Continuous Rotating World Map with India Night City Lights */}
                <div
                  className="earth-texture-rotating"
                  style={{ backgroundImage: `url(${earthPanoramicImg})` }}
                />

                {/* 3D Spherical Light & Deep Shadow Overlay */}
                <div className="earth-spherical-shading" />

                {/* Tactical Longitude / Latitude Rings */}
                <svg className="earth-grid-lines-svg" viewBox="0 0 500 500">
                  <ellipse cx="250" cy="250" rx="245" ry="245" stroke="rgba(0, 229, 255, 0.22)" strokeWidth="1.2" fill="none" />
                  <ellipse cx="250" cy="250" rx="140" ry="245" stroke="rgba(0, 229, 255, 0.12)" strokeWidth="0.8" fill="none" />
                  <ellipse cx="250" cy="250" rx="60" ry="245" stroke="rgba(0, 229, 255, 0.08)" strokeWidth="0.8" fill="none" />
                  <line x1="5" y1="250" x2="495" y2="250" stroke="rgba(0, 229, 255, 0.12)" strokeWidth="0.8" />
                  <line x1="250" y1="5" x2="250" y2="495" stroke="rgba(0, 229, 255, 0.12)" strokeWidth="0.8" />
                </svg>

                {/* Central Floating 3D Glowing "NX" Shield */}
                <div className="earth-nx-shield">
                  <svg viewBox="0 0 100 120" fill="none">
                    <defs>
                      <filter id="nx-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <path
                      d="M 50 6 L 88 22 L 88 64 Q 88 96 50 114 Q 12 96 12 64 L 12 22 Z"
                      fill="rgba(6, 20, 48, 0.9)"
                      stroke="#00e5ff"
                      strokeWidth="3.5"
                      filter="url(#nx-glow-filter)"
                    />
                    <path
                      d="M 50 14 L 80 26 L 80 62 Q 80 88 50 102 Q 20 88 20 62 L 20 26 Z"
                      fill="rgba(0, 160, 255, 0.22)"
                      stroke="rgba(0, 229, 255, 0.65)"
                      strokeWidth="1.5"
                    />
                    <text
                      x="50"
                      y="68"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontFamily="Barlow Condensed, sans-serif"
                      fontWeight="900"
                      fontSize="34"
                      letterSpacing="1.5"
                    >
                      NX
                    </text>
                  </svg>
                </div>
              </div>

              {/* 3D Orbital Rings System */}
              <div className="orbital-ring orbital-ring-1" />
              <div className="orbital-ring orbital-ring-2" />
              <div className="orbital-ring orbital-ring-3">
                <div className="orbit-marker" />
              </div>
            </div>
          </div>

          {/* 2. Communication Satellite Layer (Upper Left) */}
          <div
            className="satellite-pos-wrapper"
            style={{ transform: "translate(calc(var(--mouse-x, 0) * 9px), calc(var(--mouse-y, 0) * 9px))" }}
          >
            <div className="satellite-unit">
              {/* Soft, Thin, Semi-transparent Conical Beam Pulsing towards Earth */}
              <div className="satellite-beam" />

              {/* 3D Rendered Satellite */}
              <img
                src={satelliteImg}
                alt="Defence Communication Satellite"
                className="satellite-img-3d"
              />
            </div>
          </div>

          {/* 3. Stealth Fighter Aircraft Layer (Upper Right) */}
          <div
            className="fighter-pos-wrapper"
            style={{ transform: "translate(calc(var(--mouse-x, 0) * 11px), calc(var(--mouse-y, 0) * 11px))" }}
          >
            <div className="fighter-unit">
              <div className="fighter-contrail contrail-left" />
              <div className="fighter-contrail contrail-right" />

              {/* 3D Rendered Stealth Fighter */}
              <img
                src={fighterImg}
                alt="5th Gen Air Superiority Fighter"
                className="fighter-img-3d"
              />
            </div>
          </div>

          {/* Trailing Escort Wingman Fighter */}
          <div
            className="wingman-pos-wrapper"
            style={{ transform: "translate(calc(var(--mouse-x, 0) * 10px), calc(var(--mouse-y, 0) * 10px))" }}
          >
            <div className="wingman-unit">
              <img
                src={fighterEscortImg}
                alt="Wingman Escort Fighter"
                className="wingman-img-3d"
              />
            </div>
          </div>

          {/* 4. Naval Guided Missile Destroyer Layer (Lower Left Water) */}
          <div
            className="naval-pos-wrapper"
            style={{ transform: "translate(calc(var(--mouse-x, 0) * 7px), calc(var(--mouse-y, 0) * 7px))" }}
          >
            <div className="naval-unit">
              <div className="naval-water-wake" />
              <div className="naval-radar-ping" />

              {/* 3D Rendered Guided Missile Destroyer */}
              <img
                src={navalShipImg}
                alt="Guided Missile Destroyer Warship"
                className="naval-ship-img-3d"
              />
            </div>
          </div>

          {/* 4 Operational Tactical Badges (Clean & Focused) */}
          <div className="cmd-node-badge node-satellite">
            <div className="cmd-node-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="cmd-node-text-group">
              <span className="cmd-node-title">SATELLITE MONITORING</span>
              <span className="cmd-node-sub">GLOBAL COVERAGE</span>
            </div>
          </div>

          <div className="cmd-node-badge node-comm">
            <div className="cmd-node-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="cmd-node-text-group">
              <span className="cmd-node-title">SECURE COMMUNICATION</span>
              <span className="cmd-node-sub">ENCRYPTED NETWORK</span>
            </div>
          </div>

          <div className="cmd-node-badge node-air">
            <div className="cmd-node-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 19 21 12 17 5 21 12 2" />
              </svg>
            </div>
            <div className="cmd-node-text-group">
              <span className="cmd-node-title">AIR DEFENCE</span>
              <span className="cmd-node-sub">MISSION READY</span>
            </div>
          </div>

          <div className="cmd-node-badge node-naval">
            <div className="cmd-node-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="3" />
                <line x1="12" y1="22" x2="12" y2="8" />
                <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
              </svg>
            </div>
            <div className="cmd-node-text-group">
              <span className="cmd-node-title">NAVAL OPERATIONS</span>
              <span className="cmd-node-sub">MARITIME SECURITY</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: STABLE LOGIN CONSOLE ─── */}
        <div className="cmd-console-wrapper">
          <div className="cmd-console-card">
            {/* Corner Tech Brackets */}
            <div className="corner-bracket bracket-tl" />
            <div className="corner-bracket bracket-tr" />
            <div className="corner-bracket bracket-bl" />
            <div className="corner-bracket bracket-br" />

            {/* Console Lockup */}
            <div className="console-header-lockup">
              <div className="console-nx-mini">NX</div>
              <div className="console-header-text">
                <span className="console-header-title">NOVEXA DEFENCE TRUST</span>
                <span className="console-header-sub">KAVACH TRUST PLATFORM • SECURE ACCESS</span>
              </div>
            </div>

            <h1 className="cmd-card-title">PLATFORM ACCESS</h1>
            <p className="cmd-card-instructions">
              Enter your credentials to access the platform. Use <code>demo</code> / <code>demo</code> for instant access.
            </p>

            {/* 4 Demo Roles Grid */}
            <div className="cmd-demo-section-label">
              SELECT DEMO USER ACCOUNT (4 ROLES AVAILABLE):
            </div>
            <div className="cmd-demo-grid">
              {DEMO_ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  className={`cmd-demo-card ${selectedRole === acc.id ? "active" : ""}`}
                  onClick={() => selectDemoAccount(acc)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") selectDemoAccount(acc);
                  }}
                >
                  <div className="cmd-demo-top-row">
                    <span className="cmd-demo-name">{acc.name}</span>
                    <span className={`cmd-demo-role-pill ${acc.rolePillClass}`}>{acc.role}</span>
                  </div>
                  <div className="cmd-demo-email">{acc.email}</div>
                </div>
              ))}
            </div>

            {/* Real Login Error Banner */}
            {error && (
              <div className="cmd-error-banner" role="alert">
                ✕ {error}
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSignIn}>
              {/* Username / Email */}
              <div className="cmd-input-group">
                <label htmlFor="login-email" className="cmd-input-label">
                  USERNAME / EMAIL ADDRESS
                </label>
                <div className="cmd-input-box">
                  <span className="cmd-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="login-email"
                    autoComplete="username"
                    placeholder="demo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="cmd-text-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="cmd-input-group">
                <label htmlFor="login-password" className="cmd-input-label">
                  PASSWORD
                </label>
                <div className="cmd-input-box">
                  <span className="cmd-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="login-password"
                    autoComplete="current-password"
                    placeholder="••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="cmd-text-input"
                  />
                  <button
                    type="button"
                    className="cmd-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="cmd-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="cmd-spinner" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <span className="cmd-btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Indicator */}
            <div className="cmd-security-line">
              <span className="cmd-security-dot" />
              <span>SECURE CONNECTION • TLS ENCRYPTED</span>
            </div>

            <p className="cmd-console-footer">
              Access is governed by role-based permissions. Contact your administrator if you cannot sign in.
            </p>
          </div>
        </div>
      </main>

      {/* ─── BOTTOM BAR: SOVEREIGN SEAL & HORIZONTAL TRUST PIPELINE ─── */}
      <footer className="cmd-bottom-bar">
        {/* Bottom Left Sovereign Defence Seal Badge */}
        <div className="cmd-defence-seal">
          <div className="cmd-seal-emblem">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <circle cx="12" cy="11" r="3" />
            </svg>
          </div>
          <div className="cmd-seal-text">
            <span className="cmd-seal-title">DEFENCE ASSET TRUST</span>
            <span className="cmd-seal-sub">SOVEREIGN • SECURE • TRANSPARENT</span>
          </div>
        </div>

        {/* Bottom Center Trust Pipeline */}
        <div className="cmd-trust-pipeline">
          <div className="cmd-pipeline-track">
            <div className="cmd-pipeline-light-sweep" />
          </div>

          <div className="cmd-pipeline-node">
            <div className="cmd-pipeline-node-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <path d="M7 12h10M12 7v10" />
              </svg>
            </div>
            <span className="cmd-pipeline-node-title">ASSET</span>
            <span className="cmd-pipeline-node-sub">REGISTRATION</span>
          </div>

          <div className="cmd-pipeline-node">
            <div className="cmd-pipeline-node-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="cmd-pipeline-node-title">VERIFICATION</span>
            <span className="cmd-pipeline-node-sub">ON BLOCKCHAIN</span>
          </div>

          <div className="cmd-pipeline-node">
            <div className="cmd-pipeline-node-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="cmd-pipeline-node-title">EVIDENCE</span>
            <span className="cmd-pipeline-node-sub">INTEGRITY</span>
          </div>

          <div className="cmd-pipeline-node">
            <div className="cmd-pipeline-node-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <span className="cmd-pipeline-node-title">TRUST</span>
            <span className="cmd-pipeline-node-sub">ASSURED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
